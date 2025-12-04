import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { authService } from '../services/authService.js';
import { AppError } from '../utils/errors.js';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;
      const result = await authService.register(email, password, full_name);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Registration failed' });
      }
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Login failed' });
      }
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const profile = await authService.getProfile(req.userId);
      res.json(profile);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const profile = await authService.updateProfile(req.userId, req.body);
      res.json(profile);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },
};
