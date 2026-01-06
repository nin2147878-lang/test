import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.id;
    const { dentistId, rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const dentistCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND (role = $2 OR role = $3)',
      [dentistId, UserRole.DENTIST, UserRole.HYGIENIST]
    );

    if (dentistCheck.rows.length === 0) {
      throw new AppError('Invalid dentist ID', 400);
    }

    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE patient_id = $1 AND dentist_id = $2',
      [patientId, dentistId]
    );

    if (existingReview.rows.length > 0) {
      const result = await pool.query(
        'UPDATE reviews SET rating = $1, comment = $2 WHERE patient_id = $3 AND dentist_id = $4 RETURNING *',
        [rating, comment, patientId, dentistId]
      );
      return res.json(result.rows[0]);
    }

    const result = await pool.query(
      'INSERT INTO reviews (patient_id, dentist_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [patientId, dentistId, rating, comment || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const getDentistReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { dentistId } = req.params;

    const result = await pool.query(
      `SELECT r.*, p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM reviews r
       JOIN users p ON r.patient_id = p.id
       WHERE r.dentist_id = $1
       ORDER BY r.created_at DESC`,
      [dentistId]
    );

    const avgResult = await pool.query(
      'SELECT AVG(rating)::numeric(10,2) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE dentist_id = $1',
      [dentistId]
    );

    res.json({
      reviews: result.rows,
      averageRating: parseFloat(avgResult.rows[0].average_rating) || 0,
      totalReviews: parseInt(avgResult.rows[0].total_reviews),
    });
  } catch (error) {
    throw error;
  }
};
