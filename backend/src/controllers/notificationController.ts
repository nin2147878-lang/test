import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { read, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params: any[] = [userId];
    let paramCount = 2;

    if (read !== undefined) {
      query += ` AND read = $${paramCount}`;
      params.push(read === 'true');
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({
      notifications: result.rows,
      unreadCount: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Notification not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Notification not found', 404);
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    throw error;
  }
};
