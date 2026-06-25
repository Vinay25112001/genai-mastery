import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env vars missing — running in local-only mode.');
}

// Supabase now accepts both the legacy eyJ... format AND the new sb_publishable_ format
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbProgress {
  id: string;
  user_id: string;
  completed_topics: string[];
  quiz_scores: Record<string, number>;
  updated_at: string;
}
