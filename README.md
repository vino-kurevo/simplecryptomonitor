# SimpleCryptoMonitor

**Never miss a crypto payment.**

SimpleCryptoMonitor is a multi-tenant micro-SaaS platform that monitors cryptocurrency wallets and sends instant notifications when transactions occur. It's designed for individuals, freelancers, accountants, and small businesses who need to track crypto payments across multiple wallets and networks without constantly checking block explorers.

## Core Features

- **Watch-Only Wallet Monitoring**: Add cryptocurrency wallet addresses without storing private keys
- **Multi-Network Support**: Currently supports Ethereum (ERC20) and Tron (TRC20) networks for USDT
- **Real-Time Notifications**: Receive instant alerts via Email and Telegram when transactions occur
- **Flexible Alert Rules**: Configure alerts based on transaction direction (incoming/outgoing) and minimum amounts
- **Multi-Tenant Architecture**: Secure, isolated data for each user with Row-Level Security (RLS)
- **Freemium Billing**: Free, Starter, and Pro plans with different limits for wallets, networks, and notification channels
- **Activity Dashboard**: View transaction history and notification logs in a unified interface

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Supabase Client** for authentication and API calls

### Backend
- **Node.js** + **TypeScript**
- **Express.js** REST API
- **Supabase (PostgreSQL)** for database with Row-Level Security
- **Supabase Auth** for email/password authentication
- **Stripe** for subscription billing

### Workers
- **Monitoring Worker**: Polls blockchain APIs (Etherscan, TronScan) to detect new transactions
- **Notification Dispatcher**: Sends alerts via configured channels (Telegram Bot API, email via SendGrid)

### External APIs
- **Etherscan V2 API**: For Ethereum USDT (ERC20) transaction data
- **TronScan API**: For Tron USDT (TRC20) transaction data
- **Stripe API**: For payment processing and subscription management
- **Telegram Bot API**: For Telegram notifications

## Database Schema

The application uses PostgreSQL (via Supabase) with the following tables:

### Core Tables

- **`users`**: User profiles with plan information (extends Supabase `auth.users`)
  - Fields: `id`, `email`, `full_name`, `current_plan`, `created_at`, `updated_at`
  - Plans: `free`, `starter`, `pro`

- **`wallets`**: Cryptocurrency wallets to monitor
  - Fields: `id`, `user_id`, `network`, `address`, `label`, `is_active`
  - Networks: `ethereum`, `tron`, `bsc` (BSC support planned)
  - Unique constraint: `(user_id, network, address)`

- **`alert_rules`**: Alert configuration per wallet
  - Fields: `id`, `wallet_id`, `direction`, `min_amount`, `is_active`
  - Direction: `incoming`, `outgoing`, `both`

- **`notification_channels`**: User notification destinations
  - Fields: `id`, `user_id`, `type`, `config`, `is_enabled`, `verified`
  - Types: `email`, `telegram`, `webhook` (webhook support planned)

### Event & Notification Tables

- **`events`**: Detected blockchain transactions
  - Fields: `id`, `wallet_id`, `tx_hash`, `direction`, `amount`, `token`, `network`, `occurred_at`, `raw`, `notified`
  - Unique constraint: `(wallet_id, tx_hash)` to prevent duplicates

- **`notifications`**: Notification delivery records
  - Fields: `id`, `event_id`, `channel_id`, `status`, `error_message`, `sent_at`
  - Status: `sent`, `failed`, `pending`

### Billing & State Tables

- **`billing_subscriptions`**: Subscription management
  - Fields: `id`, `user_id`, `plan`, `status`, `stripe_subscription_id`, `stripe_customer_id`, `current_period_start`, `current_period_end`

- **`monitoring_state`**: Blockchain polling state per wallet (replaces `state.json` from standalone scripts)
  - Fields: `wallet_id`, `network`, `last_tx_hash`, `initialized`, `last_checked_at`
  - Primary key: `(wallet_id, network)`

All tables have Row-Level Security (RLS) enabled to ensure users can only access their own data.

## Architecture

### Separation of Concerns

1. **REST API Server** (`backend/src/index.ts`)
   - Handles HTTP requests (auth, wallet CRUD, channel management, events, billing)
   - Enforces plan limits before allowing operations
   - Uses JWT authentication via Supabase Auth

2. **Monitoring Worker** (`backend/src/workers/monitoring.ts`)
   - Runs as a separate process
   - Polls Etherscan and TronScan APIs at configurable intervals (default: 30 seconds)
   - Detects new transactions for active wallets
   - Writes `events` rows to the database
   - Maintains polling state in `monitoring_state` table

3. **Notification Dispatcher** (`backend/src/workers/dispatcher.ts`)
   - Runs as a separate process
   - Queries unnotified events from the database
   - Checks alert rules to determine which events should trigger notifications
   - Sends notifications via enabled and verified channels
   - Records delivery attempts in `notifications` table
   - Marks events as `notified` after processing

### Multi-Tenant Security

- All database queries use Supabase's RLS policies
- Users can only access their own wallets, events, channels, and subscriptions
- Service role is used by workers to access data across all users
- No private keys are ever stored (watch-only wallets)

