import { Response } from 'express';
import { Album, Photo } from '../models';
import { AuthRequest } from '../middleware';

export const createAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.userId!;

    const album = new Album({
      userId,
      name,
      description,
    });

    await album.save();

    res.status(201).json({
      message: 'Album created successfully',
      album: {
        id: album._id,
        name: album.name,
        description: album.description,
        photoCount: album.photoCount,
        createdAt: album.createdAt,
      },
    });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ message: 'Error creating album' });
  }
};

export const getAlbums = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const albums = await Album.find({ userId })
      .sort({ createdAt: -1 })
      .populate('coverPhotoId');

    res.json({
      albums: albums.map((album) => ({
        id: album._id,
        name: album.name,
        description: album.description,
        photoCount: album.photoCount,
        coverPhoto: album.coverPhotoId
          ? `/api/photos/${album.coverPhotoId}/thumbnail`
          : null,
        isShared: album.isShared,
        createdAt: album.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ message: 'Error fetching albums' });
  }
};

export const getAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const album = await Album.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    const photos = await Photo.find({
      albumId: album._id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json({
      album: {
        id: album._id,
        name: album.name,
        description: album.description,
        photoCount: album.photoCount,
        isShared: album.isShared,
        createdAt: album.createdAt,
      },
      photos: photos.map((photo) => ({
        id: photo._id,
        filename: photo.filename,
        originalName: photo.originalName,
        thumbnailUrl: `/api/photos/${photo._id}/thumbnail`,
        url: `/api/photos/${photo._id}`,
        width: photo.width,
        height: photo.height,
        isFavorite: photo.isFavorite,
        createdAt: photo.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ message: 'Error fetching album' });
  }
};

export const updateAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, coverPhotoId, isShared } = req.body;

    const album = await Album.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description, coverPhotoId, isShared },
      { new: true, runValidators: true }
    );

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    res.json({
      message: 'Album updated successfully',
      album: {
        id: album._id,
        name: album.name,
        description: album.description,
        isShared: album.isShared,
      },
    });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({ message: 'Error updating album' });
  }
};

export const deleteAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const album = await Album.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    // Remove album reference from photos
    await Photo.updateMany(
      { albumId: album._id },
      { $unset: { albumId: '' } }
    );

    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ message: 'Error deleting album' });
  }
};

export const addPhotosToAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { photoIds } = req.body;
    const albumId = req.params.id;

    const album = await Album.findOne({
      _id: albumId,
      userId: req.userId,
    });

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    await Photo.updateMany(
      { _id: { $in: photoIds }, userId: req.userId },
      { albumId }
    );

    // Update photo count
    const photoCount = await Photo.countDocuments({ albumId, isDeleted: false });
    album.photoCount = photoCount;
    await album.save();

    res.json({
      message: 'Photos added to album successfully',
      photoCount,
    });
  } catch (error) {
    console.error('Add photos to album error:', error);
    res.status(500).json({ message: 'Error adding photos to album' });
  }
};

export const removePhotosFromAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { photoIds } = req.body;
    const albumId = req.params.id;

    const album = await Album.findOne({
      _id: albumId,
      userId: req.userId,
    });

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    await Photo.updateMany(
      { _id: { $in: photoIds }, albumId },
      { $unset: { albumId: '' } }
    );

    // Update photo count
    const photoCount = await Photo.countDocuments({ albumId, isDeleted: false });
    album.photoCount = photoCount;
    await album.save();

    res.json({
      message: 'Photos removed from album successfully',
      photoCount,
    });
  } catch (error) {
    console.error('Remove photos from album error:', error);
    res.status(500).json({ message: 'Error removing photos from album' });
  }
};
