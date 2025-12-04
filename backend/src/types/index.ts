export interface User {
  id: string;
  email: string;
  full_name?: string;
  current_plan: 'free' | 'starter' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  network: 'ethereum' | 'tron' | 'bsc';
  address: string;
  label?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertRule {
  id: string;
  wallet_id: string;
  direction: 'incoming' | 'outgoing' | 'both';
  min_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationChannel {
  id: string;
  user_id: string;
  type: 'email' | 'telegram' | 'webhook';
  config: {
    email?: string;
    chat_id?: string;
    webhook_url?: string;
  };
  is_enabled: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  wallet_id: string;
  tx_hash: string;
  direction: 'incoming' | 'outgoing';
  amount: number;
  token: string;
  network: string;
  occurred_at: string;
  raw: any;
  notified: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  event_id: string;
  channel_id: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface BillingSubscription {
  id: string;
  user_id: string;
  plan: 'free' | 'starter' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitoringState {
  wallet_id: string;
  network: string;
  last_tx_hash?: string;
  initialized: boolean;
  last_checked_at: string;
  updated_at: string;
}

export const PLAN_LIMITS = {
  free: {
    wallets: 1,
    networks: 1,
    channels: 1,
    channel_types: ['email'] as const,
  },
  starter: {
    wallets: 5,
    networks: 3,
    channels: 3,
    channel_types: ['email', 'telegram'] as const,
  },
  pro: {
    wallets: Infinity,
    networks: Infinity,
    channels: Infinity,
    channel_types: ['email', 'telegram', 'webhook'] as const,
  },
};
