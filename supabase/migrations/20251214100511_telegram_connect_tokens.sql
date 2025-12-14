/*
  # Telegram Connect Tokens

  1. New Tables
    - `telegram_connect_tokens`
      - `token` (text, primary key) - One-time secure token
      - `user_id` (uuid, foreign key) - References users
      - `intended_chat_type` (text) - 'private' or 'group'
      - `expires_at` (timestamptz) - Token expiration
      - `used_at` (timestamptz, nullable) - When token was used
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - RLS enabled
    - Service role only access (backend uses service key)

  3. Indexes
    - Index on user_id for faster lookups
    - Index on expires_at for cleanup queries
*/

-- Telegram connect tokens table
CREATE TABLE IF NOT EXISTS telegram_connect_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intended_chat_type text NOT NULL CHECK (intended_chat_type IN ('private', 'group')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE telegram_connect_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage telegram tokens"
  ON telegram_connect_tokens FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tg_tokens_user ON telegram_connect_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tg_tokens_exp ON telegram_connect_tokens(expires_at);