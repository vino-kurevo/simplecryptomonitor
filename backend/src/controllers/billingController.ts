import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { billingService } from '../services/billingService.js';
import { AppError } from '../utils/errors.js';
import { config } from '../utils/config.js';
import Stripe from 'stripe';

export const billingController = {
  async getCurrent(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const subscription = await billingService.getCurrentSubscription(req.userId);
      res.json(subscription);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },

  async createCheckoutSession(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
      const { plan, returnUrl } = req.body;
      const url = await billingService.createStripeCheckoutSession(req.userId, plan, returnUrl);
      res.json({ url });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ code: error.code, message: error.message });
      } else {
        res.status(500).json({ code: 'INTERNAL_ERROR' });
      }
    }
  },

  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature || !config.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
      const event = stripe.webhooks.constructEvent(req.body, signature, config.STRIPE_WEBHOOK_SECRET);

      await billingService.handleStripeWebhook(event);
      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: 'Webhook error' });
    }
  },
};
