# SimpleCryptoMonitor - Credentials Setup Guide

## Required Credentials

The monitoring and dispatcher workers require the following credentials to operate:

### 1. Supabase Service Role Key (CRITICAL)

**Where to get it:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rqdgdcrouoteugpdppyt`
3. Navigate to: Settings → API
4. Copy the `service_role` key (NOT the `anon` key)

**Add to `.env`:**
```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```

**Why needed:**
- Workers need elevated database permissions
- Required for inserting events and notifications
- Bypasses Row Level Security (RLS) policies

---

### 2. Telegram Bot Token (CRITICAL)

**Where to get it:**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` to create a new bot (or `/mybots` to manage existing)
3. Follow the prompts to name your bot
4. Copy the HTTP API token provided

**Add to `.env`:**
```
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Why needed:**
- Dispatcher sends notifications via Telegram Bot API
- Without this, notifications will fail with "pending" status

---

### 3. Etherscan API Key (OPTIONAL)

**Where to get it:**
1. Go to: https://etherscan.io/apis
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key

**Add to `.env`:**
```
ETHERSCAN_API_KEY=ABCDEFGHIJKLMNOPQRSTUVWXYZ123456
```

**Why needed:**
- Required only if monitoring Ethereum wallets
- Free tier: 5 calls/second
- Without it, Ethereum monitoring will fail

---

## Current .env Status

Check your current `.env` file:

```bash
cd /tmp/cc-agent/61105712/project/backend
cat .env
```

Replace any `NEEDS_CONFIGURATION` placeholders with actual values.

---

## Verification

After adding credentials, verify they work:

```bash
# Test monitoring worker
npm run worker

# Test dispatcher worker
npm run dispatcher
```

Check logs for errors. You should see:
- `[MONITORING] Worker started`
- `[DISPATCHER] Worker started`

No authentication errors should appear.

---

## Security Notes

**NEVER commit `.env` to git!**

The `.gitignore` already excludes it, but double-check:
```bash
git status # Should NOT show .env
```

**For production:**
- Use environment variables instead of .env file
- Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate keys periodically
- Use separate keys for dev/staging/prod

---

## Troubleshooting

### "Missing required config: SUPABASE_SERVICE_KEY"
→ Add valid SUPABASE_SERVICE_KEY to .env

### "Telegram API error: Unauthorized"
→ Check TELEGRAM_BOT_TOKEN is correct

### "ETHERSCAN_API_KEY is required"
→ Add Etherscan API key or disable Ethereum monitoring

### Workers stop unexpectedly
→ Check logs in `backend/logs/` for errors
→ Ensure PM2 is managing workers: `pm2 status`

---

## Next Steps

Once credentials are configured:

1. Start workers: `./start-workers.sh`
2. Check status: `/tmp/.npm-global/bin/pm2 status`
3. View logs: `/tmp/.npm-global/bin/pm2 logs`
4. Enable auto-restart: `/tmp/.npm-global/bin/pm2 startup && /tmp/.npm-global/bin/pm2 save`
