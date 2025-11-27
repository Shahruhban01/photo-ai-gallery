import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPersons,
  getPerson,
  updatePerson,
  mergePeople,
  clusterFaces,
  assignFaceToPerson,
} from '../controllers';
import { authenticate, validate } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all persons
router.get('/persons', getPersons);

// Get single person with photos
router.get('/persons/:id', getPerson);

// Update person name
router.put(
  '/persons/:id',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
  ],
  validate,
  updatePerson
);

// Merge two people
router.post(
  '/persons/merge',
  [
    body('sourcePersonId').notEmpty().withMessage('Source person ID is required'),
    body('targetPersonId').notEmpty().withMessage('Target person ID is required'),
  ],
  validate,
  mergePeople
);

// Trigger face clustering
router.post('/cluster', clusterFaces);

// Assign face to person
router.post(
  '/assign',
  [
    body('faceId').notEmpty().withMessage('Face ID is required'),
    body('personId').notEmpty().withMessage('Person ID is required'),
  ],
  validate,
  assignFaceToPerson
);

export default router;
