import { Router } from 'express';
import { body } from 'express-validator';
import {
  createAlbum,
  getAlbums,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotosToAlbum,
  removePhotosFromAlbum,
} from '../controllers';
import { authenticate, validate, apiLimiter } from '../middleware';

const router = Router();

// Rate limiting comes first, then authentication
router.use(apiLimiter);
router.use(authenticate);

// Create album
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Album name is required')
      .isLength({ max: 100 })
      .withMessage('Album name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  validate,
  createAlbum
);

// Get all albums
router.get('/', getAlbums);

// Get single album with photos
router.get('/:id', getAlbum);

// Update album
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Album name cannot exceed 100 characters'),
  ],
  validate,
  updateAlbum
);

// Delete album
router.delete('/:id', deleteAlbum);

// Add photos to album
router.post(
  '/:id/photos',
  [
    body('photoIds')
      .isArray({ min: 1 })
      .withMessage('At least one photo ID is required'),
  ],
  validate,
  addPhotosToAlbum
);

// Remove photos from album
router.delete(
  '/:id/photos',
  [
    body('photoIds')
      .isArray({ min: 1 })
      .withMessage('At least one photo ID is required'),
  ],
  validate,
  removePhotosFromAlbum
);

export default router;
