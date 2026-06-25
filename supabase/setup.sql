-- ============================================================
-- GenAI Mastery — Supabase Database Setup
-- Run this entire file in Supabase → SQL Editor → Run
-- ============================================================

-- 1. Create the user progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  completed_topics  TEXT[]   DEFAULT '{}',
  quiz_scores  JSONB       DEFAULT '{}',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
--    (users can ONLY read and write their OWN row)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Auto-update the updated_at timestamp on every save
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Done! Your database is ready.
-- ============================================================
