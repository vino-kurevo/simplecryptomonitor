# Worker Infrastructure Status

## Infrastructure: ✅ READY

### Environment
- **Platform**: Debian GNU/Linux 13 (trixie)
- **Process Manager**: PM2 v6.0.14
- **Node.js**: v22.22.0
- **TypeScript Runtime**: tsx v4.21.0

### Installed Components
- ✅ PM2 installed globally at `/tmp/.npm-global/bin/pm2`
- ✅ Backend dependencies installed (123 packages)
- ✅ tsx runtime available at `./node_modules/.bin/tsx`
- ✅ Log directory created at `./logs/`

### Configuration Files
- ✅ `ecosystem.config.js` - PM2 process configuration
- ✅ `start-workers.sh` - Startup script with credential checks
- ✅ `.env` - Environment file (requires credential configuration)
- ✅ `CREDENTIALS_SETUP.md` - Detailed credential setup guide

---

## Current Status: ⚠️ CREDENTIALS REQUIRED

### What's Working
1. **Infrastructure Ready**: PM2, tsx, all dependencies installed
2. **Auto-restart Configured**: Workers will restart on failure
3. **Logging Configured**: Separate logs for each worker
4. **Process Management**: PM2 will manage worker lifecycle

### What's Needed
To start workers, add these credentials to `.env`:

1. **SUPABASE_SERVICE_KEY** (CRITICAL)
   - Get from: Supabase Dashboard → Settings → API
   - Status: Placeholder value present

2. **TELEGRAM_BOT_TOKEN** (CRITICAL)
   - Get from: @BotFather on Telegram
   - Status: Placeholder value present

3. **ETHERSCAN_API_KEY** (Optional, for Ethereum)
   - Get from: https://etherscan.io/apis
   - Status: Empty (only needed if monitoring Ethereum)

---

## How to Start Workers

### Step 1: Configure Credentials
```bash
cd /tmp/cc-agent/61105712/project/backend
nano .env  # Edit and add real credentials
```

### Step 2: Start Workers
```bash
./start-workers.sh
```

Or manually with PM2:
```bash
/tmp/.npm-global/bin/pm2 start ecosystem.config.js
```

### Step 3: Verify Running
```bash
/tmp/.npm-global/bin/pm2 status
/tmp/.npm-global/bin/pm2 logs
```

---

## Auto-Start on System Boot

To ensure workers start automatically after server restart:

```bash
/tmp/.npm-global/bin/pm2 startup
# Follow the instructions printed
/tmp/.npm-global/bin/pm2 save
```

This will:
1. Create systemd service (or init script)
2. Enable service on boot
3. Save current PM2 process list
4. Automatically start workers after reboot

---

## Monitoring & Management

### View Status
```bash
/tmp/.npm-global/bin/pm2 status
```

### View Logs (Live)
```bash
/tmp/.npm-global/bin/pm2 logs
/tmp/.npm-global/bin/pm2 logs monitoring-worker
/tmp/.npm-global/bin/pm2 logs dispatcher-worker
```

### View Log Files
```bash
tail -f /tmp/cc-agent/61105712/project/backend/logs/monitoring-out.log
tail -f /tmp/cc-agent/61105712/project/backend/logs/dispatcher-out.log
```

### Restart Workers
```bash
/tmp/.npm-global/bin/pm2 restart all
/tmp/.npm-global/bin/pm2 restart monitoring-worker
/tmp/.npm-global/bin/pm2 restart dispatcher-worker
```

### Stop Workers
```bash
/tmp/.npm-global/bin/pm2 stop all
/tmp/.npm-global/bin/pm2 delete all  # Remove from PM2
```

---

## Expected Behavior (After Credentials Added)

### Monitoring Worker
```
[MONITORING] Worker started
[MONITORING] Scanning wallet TTjnSrGeq5D91BSYXSd2vVZNHuNXf7Nfi4 (tron)
[MONITORING] Found 5 transactions
[MONITORING] New transaction detected: 42.50 USDT incoming
[MONITORING] Event saved: <event_id>
```

### Dispatcher Worker
```
[DISPATCHER] Worker started
[DISPATCH] Processing 1 unnotified events
[TELEGRAM] Sending to chat_id: 89824579
[DISPATCH] telegram notification sent for event <event_id>
```

---

## Troubleshooting

### Workers Not Starting
```bash
# Check PM2 daemon
/tmp/.npm-global/bin/pm2 ping

# Check for errors
/tmp/.npm-global/bin/pm2 logs --err

# Restart PM2 daemon
/tmp/.npm-global/bin/pm2 kill
/tmp/.npm-global/bin/pm2 resurrect
```

### High Memory Usage
PM2 configured to restart if memory exceeds 500MB:
```javascript
max_memory_restart: '500M'
```

### Worker Crashes
PM2 auto-restarts on crash:
```javascript
autorestart: true
```

Check crash logs:
```bash
/tmp/.npm-global/bin/pm2 logs --err
cat logs/monitoring-error.log
cat logs/dispatcher-error.log
```

---

## Architecture

### Process Flow
```
[System Boot]
    ↓
[systemd/init starts PM2]
    ↓
[PM2 starts workers from ecosystem.config.js]
    ↓
[monitoring-worker] ← tsx src/workers/monitoring.ts
[dispatcher-worker] ← tsx src/workers/dispatcher.ts
    ↓
[Workers run continuously]
    ↓
[PM2 monitors & auto-restarts on failure]
```

### Worker Responsibilities

**monitoring-worker**:
- Polls blockchain APIs (TronScan, Etherscan)
- Detects new transactions
- Creates event records in database
- Updates monitoring_state checkpoints

**dispatcher-worker**:
- Scans for unnotified events
- Sends notifications via Telegram
- Creates notification records
- Marks events as notified

---

## Next Steps

1. ✅ Infrastructure setup (COMPLETE)
2. ⚠️ Add credentials to `.env`
3. ⚠️ Start workers: `./start-workers.sh`
4. ⚠️ Verify logs show no errors
5. ⚠️ Enable auto-start: `pm2 startup && pm2 save`
6. ⚠️ Test restart: `pm2 restart all`

---

## Production Recommendations

### Security
- [ ] Move credentials to secrets manager (AWS Secrets, Vault, etc.)
- [ ] Enable HTTPS for API endpoints
- [ ] Rotate keys periodically
- [ ] Use separate keys for dev/staging/prod
- [ ] Add rate limiting on blockchain API calls

### Monitoring
- [ ] Set up external uptime monitoring (UptimeRobot, Pingdom)
- [ ] Add error alerting (Sentry, Rollbar)
- [ ] Monitor PM2 metrics: `pm2 plus`
- [ ] Set up log aggregation (Logtail, Papertrail)

### Reliability
- [ ] Test failover scenarios
- [ ] Document recovery procedures
- [ ] Set up database backups
- [ ] Create health check endpoints
- [ ] Implement circuit breakers for external APIs

### Performance
- [ ] Optimize polling intervals
- [ ] Add caching for blockchain data
- [ ] Monitor database connection pool
- [ ] Profile memory usage over time

---

**Status as of**: 2026-02-19 19:50 UTC
**Infrastructure**: READY
**Workers**: WAITING FOR CREDENTIALS
**Auto-restart**: CONFIGURED
**Next Action**: Add credentials and start workers
