import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      emergencyContactName,
      emergencyContactPhone,
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (
        email, password, role, first_name, last_name, phone,
        date_of_birth, address, city, state, zip_code,
        emergency_contact_name, emergency_contact_phone,
        insurance_provider, insurance_policy_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, email, role, first_name, last_name, phone, created_at`,
      [
        email,
        hashedPassword,
        UserRole.PATIENT,
        firstName,
        lastName,
        phone,
        dateOfBirth || null,
        address || null,
        city || null,
        state || null,
        zipCode || null,
        emergencyContactName || null,
        emergencyContactPhone || null,
        insuranceProvider || null,
        insurancePolicyNumber || null,
      ]
    );

    const user = result.rows[0];

    await pool.query(
      'INSERT INTO medical_records (patient_id) VALUES ($1)',
      [user.id]
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password, role, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, date_of_birth,
       address, city, state, zip_code, emergency_contact_name,
       emergency_contact_phone, insurance_provider, insurance_policy_number,
       created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      emergencyContactName,
      emergencyContactPhone,
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        date_of_birth = COALESCE($4, date_of_birth),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        zip_code = COALESCE($8, zip_code),
        emergency_contact_name = COALESCE($9, emergency_contact_name),
        emergency_contact_phone = COALESCE($10, emergency_contact_phone),
        insurance_provider = COALESCE($11, insurance_provider),
        insurance_policy_number = COALESCE($12, insurance_policy_number)
      WHERE id = $13
      RETURNING id, email, role, first_name, last_name, phone, date_of_birth,
                address, city, state, zip_code, emergency_contact_name,
                emergency_contact_phone, insurance_provider, insurance_policy_number`,
      [
        firstName,
        lastName,
        phone,
        dateOfBirth,
        address,
        city,
        state,
        zipCode,
        emergencyContactName,
        emergencyContactPhone,
        insuranceProvider,
        insurancePolicyNumber,
        userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};
