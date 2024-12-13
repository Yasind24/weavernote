import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, initialized } = useAuthStore();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        // Ensure we're on the landing page when signed out
        if (window.location.pathname !== '/') {
          window.location.assign(window.location.origin);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return children;
}