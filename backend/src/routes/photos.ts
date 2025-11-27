import { Router } from 'express';
import {
  uploadPhotos,
  getPhotos,
  getPhoto,
  getPhotoImage,
  getPhotoThumbnail,
  updatePhoto,
  deletePhoto,
  searchPhotos,
} from '../controllers';
import { authenticate, upload } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload photos
router.post('/upload', upload.array('photos', 20), uploadPhotos);

// Get all photos
router.get('/', getPhotos);

// Search photos
router.get('/search', searchPhotos);

// Get single photo details
router.get('/:id', getPhoto);

// Get photo image file
router.get('/:id/image', getPhotoImage);

// Get photo thumbnail
router.get('/:id/thumbnail', getPhotoThumbnail);

// Update photo
router.put('/:id', updatePhoto);

// Delete photo
router.delete('/:id', deletePhoto);

export default router;