## Plan Limits

### Free
- 1 wallet
- 1 network
- 1 channel (email only)

### Starter
- 5 wallets
- 3 networks
- 3 channels (email + Telegram)

### Pro
- Unlimited wallets
- Unlimited networks
- Unlimited channels (all types)

Plan limits are enforced at the API service layer to prevent unauthorized usage.

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Supabase account (database is already provisioned)
- Etherscan API key (for Ethereum monitoring)
- Telegram Bot token (for Telegram notifications)
- Stripe account (for billing features)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SimpleCryptoMonitor
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**

   Copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` with your credentials (see Environment Variables section below).

5. **Database setup**

   The database schema is already defined in `backend/database/schema.sql`. If you need to apply it manually:
   - Open your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `backend/database/schema.sql`

### Running the Application

#### Frontend (Development)
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### Backend (Development)

Open three terminal windows/tabs:

**Terminal 1 - API Server:**
```bash
cd backend
npm run dev
```
API server runs on `http://localhost:3000`

**Terminal 2 - Monitoring Worker:**
```bash
cd backend
npm run worker
```

**Terminal 3 - Notification Dispatcher:**
```bash
cd backend
npm run dispatcher
```

### Building for Production

#### Frontend
```bash
npm run build
```
Production files will be in the `dist/` directory.

#### Backend
```bash
cd backend
npm run build
```
Compiled JavaScript files will be in the `backend/dist/` directory.

### Running in Production

#### Backend API Server
```bash
cd backend
npm start
```

#### Monitoring Worker
```bash
cd backend
npm run worker:prod
```

#### Notification Dispatcher
```bash
cd backend
npm run dispatcher:prod
```

For production deployment, run all three processes using a process manager like PM2 or systemd services.

## Environment Variables

Create a `backend/.env` file based on `backend/.env.example`:

### Server Configuration
```env
NODE_ENV=development
PORT=3000
```

### Supabase Configuration
```env
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY
```

### JWT Configuration
```env
JWT_SECRET=YOUR_JWT_SECRET
```
Change this in production. Used for additional JWT operations if needed.

### Stripe Configuration
```env
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
STRIPE_STARTER_PRICE_ID=YOUR_STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID=YOUR_STRIPE_PRO_PRICE_ID
```
Create products and pricing in Stripe Dashboard, then add the price IDs here.

### Notification Services
```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
```
- Telegram: Create a bot via @BotFather on Telegram
- SendGrid: Create an API key in your SendGrid account

### Blockchain API Keys
```env
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
TRONSCAN_API_KEY=
```
- Etherscan: Get a free API key from https://etherscan.io/apis
- TronScan: Currently no API key required

### USDT Contract Addresses
```env
USDT_ERC20_CONTRACT=0xdac17f958d2ee523a2206206994597c13d831ec7
USDT_TRC20_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```
Default values are correct. Do not change unless monitoring a different token.

### Worker Configuration
```env
POLLING_INTERVAL_MS=30000
```
How often (in milliseconds) the monitoring worker polls blockchain APIs.

## Project Structure

```
SimpleCryptoMonitor/
├── src/                          # Frontend source code
│   ├── App.tsx                   # Main React component
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
│
├── backend/                      # Backend source code
│   ├── src/
│   │   ├── index.ts             # Express API server
│   │   ├── controllers/         # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── walletController.ts
│   │   │   ├── channelController.ts
│   │   │   ├── eventController.ts
│   │   │   └── billingController.ts
│   │   ├── services/            # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── walletService.ts
│   │   │   ├── alertRuleService.ts
│   │   │   ├── notificationChannelService.ts
│   │   │   ├── eventService.ts
│   │   │   └── billingService.ts
│   │   ├── middleware/          # Express middleware
│   │   │   └── auth.ts
│   │   ├── workers/             # Background processes
│   │   │   ├── monitoring.ts    # Blockchain polling worker
│   │   │   └── dispatcher.ts    # Notification sender
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── utils/               # Utilities
│   │       ├── config.ts
│   │       ├── errors.ts
│   │       └── supabase.ts
│   ├── database/
│   │   └── schema.sql           # Complete database schema
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── tsconfig.json
│
├── .env                          # Frontend environment variables
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/profile` - Get user profile (authenticated)
- `PATCH /auth/profile` - Update user profile (authenticated)

### Wallets
- `GET /wallets` - List user's wallets
- `POST /wallets` - Add wallet (enforces plan limits)
- `PATCH /wallets/:id` - Update wallet (label, active status)
- `DELETE /wallets/:id` - Delete wallet
- `GET /wallets/:id/rules` - Get alert rules for a wallet

### Notification Channels
- `GET /notification-channels` - List user's channels
- `POST /notification-channels` - Add channel (enforces plan limits)
- `PATCH /notification-channels/:id` - Update channel
- `DELETE /notification-channels/:id` - Delete channel

### Events
- `GET /events` - List transaction events for user's wallets
  - Query params: `wallet_id`, `limit`, `offset`

### Billing
- `GET /billing/current` - Get current subscription
- `POST /billing/stripe-session` - Create Stripe checkout session
- `POST /webhooks/stripe` - Stripe webhook handler (for subscription updates)

