import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { config, validateConfig } from './utils/config.js';
import { authMiddleware, AuthRequest } from './middleware/auth.js';
import { authController } from './controllers/authController.js';
import { walletController } from './controllers/walletController.js';
import { channelController } from './controllers/channelController.js';
import { billingController } from './controllers/billingController.js';
import { eventController } from './controllers/eventController.js';
import { supabase } from './utils/supabase.js';
import { sendTelegramMessage } from './utils/telegram.js';

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

app.post('/telegram/connect-token', authMiddleware, async (req: AuthRequest, res) => {
  const { destination } = req.body;

  if (!destination || !['direct', 'group'].includes(destination)) {
    return res.status(400).json({ error: 'Invalid destination. Must be "direct" or "group".' });
  }

  if (!config.TELEGRAM_BOT_USERNAME) {
    return res.status(500).json({ error: 'Telegram bot not configured' });
  }

  const intendedChatType = destination === 'direct' ? 'private' : 'group';
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await supabase.from('telegram_connect_tokens').insert({
      token,
      user_id: req.userId,
      intended_chat_type: intendedChatType,
      expires_at: expiresAt.toISOString()
    });

    const telegramUrl = destination === 'direct'
      ? `https://t.me/${config.TELEGRAM_BOT_USERNAME}?start=${token}`
      : `https://t.me/${config.TELEGRAM_BOT_USERNAME}?startgroup=${token}`;

    res.json({ token, telegram_url: telegramUrl });
  } catch (error) {
    console.error('[Telegram] Error creating token:', error);
    res.status(500).json({ error: 'Failed to create connection token' });
  }
});

app.post('/telegram/webhook', async (req, res) => {
  if (config.TELEGRAM_WEBHOOK_SECRET) {
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (secret !== config.TELEGRAM_WEBHOOK_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }
  }

  const update = req.body;
  const message = update?.message;

  if (!message || !message.text) {
    return res.json({ ok: true });
  }

  const text = message.text.trim();
  const chatId = message.chat.id.toString();
  const chatType = message.chat.type;
  const chatTitle = message.chat.title || message.chat.first_name || 'Unknown';

  if (!text.startsWith('/start')) {
    return res.json({ ok: true });
  }

  const parts = text.split(' ');
  const token = parts.length > 1 ? parts[1] : null;

  if (!token) {
    await sendTelegramMessage(chatId, 'Please connect via the app to link this chat.');
    return res.json({ ok: true });
  }

  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from('telegram_connect_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .maybeSingle();

    if (tokenError || !tokenData) {
      await sendTelegramMessage(chatId, '❌ Invalid or expired token. Please generate a new one from the app.');
      return res.json({ ok: true });
    }

    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (expiresAt < now) {
      await sendTelegramMessage(chatId, '❌ This token has expired. Please generate a new one from the app.');
      return res.json({ ok: true });
    }

    const intendedType = tokenData.intended_chat_type;
    const isPrivateChat = chatType === 'private';
    const isGroupChat = chatType === 'group' || chatType === 'supergroup';

    if (intendedType === 'private' && !isPrivateChat) {
      await sendTelegramMessage(chatId, '❌ This token is for direct messages only. Please open the link in a private chat with the bot.');
      return res.json({ ok: true });
    }

    if (intendedType === 'group' && !isGroupChat) {
      await sendTelegramMessage(chatId, '❌ This token is for group chats only. Please add the bot to a group and use the group link.');
      return res.json({ ok: true });
    }

    const { data: existingChannel } = await supabase
      .from('notification_channels')
      .select('id')
      .eq('user_id', tokenData.user_id)
      .eq('type', 'telegram')
      .maybeSingle();

    if (existingChannel) {
      await supabase
        .from('notification_channels')
        .update({
          config: { chat_id: chatId, chat_type: chatType, chat_title: chatTitle },
          is_enabled: true,
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingChannel.id);
    } else {
      await supabase
        .from('notification_channels')
        .insert({
          user_id: tokenData.user_id,
          type: 'telegram',
          config: { chat_id: chatId, chat_type: chatType, chat_title: chatTitle },
          is_enabled: true,
          verified: true
        });
    }

    await supabase
      .from('telegram_connect_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    const successMessage = isPrivateChat
      ? '✅ Connected! You will receive alerts here.'
      : `✅ Connected to group "${chatTitle}". Alerts will be posted here.`;

    await sendTelegramMessage(chatId, successMessage);

    res.json({ ok: true });
  } catch (error) {
    console.error('[Telegram] Webhook error:', error);
    res.json({ ok: true });
  }
});

app.get('/telegram/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data: channel } = await supabase
      .from('notification_channels')
      .select('config, is_enabled, verified')
      .eq('user_id', req.userId)
      .eq('type', 'telegram')
      .maybeSingle();

    if (!channel || !channel.verified) {
      return res.json({ connected: false, destination: null });
    }

    const config = channel.config as { chat_type?: string; chat_title?: string };
    const destination = config.chat_type === 'private' ? 'direct' : 'group';

    res.json({
      connected: true,
      destination,
      chat_title: config.chat_title || undefined
    });
  } catch (error) {
    console.error('[Telegram] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
});
