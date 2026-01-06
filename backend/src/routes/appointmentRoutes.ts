import { Router } from 'express';
import { body } from 'express-validator';
import * as appointmentController from '../controllers/appointmentController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('dentistId').isUUID().withMessage('Valid dentist ID is required'),
    body('appointmentDate').isISO8601().withMessage('Valid date is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
    validate,
  ],
  appointmentController.createAppointment
);

router.get('/', appointmentController.getAppointments);
router.get('/available-slots', appointmentController.getAvailableSlots);
router.get('/:id', appointmentController.getAppointmentById);

router.put(
  '/:id',
  authorize(UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN),
  appointmentController.updateAppointment
);

router.delete('/:id/cancel', appointmentController.cancelAppointment);

export default router;
