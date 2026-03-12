/**
 * Supabase Authentication Service
 * Handles user signup, login, logout, and user data sync
 */

import { getClient, initSupabase } from './supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
}

export async function signUp(email: string, password: string, fullName: string): Promise<{ user: AuthUser; error: string | null }> {
  const client = initSupabase();
  if (!client) return { user: null as any, error: 'Supabase not configured' };

  try {
    // Sign up with auth
    const { data: authData, error: authError } = await client.auth.signUp({ email, password });
    if (authError) return { user: null as any, error: authError.message };

    const userId = authData.user?.id;
    if (!userId) return { user: null as any, error: 'Failed to create auth user' };

    // Create user record in database
    const { data: userData, error: userError } = await client.from('users').insert([
      {
        id: userId,
        email,
        full_name: fullName,
        role: 'user',
      },
    ]).select().single();

    if (userError) {
      console.error('Failed to create user record', userError);
      return { user: null as any, error: userError.message };
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
      },
      error: null,
    };
  } catch (e: any) {
    return { user: null as any, error: e.message };
  }
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const client = initSupabase();
  if (!client) return { user: null, error: 'Supabase not configured' };

  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };

    const userId = data.user?.id;
    if (!userId) return { user: null, error: 'Failed to sign in' };

    // Fetch user record
    const { data: userData, error: userError } = await client.from('users').select('*').eq('id', userId).single();
    if (userError) return { user: null, error: userError.message };

    return {
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
      },
      error: null,
    };
  } catch (e: any) {
    return { user: null, error: e.message };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  const client = initSupabase();
  if (!client) return { error: 'Supabase not configured' };

  try {
    const { error } = await client.auth.signOut();
    if (error) return { error: error.message };
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const client = initSupabase();
  if (!client) return null;

  try {
    const { data } = await client.auth.getSession();
    if (!data.session?.user) return null;

    const userId = data.session.user.id;
    const { data: userData, error } = await client.from('users').select('*').eq('id', userId).single();
    if (error) {
      console.error('Failed to fetch user data', error);
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
    };
  } catch (e) {
    console.error('Failed to get current user', e);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: { full_name?: string }): Promise<{ error: string | null }> {
  const client = initSupabase();
  if (!client) return { error: 'Supabase not configured' };

  try {
    const { error } = await client.from('users').update(updates).eq('id', userId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
}

export function onAuthStateChanged(callback: (user: AuthUser | null) => void) {
  const client = initSupabase();
  if (!client) return () => {};

  const { data: subscription } = client.auth.onAuthStateChange(async (event, session) => {
    if (session?.user?.id) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });

  return () => {
    if (subscription && typeof subscription.subscription?.unsubscribe === 'function') {
      subscription.subscription.unsubscribe();
    }
  };
}

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  updateUserProfile,
  onAuthStateChanged,
};
