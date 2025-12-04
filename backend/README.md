# Crypto Wallet Alert Service - Backend

Multi-tenant SaaS backend for monitoring cryptocurrency wallets and sending alerts.

## Architecture

- **REST API**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with email/password
- **Workers**:
  - Monitoring worker (polls Ethereum and Tron)
  - Notification dispatcher (Telegram + Email)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
   - Required: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - Optional: Stripe keys, Telegram bot token, Etherscan API key

3. Database migrations are already applied to Supabase.

## Running

### Development

Start API server:
```bash
npm run dev
```

Start monitoring worker:
```bash
npm run worker
```

Start notification dispatcher:
```bash
npm run dispatcher
```

### Production

Build:
```bash
npm run build
```

Run:
```bash
npm start
node dist/workers/monitoring.js
node dist/workers/dispatcher.js
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/profile` - Get profile (authenticated)
- `PATCH /auth/profile` - Update profile (authenticated)

### Wallets
- `GET /wallets` - List user's wallets
- `POST /wallets` - Add wallet (plan limits enforced)
- `PATCH /wallets/:id` - Update wallet
- `DELETE /wallets/:id` - Delete wallet
- `GET /wallets/:id/rules` - Get alert rules

### Notification Channels
- `GET /notification-channels` - List channels
- `POST /notification-channels` - Add channel (plan limits enforced)
- `PATCH /notification-channels/:id` - Update channel
- `DELETE /notification-channels/:id` - Delete channel

### Events
- `GET /events` - List transaction events

### Billing
- `GET /billing/current` - Current subscription
- `POST /billing/stripe-session` - Create Stripe checkout session
- `POST /webhooks/stripe` - Stripe webhook handler

## Plan Limits

### Free
- 1 wallet
- 1 network
- 1 channel (email only)

### Starter
- 5 wallets
- 3 networks
- 3 channels (email + telegram)

### Pro
- Unlimited wallets
- Unlimited networks
- Unlimited channels (all types)

## Deployment Alongside Existing Python Script

### Option A: Run in Parallel
Keep your existing Python script running and deploy this backend separately:
- Backend handles multi-user SaaS features
- Your Python script continues monitoring your personal wallets
- No disruption to your existing setup

### Option B: Gradual Migration
1. Deploy backend API + database
2. Start monitoring worker for new users
3. Keep Python script for your personal wallets
4. Eventually migrate your personal setup to the new system

### Option C: Full Replacement
1. Deploy complete backend stack
2. Create your user account via API
3. Add your wallets via API
4. Configure notification channels
5. Stop Python script
6. Monitoring worker handles all wallets

## Monitoring Logic

The monitoring worker replicates your Python script's logic:
- Polls Etherscan V2 API for Ethereum USDT (ERC20)
- Polls Tronscan API for Tron USDT (TRC20)
- Uses database state tracking (replaces state.json)
- Detects incoming/outgoing transactions
- Applies alert rules per wallet
- Creates events for notification dispatcher

## Security

- All tables have RLS enabled
- Plan limits enforced at API level
- Watch-only wallets (no private keys stored)
- JWT-based authentication
- Secure Stripe webhook validation
