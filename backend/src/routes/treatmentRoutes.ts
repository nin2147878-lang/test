import { Router } from 'express';
import { body } from 'express-validator';
import * as treatmentController from '../controllers/treatmentController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', treatmentController.getTreatmentPlans);
router.get('/:id', treatmentController.getTreatmentPlanById);

router.post(
  '/',
  authorize(UserRole.DENTIST, UserRole.ADMIN),
  [
    body('patientId').isUUID().withMessage('Valid patient ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('estimatedCost').isNumeric().withMessage('Valid cost is required'),
    validate,
  ],
  treatmentController.createTreatmentPlan
);

router.put(
  '/:id',
  authorize(UserRole.DENTIST, UserRole.ADMIN),
  treatmentController.updateTreatmentPlan
);

router.put(
  '/:planId/steps/:stepId',
  authorize(UserRole.DENTIST, UserRole.HYGIENIST, UserRole.ADMIN),
  treatmentController.updateTreatmentStep
);

export default router;
