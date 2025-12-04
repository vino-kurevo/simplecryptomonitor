import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { eventService } from '../services/eventService.js';
import { AppError } from '../utils/errors.js';

export const eventController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const events = await eventService.getEventsForUser(req.userId, limit, offset);
      res.json(events);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },
};
