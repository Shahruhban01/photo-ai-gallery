import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, getProfile, updateProfile } from '../controllers';
import { authenticate, validate, authLimiter, apiLimiter } from '../middleware';

const router = Router();

// Signup
router.post(
  '/signup',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
  ],
  validate,
  signup
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Get profile (protected)
router.get('/profile', apiLimiter, authenticate, getProfile);

// Update profile (protected)
router.put(
  '/profile',
  apiLimiter,
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
  ],
  validate,
  updateProfile
);

export default router;
