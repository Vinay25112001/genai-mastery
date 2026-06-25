import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  email_confirmed?: boolean;
}

const toAuthUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email || '',
  full_name: user.user_metadata?.full_name || '',
  email_confirmed: !!user.confirmed_at,
});

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      // Not configured — skip the Supabase call, show auth page immediately
      setLoading(false);
      return;
    }

    // Get the current session (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? toAuthUser(session.user) : null);
      setLoading(false);
    }).catch(() => {
      // Network error or bad credentials — still show the app
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ? toAuthUser(session.user) : null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) {
      return { error: { message: 'Supabase is not configured yet. Add your GitHub Secrets and redeploy.' } };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/genai-mastery/`,
        },
      });
      if (error) return { error: { message: error.message } };
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Sign up failed. Please try again.' } };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) {
      return { error: { message: 'Supabase is not configured yet. Add your GitHub Secrets and redeploy.' } };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: { message: error.message } };
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Sign in failed. Please try again.' } };
    }
  };

  const signOut = async () => {
    if (!supabaseConfigured) return;
    try {
      await supabase.auth.signOut();
    } catch {}
  };

  const resetPassword = async (
    email: string
  ): Promise<{ error: { message: string } | null }> => {
    if (!supabaseConfigured) {
      return { error: { message: 'Supabase is not configured yet. Add your GitHub Secrets and redeploy.' } };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/genai-mastery/`,
      });
      if (error) return { error: { message: error.message } };
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Reset failed. Please try again.' } };
    }
  };

  return { user, session, loading, signUp, signIn, signOut, resetPassword };
};
