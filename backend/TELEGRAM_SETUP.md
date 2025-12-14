# Telegram Integration Setup & Testing

This document explains the Telegram connection flow implementation and how to test it.

## Overview

Users can connect Telegram notifications by:
1. Clicking a button in the app to generate a one-time connection token
2. Opening a deep link to Telegram
3. Starting the bot (or adding it to a group)
4. The bot automatically links their chat_id to their account

## Implementation Details

### Database Changes

**New Table: `telegram_connect_tokens`**
- `token` TEXT PRIMARY KEY - Secure one-time token
- `user_id` UUID - References users table
- `intended_chat_type` TEXT - 'private' or 'group'
- `expires_at` TIMESTAMPTZ - Token expires in 10 minutes
- `used_at` TIMESTAMPTZ - Marks when token was consumed
- `created_at` TIMESTAMPTZ - Creation timestamp

**Modified Table: `notification_channels`**
- When user connects Telegram, a row is upserted with:
  - `type` = 'telegram'
  - `config` = JSON with `{ chat_id, chat_type, chat_title }`
  - `is_enabled` = true
  - `verified` = true
- Only ONE active Telegram channel per user (old one is replaced)

### API Endpoints

#### 1. POST /telegram/connect-token (auth required)

**Request:**
```json
{
  "destination": "direct" | "group"
}
```

**Response:**
```json
{
  "token": "abc123...def456",
  "telegram_url": "https://t.me/YourBotUsername?start=abc123...def456"
}
```

For groups:
```json
{
  "token": "abc123...def456",
  "telegram_url": "https://t.me/YourBotUsername?startgroup=abc123...def456"
}
```

**Behavior:**
- Validates destination parameter
- Generates cryptographically secure 64-character hex token
- Sets expiration to 10 minutes from now
- Stores token in database
- Returns deep link URL for user to open

#### 2. POST /telegram/webhook (public, validates secret)

**Request:**
Telegram webhook update object

**Behavior:**
- Validates `x-telegram-bot-api-secret-token` header if `TELEGRAM_WEBHOOK_SECRET` is set
- Parses `/start` commands with tokens
- Validates token:
  - Must exist in database
  - Must not be used (`used_at` is NULL)
  - Must not be expired
  - Must match intended chat type (private vs group/supergroup)
- If validation passes:
  - Upserts notification_channels for the user
  - Marks token as used
  - Sends success message via Telegram
- If validation fails:
  - Sends error message explaining the issue
  - Does NOT consume token (user can retry with correct destination)

**Error Messages:**
- No token: "Please connect via the app to link this chat."
- Invalid/expired: "❌ Invalid or expired token. Please generate a new one from the app."
- Token expired: "❌ This token has expired. Please generate a new one from the app."
- Wrong destination: "❌ This token is for [direct messages only | group chats only]..."

**Success Messages:**
- Private chat: "✅ Connected! You will receive alerts here."
- Group chat: "✅ Connected to group \"Group Name\". Alerts will be posted here."

#### 3. GET /telegram/status (auth required)

**Response when connected:**
```json
{
  "connected": true,
  "destination": "direct" | "group",
  "chat_title": "My Telegram" | "My Group Name"
}
```

**Response when not connected:**
```json
{
  "connected": false,
  "destination": null
}
```

### New Files

**backend/src/utils/telegram.ts**
- `sendTelegramMessage(chatId: string, text: string): Promise<boolean>`
- Helper function to send messages via Telegram Bot API
- Uses HTML parse mode
- Returns true on success, false on failure

**backend/src/utils/config.ts** (updated)
- Added `TELEGRAM_BOT_USERNAME`
- Added `TELEGRAM_WEBHOOK_SECRET`

## Environment Variables

Add these to `backend/.env`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=YourBotUsername
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret-key
```

**How to get these values:**
1. Create bot with @BotFather on Telegram
2. Get `TELEGRAM_BOT_TOKEN` from @BotFather
3. Get `TELEGRAM_BOT_USERNAME` (the username you set, without @)
4. Generate random string for `TELEGRAM_WEBHOOK_SECRET` (optional but recommended)

**Setting webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/telegram/webhook",
    "secret_token": "your-webhook-secret-key"
  }'
```

## Deployment

### Rebuild and Restart Services

On Ubuntu server at `/opt/simplecryptomonitor/backend`:

```bash
# Navigate to backend
cd /opt/simplecryptomonitor/backend

# Pull latest changes
git pull

# Install dependencies (if needed)
npm install

# Build TypeScript
npm run build

# Restart API service
sudo systemctl restart simplecryptomonitor-api

# Check status
sudo systemctl status simplecryptomonitor-api

# View logs
sudo journalctl -u simplecryptomonitor-api -f
```

### Systemd Service Example

If not already configured, create `/etc/systemd/system/simplecryptomonitor-api.service`:

```ini
[Unit]
Description=SimpleCryptoMonitor API
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/opt/simplecryptomonitor/backend
ExecStart=/usr/bin/node /opt/simplecryptomonitor/backend/dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable simplecryptomonitor-api
sudo systemctl start simplecryptomonitor-api
```

