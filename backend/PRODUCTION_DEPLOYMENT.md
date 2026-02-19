# SimpleCryptoMonitor - Production Deployment Guide

## Status: ✅ READY FOR REBOOT

The SimpleCryptoMonitor backend has been configured with **reboot-safe paths** and is ready for production deployment.

---

## Current Configuration

### Permanent Locations
```
PM2 Binary:     /home/appuser/.npm-global/bin/pm2
PM2 Version:    6.0.14
PM2 Home:       /home/appuser/.pm2
Backend Code:   /home/appuser/project/backend
Credentials:    /home/appuser/project/backend/.env
Saved Processes: /home/appuser/.pm2/dump.pm2
```

### Worker Status
```
monitoring-worker: online (PID 617, uptime 55s, restarts: 0)
dispatcher-worker: online (PID 618, uptime 55s, restarts: 0)
```

---

## Systemd Auto-Start Setup

### Step 1: Configure Systemd (Requires Root)

Run this command as root to enable PM2 to start on system boot:

```bash
env PATH=$PATH:/home/appuser/.npm-global/bin /home/appuser/.npm-global/bin/pm2 startup systemd -u appuser --hp /home/appuser
```

This will:
1. Create systemd service: `/etc/systemd/system/pm2-appuser.service`
2. Enable the service to start on boot
3. Configure PM2 to resurrect saved processes from `/home/appuser/.pm2/dump.pm2`

### Step 2: Verify Systemd Service

```bash
# Check service status
systemctl status pm2-appuser

# Check if enabled
systemctl is-enabled pm2-appuser

# Test restart
systemctl restart pm2-appuser
sleep 3
su - appuser -c '/home/appuser/.npm-global/bin/pm2 status'
```

---

## Reboot Testing

### Step 1: Perform System Reboot

```bash
reboot
```

### Step 2: Verify Workers After Reboot

After the server restarts, verify that workers are running:

```bash
# Check PM2 status
/home/appuser/.npm-global/bin/pm2 status

# Expected output:
# monitoring-worker: online
# dispatcher-worker: online

# Check logs
/home/appuser/.npm-global/bin/pm2 logs --lines 20
```

---

## Management Commands

```bash
# Set PM2 path for convenience
export PM2=/home/appuser/.npm-global/bin/pm2

# View worker status
$PM2 status

# View logs (live)
$PM2 logs

# View logs (last 50 lines)
$PM2 logs --lines 50 --nostream

# Restart all workers
$PM2 restart all

# Stop all workers
$PM2 stop all

# Start workers
$PM2 start /home/appuser/project/backend/ecosystem.config.cjs

# Save process list (after making changes)
$PM2 save
```

---

## File Locations

### Configuration Files
- **PM2 Config**: `/home/appuser/project/backend/ecosystem.config.cjs`
- **Environment**: `/home/appuser/project/backend/.env`
- **Monitoring Script**: `/home/appuser/project/backend/start-monitoring.sh`
- **Dispatcher Script**: `/home/appuser/project/backend/start-dispatcher.sh`

### Source Code
- **Backend Root**: `/home/appuser/project/backend`
- **Monitoring Worker**: `/home/appuser/project/backend/src/workers/monitoring.ts`
- **Dispatcher Worker**: `/home/appuser/project/backend/src/workers/dispatcher.ts`

### Logs
- **PM2 Daemon**: `/home/appuser/.pm2/pm2.log`
- **Monitoring Output**: `/home/appuser/project/backend/logs/monitoring-out.log`
- **Monitoring Errors**: `/home/appuser/project/backend/logs/monitoring-error.log`
- **Dispatcher Output**: `/home/appuser/project/backend/logs/dispatcher-out.log`
- **Dispatcher Errors**: `/home/appuser/project/backend/logs/dispatcher-error.log`

---

## Architecture

```
[System Boot]
     ↓
[systemd: pm2-appuser.service]
     ↓
[PM2 Daemon: /home/appuser/.pm2]
     ↓
[Resurrects from: /home/appuser/.pm2/dump.pm2]
     ↓
[Bash Wrappers: start-monitoring.sh, start-dispatcher.sh]
     ↓
[Source .env → exec tsx workers/*.ts]
     ↓
[Connect to Supabase Database]
     ↓
[Monitor Blockchain APIs & Send Telegram Notifications]
```

---

## Security Notes

1. **Credentials**: `.env` file has permissions `600` (owner read/write only)
2. **User Context**: All workers run as user `appuser`
3. **No Sudo Required**: PM2 runs entirely in user space (after systemd setup)
4. **Network**: Workers only make outbound connections (Etherscan, TronScan, Telegram, Supabase)

---

## Troubleshooting

### Workers Not Starting After Reboot

1. Check systemd service:
```bash
systemctl status pm2-appuser
journalctl -u pm2-appuser -n 50
```

2. Check PM2 daemon:
```bash
tail -100 /home/appuser/.pm2/pm2.log
```

3. Manually start PM2:
```bash
/home/appuser/.npm-global/bin/pm2 resurrect
/home/appuser/.npm-global/bin/pm2 status
```

### Workers Crashing

1. Check error logs:
```bash
/home/appuser/.npm-global/bin/pm2 logs --err --lines 50
```

2. Verify environment variables:
```bash
head /home/appuser/project/backend/.env
```

3. Restart workers:
```bash
/home/appuser/.npm-global/bin/pm2 restart all
```

---

## Next Steps

1. **Run systemd setup command** (requires root privileges)
2. **Test reboot** to confirm auto-start works
3. **Monitor for 1 hour** to ensure stability
4. **Set up monitoring alerts** for worker health

---

**Deployment Date**: 2026-02-19
**Status**: Production Ready (Pending Reboot Test)
