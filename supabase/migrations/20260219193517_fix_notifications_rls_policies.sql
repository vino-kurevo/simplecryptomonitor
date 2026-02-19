/*
  # Fix Notifications and Events RLS Policies for Workers

  ## Problem
  Workers need to write to `events` and `notifications` tables but RLS policies only allow SELECT operations.
  This prevents the monitoring worker from creating events and the dispatcher from creating notifications.

  ## Changes
  1. Add INSERT policy for `events` table (service role / public access)
  2. Add UPDATE policy for `events` table (to mark as notified)
  3. Add INSERT policy for `notifications` table (service role / public access)
  4. Add UPDATE policy for `notifications` table (to update status/sent_at)

  ## Security Notes
  - These policies use (true) for service role / worker access
  - Workers authenticate using service role key, not user JWT
  - RLS still protects user-facing SELECT queries
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Service role can insert events" ON events;
  DROP POLICY IF EXISTS "Service role can update events" ON events;
  DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Service role can update notifications" ON notifications;
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;

-- Allow service role to insert events
CREATE POLICY "Service role can insert events"
  ON events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow service role to update events
CREATE POLICY "Service role can update events"
  ON events
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow service role to insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow service role to update notifications
CREATE POLICY "Service role can update notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
