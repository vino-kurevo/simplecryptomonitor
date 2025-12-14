# Telegram Connection Implementation Summary

## What Was Implemented

A complete Telegram integration system that allows users to connect their Telegram account (private chat or group) without manually entering chat_id. The system uses one-time secure tokens and deep links.

## Files Modified/Created

### Database Migration
- **Applied via Supabase**: `telegram_connect_tokens` table
  - Stores one-time connection tokens
  - 10-minute expiration
  - Tracks usage to prevent reuse

### Backend Files

1. **`backend/src/utils/config.ts`** - UPDATED
   - Added `TELEGRAM_BOT_USERNAME` config
   - Added `TELEGRAM_WEBHOOK_SECRET` config

2. **`backend/src/utils/telegram.ts`** - NEW
   - `sendTelegramMessage()` helper function
   - Sends messages via Telegram Bot API

3. **`backend/src/index.ts`** - UPDATED
   - Added `POST /telegram/connect-token` (authenticated)
   - Added `POST /telegram/webhook` (public, validates secret)
   - Added `GET /telegram/status` (authenticated)

4. **`backend/.env.example`** - UPDATED
   - Added `TELEGRAM_BOT_USERNAME` variable
   - Added `TELEGRAM_WEBHOOK_SECRET` variable

5. **`backend/TELEGRAM_SETUP.md`** - NEW
   - Complete testing guide
   - Deployment instructions
   - Troubleshooting tips

## Environment Variables Required

Add to `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_SECRET=your-random-secret-key
```

## How It Works

### User Flow

1. **User clicks "Connect Telegram" in app**
   - Frontend calls `POST /telegram/connect-token` with `{"destination": "direct"}` or `{"destination": "group"}`
   - Backend generates secure 64-char token
   - Backend returns deep link URL

2. **User opens deep link**
   - Direct: `https://t.me/BotUsername?start=TOKEN`
   - Group: `https://t.me/BotUsername?startgroup=TOKEN`

3. **User starts bot (or adds to group)**
   - Telegram sends webhook to `POST /telegram/webhook`
   - Backend validates token (exists, not used, not expired, correct type)
   - Backend validates chat type matches intended use
   - Backend upserts `notification_channels` with chat_id
   - Backend marks token as used
   - Bot sends confirmation message

4. **User receives confirmation**
   - Private: "✅ Connected! You will receive alerts here."
   - Group: "✅ Connected to group \"Name\". Alerts will be posted here."

### Security Features

- One-time tokens (cannot be reused)
- 10-minute expiration
- Destination validation (private vs group)
- Webhook secret validation
- Only ONE active Telegram destination per user
- RLS policies on token table

## Deployment Commands

### On Ubuntu Server

```bash
# Navigate to backend directory
cd /opt/simplecryptomonitor/backend

# Pull latest code
git pull

# Install dependencies (if new ones added)
npm install

# Build TypeScript to JavaScript
npm run build

# Restart API service
sudo systemctl restart simplecryptomonitor-api

# Check service status
sudo systemctl status simplecryptomonitor-api

# View logs in real-time
sudo journalctl -u simplecryptomonitor-api -f
```

### Set Telegram Webhook

Replace `YOUR_BOT_TOKEN` and `YOUR_DOMAIN`:

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_DOMAIN/telegram/webhook",
    "secret_token": "your-webhook-secret-key"
  }'
```

Verify webhook:
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

## Testing

### Quick Test

1. **Get JWT token** (login via frontend or API)

2. **Generate connection token:**
```bash
curl -X POST http://localhost:3000/telegram/connect-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination": "direct"}'
```

3. **Copy `telegram_url` from response and open in Telegram**

4. **Press START button**

5. **Verify bot responds with confirmation**

6. **Check status:**
```bash
curl http://localhost:3000/telegram/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "connected": true,
  "destination": "direct",
  "chat_title": "Your Name"
}
```

### Database Verification

```sql
-- Check token was created
SELECT * FROM telegram_connect_tokens
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Check notification channel was created/updated
SELECT id, type, config, verified
FROM notification_channels
WHERE user_id = 'YOUR_USER_ID' AND type = 'telegram';

-- Expected config format:
-- {"chat_id": "123456789", "chat_type": "private", "chat_title": "John Doe"}
```

## API Reference

### POST /telegram/connect-token

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "destination": "direct" | "group"
}
```

**Response:**
```json
{
  "token": "abc123...def456",
  "telegram_url": "https://t.me/BotUsername?start=abc123...def456"
}
```

### POST /telegram/webhook

**Headers:**
- `x-telegram-bot-api-secret-token: <webhook_secret>` (if configured)

**Body:** Standard Telegram webhook update object

**Response:** Always returns `{"ok": true}` (even on errors to prevent retries)

### GET /telegram/status

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response (connected):**
```json
{
  "connected": true,
  "destination": "direct" | "group",
  "chat_title": "Chat Name"
}
```

**Response (not connected):**
```json
{
  "connected": false,
  "destination": null
}
```

## Error Handling

The webhook handles all errors gracefully and sends clear messages to users:

- **No token**: "Please connect via the app to link this chat."
- **Invalid token**: "❌ Invalid or expired token. Please generate a new one from the app."
- **Expired token**: "❌ This token has expired. Please generate a new one from the app."
- **Wrong destination**: "❌ This token is for [direct|group] only..."

Token is NOT consumed on validation errors, so user can retry with correct destination.

## Integration with Notification Dispatcher

The dispatcher worker (`backend/src/workers/dispatcher.ts`) already has logic to send Telegram notifications. It reads from `notification_channels` table:

```javascript
// Dispatcher looks for channels like:
{
  type: 'telegram',
  config: { chat_id: '123456789', ... },
  is_enabled: true,
  verified: true
}
```

When this implementation links a chat, it sets `verified: true`, so the dispatcher will start sending notifications to that chat_id immediately.

## Notes

- Only ONE Telegram destination per user (new connection replaces old)
- Works for both private chats and groups/supergroups
- Tokens expire after 10 minutes
- Tokens can only be used once
- Webhook validates secret if TELEGRAM_WEBHOOK_SECRET is set
- All database operations use Supabase client with service role key

## Troubleshooting

See `backend/TELEGRAM_SETUP.md` for detailed troubleshooting guide.

Common issues:
- **Bot doesn't respond**: Check webhook is configured correctly
- **Token invalid**: Check token hasn't expired or been used
- **Wrong destination**: Ensure using correct link type (direct vs group)
- **Webhook fails**: Check secret matches in both .env and webhook config
