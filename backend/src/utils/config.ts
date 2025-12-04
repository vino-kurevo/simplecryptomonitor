import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),

  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY!,

  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID || '',
  STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || '',

  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',

  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',
  TRONSCAN_API_KEY: process.env.TRONSCAN_API_KEY || '',

  USDT_ERC20_CONTRACT: process.env.USDT_ERC20_CONTRACT || '0xdac17f958d2ee523a2206206994597c13d831ec7',
  USDT_TRC20_CONTRACT: process.env.USDT_TRC20_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',

  POLLING_INTERVAL_MS: parseInt(process.env.POLLING_INTERVAL_MS || '30000'),
};

export function validateConfig() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  for (const key of required) {
    if (!config[key as keyof typeof config]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
}
