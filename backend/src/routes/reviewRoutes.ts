import { Router } from 'express';
import { body } from 'express-validator';
import * as reviewController from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.PATIENT),
  [
    body('dentistId').isUUID().withMessage('Valid dentist ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    validate,
  ],
  reviewController.createReview
);

router.get('/dentist/:dentistId', reviewController.getDentistReviews);

export default router;
