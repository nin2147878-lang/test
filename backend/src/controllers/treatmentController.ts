import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, TreatmentStatus, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getTreatmentPlans = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user!;
    const { patientId, status } = req.query;

    let query = `
      SELECT tp.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             d.first_name as dentist_first_name, d.last_name as dentist_last_name
      FROM treatment_plans tp
      JOIN users p ON tp.patient_id = p.id
      JOIN users d ON tp.dentist_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (role === UserRole.PATIENT) {
      query += ` AND tp.patient_id = $${paramCount}`;
      params.push(id);
      paramCount++;
    } else if (patientId) {
      query += ` AND tp.patient_id = $${paramCount}`;
      params.push(patientId);
      paramCount++;
    }

    if (status) {
      query += ` AND tp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY tp.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
};

export const getTreatmentPlanById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT tp.*, 
              p.first_name as patient_first_name, p.last_name as patient_last_name,
              p.email as patient_email, p.phone as patient_phone,
              d.first_name as dentist_first_name, d.last_name as dentist_last_name
       FROM treatment_plans tp
       JOIN users p ON tp.patient_id = p.id
       JOIN users d ON tp.dentist_id = d.id
       WHERE tp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Treatment plan not found', 404);
    }

    const treatmentPlan = result.rows[0];

    if (userRole === UserRole.PATIENT && treatmentPlan.patient_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const steps = await pool.query(
      'SELECT * FROM treatment_steps WHERE treatment_plan_id = $1 ORDER BY step_number',
      [id]
    );

    res.json({
      ...treatmentPlan,
      steps: steps.rows,
    });
  } catch (error) {
    throw error;
  }
};

export const createTreatmentPlan = async (req: AuthRequest, res: Response) => {
  try {
    const dentistId = req.user!.id;
    const {
      patientId,
      title,
      description,
      startDate,
      endDate,
      estimatedCost,
      steps,
    } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const planResult = await client.query(
        `INSERT INTO treatment_plans (patient_id, dentist_id, title, description, start_date, end_date, estimated_cost, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          patientId,
          dentistId,
          title,
          description,
          startDate,
          endDate || null,
          estimatedCost,
          TreatmentStatus.PLANNED,
        ]
      );

      const treatmentPlan = planResult.rows[0];

      if (steps && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          await client.query(
            `INSERT INTO treatment_steps (treatment_plan_id, step_number, description)
             VALUES ($1, $2, $3)`,
            [treatmentPlan.id, i + 1, steps[i].description]
          );
        }
      }

      await client.query('COMMIT');

      const fullPlan = await pool.query(
        `SELECT tp.*, 
                (SELECT json_agg(ts ORDER BY ts.step_number)
                 FROM treatment_steps ts
                 WHERE ts.treatment_plan_id = tp.id) as steps
         FROM treatment_plans tp
         WHERE tp.id = $1`,
        [treatmentPlan.id]
      );

      res.status(201).json(fullPlan.rows[0]);
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

export const updateTreatmentPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, endDate, estimatedCost } = req.body;

    const result = await pool.query(
      `UPDATE treatment_plans SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        end_date = COALESCE($4, end_date),
        estimated_cost = COALESCE($5, estimated_cost)
       WHERE id = $6
       RETURNING *`,
      [title, description, status, endDate, estimatedCost, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Treatment plan not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const updateTreatmentStep = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, stepId } = req.params;
    const { completed, completedDate, notes } = req.body;

    const result = await pool.query(
      `UPDATE treatment_steps SET
        completed = COALESCE($1, completed),
        completed_date = COALESCE($2, completed_date),
        notes = COALESCE($3, notes)
       WHERE id = $4 AND treatment_plan_id = $5
       RETURNING *`,
      [completed, completedDate, notes, stepId, planId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Treatment step not found', 404);
    }

    const allSteps = await pool.query(
      'SELECT completed FROM treatment_steps WHERE treatment_plan_id = $1',
      [planId]
    );

    const allCompleted = allSteps.rows.every((step) => step.completed);

    if (allCompleted) {
      await pool.query(
        'UPDATE treatment_plans SET status = $1 WHERE id = $2',
        [TreatmentStatus.COMPLETED, planId]
      );
    } else {
      const anyCompleted = allSteps.rows.some((step) => step.completed);
      if (anyCompleted) {
        await pool.query(
          'UPDATE treatment_plans SET status = $1 WHERE id = $2',
          [TreatmentStatus.IN_PROGRESS, planId]
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};
