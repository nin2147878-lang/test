import { Router } from 'express';
import { body } from 'express-validator';
import * as billingController from '../controllers/billingController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', billingController.getInvoices);
router.get('/payments', billingController.getPaymentHistory);
router.get('/:id', billingController.getInvoiceById);

router.post(
  '/',
  authorize(UserRole.DENTIST, UserRole.RECEPTIONIST, UserRole.ADMIN),
  [
    body('patientId').isUUID().withMessage('Valid patient ID is required'),
    body('amount').isNumeric().withMessage('Valid amount is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('description').notEmpty().withMessage('Description is required'),
    validate,
  ],
  billingController.createInvoice
);

router.put(
  '/:id',
  authorize(UserRole.RECEPTIONIST, UserRole.ADMIN),
  billingController.updateInvoice
);

router.post(
  '/payments',
  authorize(UserRole.RECEPTIONIST, UserRole.ADMIN),
  [
    body('invoiceId').isUUID().withMessage('Valid invoice ID is required'),
    body('amount').isNumeric().withMessage('Valid amount is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('paymentDate').isISO8601().withMessage('Valid payment date is required'),
    validate,
  ],
  billingController.createPayment
);

export default router;
