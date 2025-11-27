import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Photo, Face } from '../models';
import { AuthRequest } from '../middleware';
import { config } from '../config';
import { FaceRecognitionService } from '../services/faceRecognition';

const faceService = new FaceRecognitionService();

export const uploadPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const userId = req.userId!;
    const uploadedPhotos = [];

    for (const file of files) {
      // Get image metadata
      const metadata = await sharp(file.path).metadata();
      
      // Create thumbnail
      const thumbnailDir = path.join(config.uploadDir, userId, 'thumbnails');
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      
      const thumbnailFilename = `thumb_${file.filename}`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
      
      await sharp(file.path)
        .resize(300, 300, { fit: 'cover' })
        .toFile(thumbnailPath);

      // Create photo record
      const photo = new Photo({
        userId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        thumbnailPath,
        width: metadata.width,
        height: metadata.height,
        albumId: req.body.albumId || null,
        tags: req.body.tags ? req.body.tags.split(',').map((t: string) => t.trim()) : [],
      });

      await photo.save();

      // Process face detection in background
      processFaceDetection(photo._id.toString(), file.path, userId);

      uploadedPhotos.push({
        id: photo._id,
        filename: photo.filename,
        originalName: photo.originalName,
        thumbnailUrl: `/api/photos/${photo._id}/thumbnail`,
        url: `/api/photos/${photo._id}`,
        width: photo.width,
        height: photo.height,
        createdAt: photo.createdAt,
      });
    }

    res.status(201).json({
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading photos' });
  }
};

const processFaceDetection = async (
  photoId: string,
  imagePath: string,
  userId: string
): Promise<void> => {
  try {
    const faces = await faceService.detectFaces(imagePath);
    
    for (const face of faces) {
      const faceDoc = new Face({
        userId,
        photoId,
        descriptor: Array.from(face.descriptor),
        boundingBox: face.boundingBox,
        confidence: face.confidence,
      });
      
      await faceDoc.save();
      
      // Update photo with face reference
      await Photo.findByIdAndUpdate(photoId, {
        $push: { faces: faceDoc._id },
      });
    }
    
    console.log(`Processed ${faces.length} faces for photo ${photoId}`);
  } catch (error) {
    console.error(`Face detection error for photo ${photoId}:`, error);
  }
};

export const getPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { userId, isDeleted: false };
    
    if (req.query.albumId) {
      query.albumId = req.query.albumId;
    }
    
    if (req.query.favorite === 'true') {
      query.isFavorite = true;
    }

    const [photos, total] = await Promise.all([
      Photo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('faces'),
      Photo.countDocuments(query),
    ]);

    res.json({
      photos: photos.map((photo) => ({
        id: photo._id,
        filename: photo.filename,
        originalName: photo.originalName,
        thumbnailUrl: `/api/photos/${photo._id}/thumbnail`,
        url: `/api/photos/${photo._id}`,
        width: photo.width,
        height: photo.height,
        isFavorite: photo.isFavorite,
        faceCount: photo.faces.length,
        tags: photo.tags,
        createdAt: photo.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: 'Error fetching photos' });
  }
};

export const getPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    }).populate('faces');

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    res.json({
      photo: {
        id: photo._id,
        filename: photo.filename,
        originalName: photo.originalName,
        url: `/api/photos/${photo._id}/image`,
        thumbnailUrl: `/api/photos/${photo._id}/thumbnail`,
        width: photo.width,
        height: photo.height,
        size: photo.size,
        mimeType: photo.mimeType,
        isFavorite: photo.isFavorite,
        faces: photo.faces,
        tags: photo.tags,
        albumId: photo.albumId,
        createdAt: photo.createdAt,
      },
    });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ message: 'Error fetching photo' });
  }
};

export const getPhotoImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    });

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    if (!fs.existsSync(photo.path)) {
      res.status(404).json({ message: 'Image file not found' });
      return;
    }

    res.sendFile(photo.path);
  } catch (error) {
    console.error('Get photo image error:', error);
    res.status(500).json({ message: 'Error fetching image' });
  }
};

export const getPhotoThumbnail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    });

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    const thumbnailPath = photo.thumbnailPath || photo.path;

    if (!fs.existsSync(thumbnailPath)) {
      res.status(404).json({ message: 'Thumbnail not found' });
      return;
    }

    res.sendFile(thumbnailPath);
  } catch (error) {
    console.error('Get thumbnail error:', error);
    res.status(500).json({ message: 'Error fetching thumbnail' });
  }
};

export const updatePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isFavorite, tags, albumId } = req.body;
    
    const photo = await Photo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, isDeleted: false },
      { isFavorite, tags, albumId },
      { new: true }
    );

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    res.json({
      message: 'Photo updated successfully',
      photo: {
        id: photo._id,
        isFavorite: photo.isFavorite,
        tags: photo.tags,
        albumId: photo.albumId,
      },
    });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ message: 'Error updating photo' });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photo = await Photo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: true },
      { new: true }
    );

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Error deleting photo' });
  }
};

export const searchPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { query, personId, startDate, endDate, albumId } = req.query;
    
    const filter: Record<string, unknown> = { userId, isDeleted: false };
    
    if (query) {
      filter.$or = [
        { tags: { $regex: query, $options: 'i' } },
        { originalName: { $regex: query, $options: 'i' } },
      ];
    }
    
    if (personId) {
      const faceIds = await Face.find({ personId }).distinct('photoId');
      filter._id = { $in: faceIds };
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
      }
    }
    
    if (albumId) {
      filter.albumId = albumId;
    }

    const photos = await Photo.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      photos: photos.map((photo) => ({
        id: photo._id,
        filename: photo.filename,
        originalName: photo.originalName,
        thumbnailUrl: `/api/photos/${photo._id}/thumbnail`,
        url: `/api/photos/${photo._id}`,
        width: photo.width,
        height: photo.height,
        isFavorite: photo.isFavorite,
        tags: photo.tags,
        createdAt: photo.createdAt,
      })),
    });
  } catch (error) {
    console.error('Search photos error:', error);
    res.status(500).json({ message: 'Error searching photos' });
  }
};