## Testing

### Prerequisites

1. Telegram bot created via @BotFather
2. Bot token and username configured in `.env`
3. Webhook configured to point to your server
4. Valid user account with JWT token

### Test Procedure

#### Test 1: Direct Message Connection

```bash
# Step 1: Generate connection token
curl -X POST http://localhost:3000/telegram/connect-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination": "direct"}'

# Expected response:
# {
#   "token": "abc123...def456",
#   "telegram_url": "https://t.me/YourBotUsername?start=abc123...def456"
# }

# Step 2: Open telegram_url in Telegram
# - Click the link or open it in Telegram app
# - Press "START" button
# - Bot should respond: "✅ Connected! You will receive alerts here."

# Step 3: Verify in database
psql -U postgres -d simplecryptomonitor -c "
  SELECT id, type, config, verified
  FROM notification_channels
  WHERE user_id = 'YOUR_USER_ID' AND type = 'telegram';
"

# Expected: One row with verified=true and config containing chat_id

# Step 4: Check status via API
curl -X GET http://localhost:3000/telegram/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response:
# {
#   "connected": true,
#   "destination": "direct",
#   "chat_title": "Your Name"
# }
```

#### Test 2: Group Connection

```bash
# Step 1: Generate group connection token
curl -X POST http://localhost:3000/telegram/connect-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination": "group"}'

# Expected response:
# {
#   "token": "xyz789...uvw012",
#   "telegram_url": "https://t.me/YourBotUsername?startgroup=xyz789...uvw012"
# }

# Step 2: Open telegram_url in Telegram
# - Click the link
# - Select a group to add the bot to
# - Bot is added and automatically sends /start with token
# - Bot should respond: "✅ Connected to group \"Group Name\". Alerts will be posted here."

# Step 3: Verify the previous direct connection was replaced
psql -U postgres -d simplecryptomonitor -c "
  SELECT id, type, config, verified
  FROM notification_channels
  WHERE user_id = 'YOUR_USER_ID' AND type = 'telegram';
"

# Expected: Still only ONE row, but now with group chat_id and chat_type

# Step 4: Check status via API
curl -X GET http://localhost:3000/telegram/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response:
# {
#   "connected": true,
#   "destination": "group",
#   "chat_title": "My Group Name"
# }
```

#### Test 3: Token Validation

**Test expired token:**
```bash
# Generate token, wait 11 minutes, then try to use it
# Bot should respond: "❌ This token has expired..."
```

**Test reusing token:**
```bash
# Use a token successfully, then try to use it again
# Bot should respond: "❌ Invalid or expired token..."
```

**Test wrong destination:**
```bash
# Generate "direct" token but add bot to group with that token
# Bot should respond: "❌ This token is for direct messages only..."
```

#### Test 4: Send Test Message

```bash
# Get chat_id from database
CHAT_ID=$(psql -U postgres -d simplecryptomonitor -t -c "
  SELECT config->>'chat_id'
  FROM notification_channels
  WHERE user_id = 'YOUR_USER_ID' AND type = 'telegram';
" | tr -d ' ')

# Send test message
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": \"${CHAT_ID}\",
    \"text\": \"🧪 Test notification from SimpleCryptoMonitor\"
  }"

# Expected: Message appears in connected Telegram chat
```

### Troubleshooting

**Bot doesn't respond:**
- Check webhook is set correctly: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Check server logs: `sudo journalctl -u simplecryptomonitor-api -f`
- Verify TELEGRAM_BOT_TOKEN is correct
- Ensure webhook URL is accessible from internet (not localhost)

**Token validation fails:**
- Check database for token: `SELECT * FROM telegram_connect_tokens WHERE token = 'YOUR_TOKEN';`
- Verify token hasn't expired or been used
- Check expires_at timestamp

**Wrong destination error:**
- Ensure you're using correct link type (direct vs group)
- Regenerate token with correct destination parameter

**Webhook secret validation fails:**
- Verify TELEGRAM_WEBHOOK_SECRET matches what you configured in setWebhook
- Check x-telegram-bot-api-secret-token header in webhook request

## Security Considerations

1. **One-time tokens**: Each token can only be used once
2. **Short expiration**: Tokens expire after 10 minutes
3. **Destination validation**: Prevents using direct token in group and vice versa
4. **Webhook secret**: Optional but recommended to prevent unauthorized webhook calls
5. **User isolation**: Each user can only have ONE active Telegram destination
6. **RLS policies**: telegram_connect_tokens table uses service role only access

## Architecture Notes

- Tokens are stored in database (not in-memory) to support multi-instance deployments
- Only one Telegram channel per user is supported (by design for simplicity)
- Webhook responds with 200 OK even on validation errors (prevents Telegram retries)
- Messages are sent back to user via Telegram for clear feedback
- Config includes chat_title for better UX (shows destination in frontend)
