import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './utils/config.js';
import { authMiddleware } from './middleware/auth.js';
import { authController } from './controllers/authController.js';
import { walletController } from './controllers/walletController.js';
import { channelController } from './controllers/channelController.js';
import { billingController } from './controllers/billingController.js';
import { eventController } from './controllers/eventController.js';

validateConfig();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.get('/auth/profile', authMiddleware, authController.getProfile);
app.patch('/auth/profile', authMiddleware, authController.updateProfile);

app.get('/wallets', authMiddleware, walletController.getAll);
app.post('/wallets', authMiddleware, walletController.create);
app.patch('/wallets/:id', authMiddleware, walletController.update);
app.delete('/wallets/:id', authMiddleware, walletController.delete);
app.get('/wallets/:id/rules', authMiddleware, walletController.getRules);

app.get('/notification-channels', authMiddleware, channelController.getAll);
app.post('/notification-channels', authMiddleware, channelController.create);
app.patch('/notification-channels/:id', authMiddleware, channelController.update);
app.delete('/notification-channels/:id', authMiddleware, channelController.delete);

app.get('/events', authMiddleware, eventController.getAll);

app.get('/billing/current', authMiddleware, billingController.getCurrent);
app.post('/billing/stripe-session', authMiddleware, billingController.createCheckoutSession);
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), billingController.handleWebhook);

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
});
