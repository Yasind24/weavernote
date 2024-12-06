import { supabase } from './supabase';

export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Session refresh failed:', error.message);
      return null;
    }
    
    if (!session) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

export async function handleAuthError(error: any) {
  if (error?.message === 'refresh_token_not_found' || 
      error?.name === 'AuthApiError' && error?.code === 'refresh_token_not_found') {
    await supabase.auth.signOut();
    return null;
  }
  
  // Log other auth errors but don't throw
  console.error('Auth error:', error);
  return null;
}