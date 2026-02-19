#!/bin/bash
set -e

echo "Deploying SimpleCryptoMonitor backend to /home/appuser/project..."

# Create directories
mkdir -p /home/appuser/project/backend
mkdir -p /home/appuser/project/backend/logs

# Copy all files
cp -r /tmp/cc-agent/61105712/project/backend/* /home/appuser/project/backend/

# Create .env file
cat > /home/appuser/project/backend/.env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://rqdgdcrouoteugpdppyt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZGdkY3JvdW90ZXVncGRwcHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzcwNDIsImV4cCI6MjA4MDgxMzA0Mn0.IfJwmPk-3sFMB5S-w6JOI54_OzbVtOQw8qXy7XDjDr4
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZGdkY3JvdW90ZXVncGRwcHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIzNzA0MiwiZXhwIjoyMDgwODEzMDQyfQ.KSvgh1YiI5dypl8u9g6b2CFzthoZ4fs33riZqlYXlCs

# JWT Secret
JWT_SECRET=dev-jwt-secret-change-in-production

# Stripe Configuration
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Notification Services
TELEGRAM_BOT_TOKEN=8213769459:AAG7zUzRUwSg6sJg_lwqrxzOmTYGbxD1jFg
TELEGRAM_BOT_USERNAME=
TELEGRAM_WEBHOOK_SECRET=
SENDGRID_API_KEY=

# Blockchain API Keys
ETHERSCAN_API_KEY=
TRONSCAN_API_KEY=

# USDT Contract Addresses
USDT_ERC20_CONTRACT=0xdac17f958d2ee523a2206206994597c13d831ec7
USDT_TRC20_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# Worker Configuration
POLLING_INTERVAL_MS=30000
EOF

# Set permissions
chmod +x /home/appuser/project/backend/start-*.sh
chmod 600 /home/appuser/project/backend/.env

# Verify
ls -la /home/appuser/project/backend/ | head -10
echo ""
echo "✅ Deployment complete!"
echo "Backend location: /home/appuser/project/backend"