All authenticated endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Deployment Guidelines

### Database
- Supabase PostgreSQL is already provisioned
- Apply schema from `backend/database/schema.sql` via Supabase SQL Editor
- Ensure all RLS policies are enabled

### Backend Deployment Options

#### Option 1: Traditional VPS/Cloud VM
- Deploy to AWS EC2, DigitalOcean Droplet, or similar
- Run three processes using PM2:
  ```bash
  pm2 start dist/index.js --name api
  pm2 start dist/workers/monitoring.js --name worker
  pm2 start dist/workers/dispatcher.js --name dispatcher
  ```
- Use nginx as reverse proxy for the API
- Set up SSL certificates (Let's Encrypt)

#### Option 2: Container-Based (Docker)
- Create Dockerfiles for API and workers
- Deploy to AWS ECS, Google Cloud Run, or similar
- Use Docker Compose for local container orchestration

#### Option 3: Serverless (Partial)
- Deploy API to Vercel, Netlify Functions, or AWS Lambda
- Keep workers on a traditional VPS (workers need long-running processes)

### Frontend Deployment
- Build: `npm run build`
- Deploy `dist/` directory to:
  - Vercel (recommended for Vite/React)
  - Netlify
  - AWS S3 + CloudFront
  - Any static hosting service

### Environment Variables
- Set all production environment variables on your deployment platform
- Never commit `.env` files to version control
- Use your hosting provider's environment variable management

### Stripe Webhooks
- Configure webhook endpoint in Stripe Dashboard
- Point to: `https://your-domain.com/webhooks/stripe`
- Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Use webhook secret in `STRIPE_WEBHOOK_SECRET` env var

### Monitoring & Logging
- Set up application logging (Winston, Pino)
- Monitor worker health and performance
- Set up alerts for worker failures
- Track API response times and error rates

## Future Extensions

The SimpleCryptoMonitor architecture is designed to be extensible. Here are planned and possible future enhancements:

### New Blockchain Networks
- **Binance Smart Chain (BSC)**: BEP20 tokens (schema already includes `bsc` in network enum)
- **Polygon**: MATIC network support
- **Bitcoin**: BTC wallet monitoring
- **Solana**: SPL token support
- **Avalanche**: AVAX C-Chain support

**Implementation approach**:
1. Add new network to `wallets.network` enum in schema
2. Create new polling logic in `monitoring.ts` using network-specific API
3. Update plan limits to account for new networks
4. No changes needed to dispatcher or API (network-agnostic)

### New Notification Channels
- **Slack**: Webhook integration for team notifications
- **Discord**: Webhook integration for community notifications
- **SMS**: Via Twilio for critical alerts
- **Web Push**: Browser notifications
- **Webhooks**: Generic HTTP POST to custom endpoints
- **Mobile Push**: iOS and Android native notifications

**Implementation approach**:
1. Add new channel type to `notification_channels.type` enum
2. Implement sender logic in `dispatcher.ts`
3. Add configuration UI for channel-specific settings (webhook URLs, etc.)
4. Update plan limits if needed

### Enhanced Alert Rules
- **Complex conditions**: AND/OR logic for multiple conditions
- **Time-based rules**: Only alert during specific hours or days
- **Threshold aggregation**: Alert when total amount exceeds threshold over time period
- **Token-specific rules**: Different rules for different tokens on same wallet
- **Custom messages**: User-defined notification templates

### Additional Features
- **Portfolio tracking**: Calculate total balance across wallets (view-only, no trading)
- **Historical analytics**: Charts and graphs of transaction history
- **Transaction tagging**: Label transactions for accounting purposes
- **Export functionality**: CSV/Excel export of transaction history
- **Multi-user teams**: Share wallet monitoring within organization
- **API access**: Public API for integration with other tools
- **Mobile apps**: Native iOS and Android applications

### Security Enhancements
- **Two-factor authentication (2FA)**: Additional security layer for login
- **IP whitelisting**: Restrict API access to specific IPs
- **Audit logs**: Track all user actions for compliance
- **Webhook signing**: Secure webhook notifications with signatures

## Contributing

When contributing to SimpleCryptoMonitor, please:

1. Follow existing code patterns and conventions
2. Respect the separation of concerns (API, workers, frontend)
3. Never introduce breaking changes to existing endpoints without discussion
4. Add proper TypeScript types for new features
5. Test plan limit enforcement for new features
6. Update this README with any significant architectural changes

## Security

- **Watch-only wallets**: No private keys are ever stored or transmitted
- **Row-Level Security (RLS)**: All database tables enforce user isolation
- **JWT authentication**: Secure token-based authentication via Supabase Auth
- **HTTPS required**: All production deployments must use SSL/TLS
- **API key security**: Blockchain API keys are server-side only
- **Webhook validation**: Stripe webhooks are validated using webhook secrets

Never:
- Store private keys or seed phrases
- Hardcode secrets in source code
- Commit `.env` files to version control
- Disable RLS policies
- Expose service role keys to frontend

## Support

For questions, issues, or feature requests, please open an issue on the repository.

## License

[Add your license here]
