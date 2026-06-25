import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  email_confirmed?: boolean;
  leaderboard_consent?: boolean;
}

const toAuthUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email || '',
  full_name: user.user_metadata?.full_name || '',
  email_confirmed: !!user.confirmed_at,
  leaderboard_consent: user.user_metadata?.leaderboard_consent ?? false,
});

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return; }

    // Handle email confirmation redirect tokens in URL
    const handleInit = async () => {
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('type=signup')) {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
          setSession(data.session);
          setUser(toAuthUser(data.session.user));
          window.history.replaceState({}, '', window.location.pathname);
          setLoading(false);
          return;
        }
      }
      const { data: { session: s } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      setSession(s);
      setUser(s?.user ? toAuthUser(s.user) : null);
      setLoading(false);
    };

    handleInit();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ? toAuthUser(session.user) : null);
      setLoading(false);

      // Session expired — clear state and let the UI redirect to login
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (!session) { setUser(null); setSession(null); }
      }
      if (event === 'SIGNED_IN') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) return { error: { message: 'Supabase is not configured. Add GitHub Secrets and redeploy.' } };
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, leaderboard_consent: false }, emailRedirectTo: `${window.location.origin}/genai-mastery/` },
      });
      if (error) return { error: { message: error.message } };
      return { error: null };
    } catch (e: any) { return { error: { message: e.message || 'Sign up failed.' } }; }
  };

  const signIn = async (email: string, password: string): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) return { error: { message: 'Supabase is not configured. Add GitHub Secrets and redeploy.' } };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: { message: error.message } };
      return { error: null };
    } catch (e: any) { return { error: { message: e.message || 'Sign in failed.' } }; }
  };

  const signOut = async () => {
    if (!supabaseConfigured) return;
    try { await supabase.auth.signOut(); } catch {}
  };

  const resetPassword = async (email: string): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) return { error: { message: 'Supabase is not configured.' } };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/genai-mastery/` });
      if (error) return { error: { message: error.message } };
      return { error: null };
    } catch (e: any) { return { error: { message: e.message || 'Reset failed.' } }; }
  };

  const updateProfile = async (updates: { full_name?: string; leaderboard_consent?: boolean }): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) return { error: { message: 'Supabase is not configured.' } };
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });
      if (error) return { error: { message: error.message } };
      if (data.user) setUser(toAuthUser(data.user));
      return { error: null };
    } catch (e: any) { return { error: { message: e.message || 'Update failed.' } }; }
  };

  const deleteAccount = async (): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) return { error: { message: 'Supabase is not configured.' } };
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from('user_progress').delete().eq('user_id', currentUser.id);
      }
      const { error } = await supabase.rpc('delete_user');
      if (error) return { error: { message: error.message } };
      await supabase.auth.signOut();
      return { error: null };
    } catch (e: any) { return { error: { message: e.message || 'Delete failed.' } }; }
  };

  return { user, session, loading, signUp, signIn, signOut, resetPassword, updateProfile, deleteAccount };
};
