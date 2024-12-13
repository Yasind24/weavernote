import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      initialized: false,

      setUser: (user) => set({ user, initialized: true }),

      signOut: async () => {
        try {
          // First disconnect realtime and cleanup all subscriptions
          await supabase.realtime.disconnect();
          
          // Clear all local storage auth data
          const prefix = 'sb-' + import.meta.env.VITE_SUPABASE_PROJECT_REF;
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith(prefix) || key === 'auth-storage') {
              localStorage.removeItem(key);
            }
          }
          
          // Clear session storage as well
          sessionStorage.clear();
          
          try {
            // Sign out from Supabase with global scope
            await supabase.auth.signOut({ scope: 'global' });
          } catch (error) {
            console.log('Auth session already cleared');
          }
          
          // Clear local state
          set({ user: null, error: null, initialized: false });
          
          // Force a complete navigation to root
          const baseUrl = window.location.origin;
          window.location.assign(baseUrl);
          
        } catch (error) {
          console.error('Error signing out:', error);
          // Still clear local state even if API call fails
          set({ user: null, error: null, initialized: false });
          // Force navigation even on error
          window.location.assign(window.location.origin);
        }
      },

      refreshSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({ user: session.user, error: null });
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
          set({ error: 'Failed to refresh session' });
          throw error;
        }
      },

      initializeAuth: async () => {
        if (get().loading) return;
        
        set({ loading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          set({ 
            user: session?.user || null,
            initialized: true,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ 
            user: null,
            error: 'Authentication failed',
            initialized: true,
            loading: false
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;