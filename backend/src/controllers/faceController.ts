import { Response } from 'express';
import { Face, Person, Photo } from '../models';
import { AuthRequest } from '../middleware';
import { FaceRecognitionService } from '../services/faceRecognition';

const faceService = new FaceRecognitionService();

export const getPersons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const persons = await Person.find({ userId })
      .sort({ faceCount: -1 })
      .populate('representativeFaceId');

    res.json({
      persons: await Promise.all(
        persons.map(async (person) => {
          const face = await Face.findById(person.representativeFaceId);
          return {
            id: person._id,
            name: person.name,
            faceCount: person.faceCount,
            thumbnailUrl: face?.photoId
              ? `/api/photos/${face.photoId}/thumbnail`
              : null,
            createdAt: person.createdAt,
          };
        })
      ),
    });
  } catch (error) {
    console.error('Get persons error:', error);
    res.status(500).json({ message: 'Error fetching persons' });
  }
};

export const getPerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!person) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    // Get all photos containing this person
    const faces = await Face.find({ personId: person._id });
    const photoIds = [...new Set(faces.map((f) => f.photoId.toString()))];
    
    const photos = await Photo.find({
      _id: { $in: photoIds },
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json({
      person: {
        id: person._id,
        name: person.name,
        faceCount: person.faceCount,
        createdAt: person.createdAt,
      },
      photos: photos.map((photo) => ({
        id: photo._id,
        filename: photo.filename,
        thumbnailUrl: `/api/photos/${photo._id}/thumbnail`,
        url: `/api/photos/${photo._id}`,
        width: photo.width,
        height: photo.height,
        createdAt: photo.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get person error:', error);
    res.status(500).json({ message: 'Error fetching person' });
  }
};

export const updatePerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    const person = await Person.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name },
      { new: true, runValidators: true }
    );

    if (!person) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    res.json({
      message: 'Person updated successfully',
      person: {
        id: person._id,
        name: person.name,
      },
    });
  } catch (error) {
    console.error('Update person error:', error);
    res.status(500).json({ message: 'Error updating person' });
  }
};

export const mergePeople = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sourcePersonId, targetPersonId } = req.body;
    const userId = req.userId!;

    const [sourcePerson, targetPerson] = await Promise.all([
      Person.findOne({ _id: sourcePersonId, userId }),
      Person.findOne({ _id: targetPersonId, userId }),
    ]);

    if (!sourcePerson || !targetPerson) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    // Move all faces from source to target
    await Face.updateMany(
      { personId: sourcePersonId },
      { personId: targetPersonId }
    );

    // Update target face count
    const faceCount = await Face.countDocuments({ personId: targetPersonId });
    targetPerson.faceCount = faceCount;
    await targetPerson.save();

    // Delete source person
    await Person.findByIdAndDelete(sourcePersonId);

    res.json({
      message: 'Persons merged successfully',
      person: {
        id: targetPerson._id,
        name: targetPerson.name,
        faceCount,
      },
    });
  } catch (error) {
    console.error('Merge people error:', error);
    res.status(500).json({ message: 'Error merging people' });
  }
};

export const clusterFaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get all unassigned faces
    const faces = await Face.find({ userId, personId: null });

    if (faces.length === 0) {
      res.json({ message: 'No unassigned faces to cluster', clustersCreated: 0 });
      return;
    }

    // Group faces by similarity
    const clusters = await faceService.clusterFaces(
      faces.map((f) => ({
        id: f._id.toString(),
        descriptor: f.descriptor,
      }))
    );

    let personsCreated = 0;

    for (const cluster of clusters) {
      if (cluster.faceIds.length >= 2) {
        // Create a new person for this cluster
        const person = new Person({
          userId,
          name: `Person ${personsCreated + 1}`,
          faceCount: cluster.faceIds.length,
        });

        await person.save();

        // Assign faces to this person
        await Face.updateMany(
          { _id: { $in: cluster.faceIds } },
          { personId: person._id }
        );

        // Set representative face
        const firstFace = await Face.findById(cluster.faceIds[0]);
        if (firstFace) {
          person.representativeFaceId = firstFace._id;
          await person.save();
        }

        personsCreated++;
      }
    }

    res.json({
      message: 'Face clustering completed',
      clustersCreated: personsCreated,
      totalFacesProcessed: faces.length,
    });
  } catch (error) {
    console.error('Cluster faces error:', error);
    res.status(500).json({ message: 'Error clustering faces' });
  }
};

export const assignFaceToPerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { faceId, personId } = req.body;
    const userId = req.userId!;

    const face = await Face.findOne({ _id: faceId, userId });
    if (!face) {
      res.status(404).json({ message: 'Face not found' });
      return;
    }

    const person = await Person.findOne({ _id: personId, userId });
    if (!person) {
      res.status(404).json({ message: 'Person not found' });
      return;
    }

    // Remove from old person if any
    if (face.personId) {
      const oldPerson = await Person.findById(face.personId);
      if (oldPerson) {
        oldPerson.faceCount = Math.max(0, oldPerson.faceCount - 1);
        await oldPerson.save();
      }
    }

    // Assign to new person
    face.personId = person._id;
    await face.save();

    person.faceCount += 1;
    await person.save();

    res.json({
      message: 'Face assigned to person successfully',
      face: { id: face._id, personId: person._id },
    });
  } catch (error) {
    console.error('Assign face error:', error);
    res.status(500).json({ message: 'Error assigning face' });
  }
};
