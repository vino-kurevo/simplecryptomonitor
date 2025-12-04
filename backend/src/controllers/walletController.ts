import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { walletService } from '../services/walletService.js';
import { alertRuleService } from '../services/alertRuleService.js';
import { AppError } from '../utils/errors.js';

export const walletController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const wallets = await walletService.getWallets(req.userId);
      res.json(wallets);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch wallets' });
      }
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const { network, address, label } = req.body;
      const wallet = await walletService.createWallet(req.userId, network, address, label);
      res.status(201).json(wallet);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to create wallet' });
      }
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const wallet = await walletService.updateWallet(req.params.id, req.userId, req.body);
      res.json(wallet);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to update wallet' });
      }
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      await walletService.deleteWallet(req.params.id, req.userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to delete wallet' });
      }
    }
  },

  async getRules(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const rules = await alertRuleService.getRulesForWallet(req.params.id, req.userId);
      res.json(rules);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch rules' });
      }
    }
  },
};
