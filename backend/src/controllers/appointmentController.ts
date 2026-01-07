import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, AppointmentStatus, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { dentistId, appointmentDate, durationMinutes, reason, notes } = req.body;
    const patientId = req.user!.role === UserRole.PATIENT ? req.user!.id : req.body.patientId;

    const dentistCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND (role = $2 OR role = $3)',
      [dentistId, UserRole.DENTIST, UserRole.HYGIENIST]
    );

    if (dentistCheck.rows.length === 0) {
      throw new AppError('Invalid dentist ID', 400);
    }

    const conflictCheck = await pool.query(
      `SELECT id FROM appointments 
       WHERE dentist_id = $1 
       AND appointment_date = $2 
       AND status NOT IN ($3, $4)`,
      [dentistId, appointmentDate, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
    );

    if (conflictCheck.rows.length > 0) {
      throw new AppError('Time slot is not available', 409);
    }

    const result = await pool.query(
      `INSERT INTO appointments (patient_id, dentist_id, appointment_date, duration_minutes, reason, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [patientId, dentistId, appointmentDate, durationMinutes || 30, reason, notes || null, AppointmentStatus.SCHEDULED]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user!;
    const { status, startDate, endDate } = req.query;

    let query = `
      SELECT a.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             d.first_name as dentist_first_name, d.last_name as dentist_last_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.dentist_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (role === UserRole.PATIENT) {
      query += ` AND a.patient_id = $${paramCount}`;
      params.push(id);
      paramCount++;
    } else if (role === UserRole.DENTIST || role === UserRole.HYGIENIST) {
      query += ` AND a.dentist_id = $${paramCount}`;
      params.push(id);
      paramCount++;
    }

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (startDate) {
      query += ` AND a.appointment_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND a.appointment_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' ORDER BY a.appointment_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT a.*, 
              p.first_name as patient_first_name, p.last_name as patient_last_name,
              p.email as patient_email, p.phone as patient_phone,
              d.first_name as dentist_first_name, d.last_name as dentist_last_name,
              d.email as dentist_email
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN users d ON a.dentist_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Appointment not found', 404);
    }

    const appointment = result.rows[0];

    if (
      userRole === UserRole.PATIENT &&
      appointment.patient_id !== userId
    ) {
      throw new AppError('Access denied', 403);
    }

    if (
      (userRole === UserRole.DENTIST || userRole === UserRole.HYGIENIST) &&
      appointment.dentist_id !== userId
    ) {
      throw new AppError('Access denied', 403);
    }

    res.json(appointment);
  } catch (error) {
    throw error;
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { appointmentDate, durationMinutes, reason, notes, status } = req.body;

    const existingAppointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (existingAppointment.rows.length === 0) {
      throw new AppError('Appointment not found', 404);
    }

    const result = await pool.query(
      `UPDATE appointments SET
        appointment_date = COALESCE($1, appointment_date),
        duration_minutes = COALESCE($2, duration_minutes),
        reason = COALESCE($3, reason),
        notes = COALESCE($4, notes),
        status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [appointmentDate, durationMinutes, reason, notes, status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const appointment = await pool.query(
      'SELECT patient_id, dentist_id FROM appointments WHERE id = $1',
      [id]
    );

    if (appointment.rows.length === 0) {
      throw new AppError('Appointment not found', 404);
    }

    const { patient_id } = appointment.rows[0];

    if (
      userRole === UserRole.PATIENT &&
      patient_id !== userId
    ) {
      throw new AppError('Access denied', 403);
    }

    const result = await pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *`,
      [AppointmentStatus.CANCELLED, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { dentistId, date } = req.query;

    if (!dentistId || !date) {
      throw new AppError('Dentist ID and date are required', 400);
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSlots = await pool.query(
      `SELECT appointment_date, duration_minutes
       FROM appointments
       WHERE dentist_id = $1
       AND appointment_date BETWEEN $2 AND $3
       AND status NOT IN ($4, $5)
       ORDER BY appointment_date`,
      [dentistId, startOfDay, endOfDay, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
    );

    const workStart = 9;
    const workEnd = 17;
    const slotDuration = 30;
    const availableSlots: string[] = [];

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(startOfDay);
        slotTime.setHours(hour, minute, 0, 0);

        const isBooked = bookedSlots.rows.some((booking) => {
          const bookingStart = new Date(booking.appointment_date);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60000);
          const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);

          return (
            (slotTime >= bookingStart && slotTime < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotTime <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        if (!isBooked) {
          availableSlots.push(slotTime.toISOString());
        }
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    throw error;
  }
};
