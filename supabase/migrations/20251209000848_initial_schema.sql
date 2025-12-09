/*
  # Complete Database Schema for Crypto Wallet Alert SaaS

  1. Tables Created:
    - users: User profiles with plan information
    - wallets: Cryptocurrency wallets to monitor
    - alert_rules: Alert configuration per wallet
    - notification_channels: User notification destinations
    - events: Detected blockchain transactions
    - notifications: Notification delivery records
    - billing_subscriptions: Subscription management
    - monitoring_state: Blockchain polling state per wallet

  2. Security:
    - RLS enabled on all tables
    - Policies for authenticated user access
    - Users can only access their own data
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  current_plan text NOT NULL DEFAULT 'free' CHECK (current_plan IN ('free', 'starter', 'pro')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  network text NOT NULL CHECK (network IN ('ethereum', 'tron', 'bsc')),
  address text NOT NULL,
  label text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, network, address)
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets"
  ON wallets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_active ON wallets(is_active) WHERE is_active = true;

-- Alert rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'both' CHECK (direction IN ('incoming', 'outgoing', 'both')),
  min_amount numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rules for own wallets"
  ON alert_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = alert_rules.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rules for own wallets"
  ON alert_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = alert_rules.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rules for own wallets"
  ON alert_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = alert_rules.wallet_id
      AND wallets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = alert_rules.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rules for own wallets"
  ON alert_rules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = alert_rules.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_alert_rules_wallet_id ON alert_rules(wallet_id);

-- Notification channels table
CREATE TABLE IF NOT EXISTS notification_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'telegram', 'webhook')),
  config jsonb NOT NULL DEFAULT '{}',
  is_enabled boolean DEFAULT true,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own channels"
  ON notification_channels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own channels"
  ON notification_channels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels"
  ON notification_channels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels"
  ON notification_channels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_channels_user_id ON notification_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_enabled ON notification_channels(user_id, is_enabled, verified) WHERE is_enabled = true AND verified = true;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  tx_hash text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  amount numeric NOT NULL,
  token text NOT NULL DEFAULT 'USDT',
  network text NOT NULL,
  occurred_at timestamptz NOT NULL,
  raw jsonb,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(wallet_id, tx_hash)
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for own wallets"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = events.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_events_wallet_id ON events(wallet_id);
CREATE INDEX IF NOT EXISTS idx_events_notified ON events(notified) WHERE notified = false;
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at DESC);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications for own events"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN wallets ON wallets.id = events.wallet_id
      WHERE events.id = notifications.event_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_channel_id ON notifications(channel_id);

-- Billing subscriptions table
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('free', 'starter', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON billing_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON billing_subscriptions(stripe_subscription_id);

-- Monitoring state table (replaces state.json)
CREATE TABLE IF NOT EXISTS monitoring_state (
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  network text NOT NULL,
  last_tx_hash text,
  initialized boolean DEFAULT false,
  last_checked_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (wallet_id, network)
);

ALTER TABLE monitoring_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage monitoring state"
  ON monitoring_state FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_monitoring_state_wallet ON monitoring_state(wallet_id);