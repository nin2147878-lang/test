import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, PaymentStatus, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user!;
    const { patientId, status } = req.query;

    let query = `
      SELECT i.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             p.email as patient_email
      FROM invoices i
      JOIN users p ON i.patient_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (role === UserRole.PATIENT) {
      query += ` AND i.patient_id = $${paramCount}`;
      params.push(id);
      paramCount++;
    } else if (patientId) {
      query += ` AND i.patient_id = $${paramCount}`;
      params.push(patientId);
      paramCount++;
    }

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT i.*, 
              p.first_name as patient_first_name, p.last_name as patient_last_name,
              p.email as patient_email, p.phone as patient_phone,
              p.address, p.city, p.state, p.zip_code
       FROM invoices i
       JOIN users p ON i.patient_id = p.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invoice not found', 404);
    }

    const invoice = result.rows[0];

    if (userRole === UserRole.PATIENT && invoice.patient_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const payments = await pool.query(
      'SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC',
      [id]
    );

    res.json({
      ...invoice,
      payments: payments.rows,
    });
  } catch (error) {
    throw error;
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      appointmentId,
      treatmentPlanId,
      amount,
      dueDate,
      description,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO invoices (patient_id, appointment_id, treatment_plan_id, amount, due_date, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        patientId,
        appointmentId || null,
        treatmentPlanId || null,
        amount,
        dueDate,
        description,
        PaymentStatus.PENDING,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, dueDate, description, status } = req.body;

    const result = await pool.query(
      `UPDATE invoices SET
        amount = COALESCE($1, amount),
        due_date = COALESCE($2, due_date),
        description = COALESCE($3, description),
        status = COALESCE($4, status)
       WHERE id = $5
       RETURNING *`,
      [amount, dueDate, description, status, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invoice not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { invoiceId, amount, paymentMethod, transactionId, paymentDate, notes } = req.body;

    const invoice = await pool.query(
      'SELECT amount, paid_amount FROM invoices WHERE id = $1',
      [invoiceId]
    );

    if (invoice.rows.length === 0) {
      throw new AppError('Invoice not found', 404);
    }

    const { amount: totalAmount, paid_amount: paidAmount } = invoice.rows[0];
    const newPaidAmount = parseFloat(paidAmount) + parseFloat(amount);

    if (newPaidAmount > parseFloat(totalAmount)) {
      throw new AppError('Payment amount exceeds invoice total', 400);
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const paymentResult = await client.query(
        `INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, payment_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [invoiceId, amount, paymentMethod, transactionId || null, paymentDate, notes || null]
      );

      let newStatus = PaymentStatus.PARTIALLY_PAID;
      let paidDate = null;

      if (newPaidAmount >= parseFloat(totalAmount)) {
        newStatus = PaymentStatus.PAID;
        paidDate = paymentDate;
      }

      await client.query(
        'UPDATE invoices SET paid_amount = $1, status = $2, paid_date = $3 WHERE id = $4',
        [newPaidAmount, newStatus, paidDate, invoiceId]
      );

      await client.query('COMMIT');

      res.status(201).json(paymentResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw error;
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user!;
    const { patientId } = req.query;

    let query = `
      SELECT p.*, i.description as invoice_description, i.amount as invoice_amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (role === UserRole.PATIENT) {
      query += ` AND i.patient_id = $${paramCount}`;
      params.push(id);
      paramCount++;
    } else if (patientId) {
      query += ` AND i.patient_id = $${paramCount}`;
      params.push(patientId);
      paramCount++;
    }

    query += ' ORDER BY p.payment_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
};
