#!/bin/bash
# SimpleCryptoMonitor - System Boot Auto-Start Setup
# This script must be run with root/sudo privileges

set -e

echo "==============================================="
echo "SimpleCryptoMonitor - Systemd Setup"
echo "==============================================="
echo ""

# Add PATH to sudoers for PM2
echo "Step 1: Configuring PM2 systemd service..."
export PATH=$PATH:/home/appuser/.npm-global/bin
env PATH=$PATH /home/appuser/.npm-global/bin/pm2 startup systemd -u appuser --hp /home/appuser

echo ""
echo "✅ Systemd service configured!"
echo ""
echo "The PM2 service will now start automatically on boot."
echo "Workers will be restored from: /home/appuser/.pm2/dump.pm2"
echo ""
echo "To verify the service:"
echo "  systemctl status pm2-appuser"
echo ""
echo "To test without rebooting:"
echo "  systemctl restart pm2-appuser"
echo "  su - appuser -c '/home/appuser/.npm-global/bin/pm2 status'"
