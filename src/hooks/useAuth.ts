import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? toAuthUser(session.user) : null);
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Redirect URL after email confirmation — your GitHub Pages URL
        emailRedirectTo: `${window.location.origin}/genai-mastery/`,
      },
    });
    if (error) return { error: { message: error.message } };
    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: { message: string } | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: { message: error.message } };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (
    email: string
  ): Promise<{ error: { message: string } | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/genai-mastery/`,
    });
    if (error) return { error: { message: error.message } };
    return { error: null };
  };

  return { user, session, loading, signUp, signIn, signOut, resetPassword };
};
