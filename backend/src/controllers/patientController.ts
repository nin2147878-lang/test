import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT id, email, first_name, last_name, phone, date_of_birth,
             insurance_provider, created_at
      FROM users
      WHERE role = $1
    `;
    const params: any[] = [UserRole.PATIENT];
    let paramCount = 2;

    if (search) {
      query += ` AND (
        LOWER(first_name) LIKE LOWER($${paramCount}) OR
        LOWER(last_name) LIKE LOWER($${paramCount}) OR
        LOWER(email) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY last_name, first_name LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, date_of_birth,
              address, city, state, zip_code, emergency_contact_name,
              emergency_contact_phone, insurance_provider, insurance_policy_number,
              created_at, updated_at
       FROM users
       WHERE id = $1 AND role = $2`,
      [id, UserRole.PATIENT]
    );

    if (result.rows.length === 0) {
      throw new AppError('Patient not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const getMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole === UserRole.PATIENT && id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const result = await pool.query(
      'SELECT * FROM medical_records WHERE patient_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const newRecord = await pool.query(
        'INSERT INTO medical_records (patient_id) VALUES ($1) RETURNING *',
        [id]
      );
      return res.json(newRecord.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { allergies, medications, medicalConditions, bloodType, notes } = req.body;

    const result = await pool.query(
      `UPDATE medical_records SET
        allergies = COALESCE($1, allergies),
        medications = COALESCE($2, medications),
        medical_conditions = COALESCE($3, medical_conditions),
        blood_type = COALESCE($4, blood_type),
        notes = COALESCE($5, notes)
       WHERE patient_id = $6
       RETURNING *`,
      [allergies, medications, medicalConditions, bloodType, notes, id]
    );

    if (result.rows.length === 0) {
      const newRecord = await pool.query(
        `INSERT INTO medical_records (patient_id, allergies, medications, medical_conditions, blood_type, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, allergies, medications, medicalConditions, bloodType, notes]
      );
      return res.json(newRecord.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const getDentalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole === UserRole.PATIENT && id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const result = await pool.query(
      `SELECT dr.*, d.first_name as dentist_first_name, d.last_name as dentist_last_name
       FROM dental_records dr
       JOIN users d ON dr.dentist_id = d.id
       WHERE dr.patient_id = $1
       ORDER BY dr.visit_date DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    throw error;
  }
};

export const createDentalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dentistId = req.user!.id;
    const { visitDate, diagnosis, treatment, toothNumber, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO dental_records (patient_id, dentist_id, visit_date, diagnosis, treatment, tooth_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, dentistId, visitDate, diagnosis, treatment, toothNumber || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const getDentists = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone
       FROM users
       WHERE role = $1 OR role = $2
       ORDER BY last_name, first_name`,
      [UserRole.DENTIST, UserRole.HYGIENIST]
    );

    res.json(result.rows);
  } catch (error) {
    throw error;
  }
};
