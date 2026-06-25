-- ============================================================
-- GenAI Mastery — Database V2 Additions
-- Run this in Supabase → SQL Editor → Run
-- (Run AFTER setup.sql if setting up fresh)
-- ============================================================

-- 1. Add display_name column to user_progress for leaderboard
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS total_score  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges       TEXT[] DEFAULT '{}';

-- 2. Leaderboard view — publicly readable top 10
-- Only shows display_name, score, badges, completed count
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  display_name,
  total_score,
  badges,
  array_length(completed_topics, 1) AS topics_completed,
  updated_at
FROM user_progress
WHERE display_name IS NOT NULL AND display_name != ''
ORDER BY total_score DESC, topics_completed DESC
LIMIT 10;

-- 3. Allow ALL authenticated users to read the leaderboard view
GRANT SELECT ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;

-- 4. Function for users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- 5. Function to compute and update total_score for a user
-- Score = sum of all quiz_scores values
CREATE OR REPLACE FUNCTION update_user_score(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score INTEGER := 0;
  v_key TEXT;
  v_value JSONB;
BEGIN
  SELECT COALESCE(
    (SELECT SUM((value::text)::numeric)
     FROM jsonb_each(quiz_scores)
     WHERE user_id = p_user_id),
    0
  )::INTEGER INTO v_score
  FROM user_progress
  WHERE user_id = p_user_id;

  UPDATE user_progress
  SET total_score = v_score
  WHERE user_id = p_user_id;
END;
$$;

-- Done!
-- ============================================================
