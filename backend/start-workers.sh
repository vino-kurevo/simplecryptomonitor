#!/bin/bash

# SimpleCryptoMonitor Worker Startup Script
# ==========================================

set -e

BACKEND_DIR="/tmp/cc-agent/61105712/project/backend"
PM2="/tmp/.npm-global/bin/pm2"

cd "$BACKEND_DIR"

echo "======================================"
echo "SimpleCryptoMonitor Worker Startup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    echo "Please copy .env.example to .env and configure:"
    echo "  - SUPABASE_SERVICE_KEY (required)"
    echo "  - TELEGRAM_BOT_TOKEN (required)"
    echo "  - ETHERSCAN_API_KEY (optional, for Ethereum)"
    exit 1
fi

# Check for required credentials
if grep -q "NEEDS_CONFIGURATION" .env; then
    echo "WARNING: .env contains placeholder values!"
    echo ""
    echo "Required credentials:"
    echo "  1. SUPABASE_SERVICE_KEY - Get from Supabase Dashboard > Settings > API > service_role key"
    echo "  2. TELEGRAM_BOT_TOKEN - Get from @BotFather on Telegram"
    echo ""
    echo "Optional credentials:"
    echo "  3. ETHERSCAN_API_KEY - Get from https://etherscan.io/apis"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ensure dependencies are installed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create logs directory
mkdir -p logs

echo ""
echo "Starting workers with PM2..."
echo ""

# Start workers using PM2
$PM2 start ecosystem.config.js

echo ""
echo "======================================"
echo "Workers started successfully!"
echo "======================================"
echo ""
echo "Commands:"
echo "  View status:    $PM2 status"
echo "  View logs:      $PM2 logs"
echo "  Restart:        $PM2 restart all"
echo "  Stop:           $PM2 stop all"
echo "  Delete:         $PM2 delete all"
echo ""
echo "To enable auto-start on system boot:"
echo "  $PM2 startup"
echo "  $PM2 save"
echo ""
