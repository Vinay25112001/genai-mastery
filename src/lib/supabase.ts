import { createClient } from '@supabase/supabase-js';

// Use real env vars when available (injected by GitHub Actions at build time)
// Fall back to placeholder values so the app loads even without credentials
// (user will see the auth screen but cannot sign in — that is intentional)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-anon-key-not-configured';

const isConfigured =
  !!process.env.REACT_APP_SUPABASE_URL &&
  !!process.env.REACT_APP_SUPABASE_ANON_KEY &&
  !process.env.REACT_APP_SUPABASE_URL.includes('placeholder');

if (!isConfigured) {
  console.warn('⚠️  Supabase not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your GitHub Secrets and redeploy.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseConfigured = isConfigured;

export interface DbProgress {
  id: string;
  user_id: string;
  completed_topics: string[];
  quiz_scores: Record<string, number>;
  updated_at: string;
}
