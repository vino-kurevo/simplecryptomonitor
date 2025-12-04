import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { notificationChannelService } from '../services/notificationChannelService.js';
import { AppError } from '../utils/errors.js';

export const channelController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const channels = await notificationChannelService.getChannels(req.userId);
      res.json(channels);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const { type, config } = req.body;
      const channel = await notificationChannelService.createChannel(req.userId, type, config);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const channel = await notificationChannelService.updateChannel(req.params.id, req.userId, req.body);
      res.json(channel);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      await notificationChannelService.deleteChannel(req.params.id, req.userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },
};
