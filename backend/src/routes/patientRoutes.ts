import { Router } from 'express';
import * as patientController from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN),
  patientController.getPatients
);

router.get('/dentists', patientController.getDentists);

router.get(
  '/:id',
  authorize(UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN),
  patientController.getPatientById
);

router.get('/:id/medical-record', patientController.getMedicalRecord);

router.put(
  '/:id/medical-record',
  authorize(UserRole.DENTIST, UserRole.HYGIENIST, UserRole.ADMIN),
  patientController.updateMedicalRecord
);

router.get('/:id/dental-records', patientController.getDentalRecords);

router.post(
  '/:id/dental-records',
  authorize(UserRole.DENTIST, UserRole.HYGIENIST),
  patientController.createDentalRecord
);

export default router;
