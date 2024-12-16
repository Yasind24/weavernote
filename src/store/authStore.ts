import { create } from 'zustand';
import { persist, createJSONStorage, type PersistOptions, type StateStorage } from 'zustand/middleware';
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

type AuthStateStorage = Pick<AuthState, 'user'>;

const storage: StateStorage = {
  getItem: (name) => {
    try {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const data = JSON.parse(str);
      if (!data?.state?.user) return null;
      return str;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => localStorage.setItem(name, value),
  removeItem: (name) => localStorage.removeItem(name),
};

const persistOptions: PersistOptions<AuthState, AuthStateStorage> = {
  name: 'auth-storage',
  storage: createJSONStorage(() => storage),
  partialize: (state) => ({ 
    user: state.user 
  }),
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      initialized: false,

      setUser: (user) => set({ user, initialized: true }),

      refreshSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({ user: session.user, error: null });
          } else {
            set({ user: null, error: null });
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
          set({ error: 'Failed to refresh session', user: null });
        }
      },

      initializeAuth: async () => {
        if (get().loading) return;
        
        set({ loading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session && !get().user) {
            await supabase.auth.refreshSession();
          }
          
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

      signOut: async () => {
        try {
          await supabase.realtime.disconnect();
          
          const prefix = 'sb-' + import.meta.env.VITE_SUPABASE_PROJECT_REF;
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith(prefix) || key === 'auth-storage') {
              localStorage.removeItem(key);
            }
          }
          
          sessionStorage.clear();
          
          try {
            await supabase.auth.signOut({ scope: 'global' });
          } catch (error) {
            console.log('Auth session already cleared');
          }
          
          set({ user: null, error: null, initialized: false });
          window.location.assign(window.location.origin);
          
        } catch (error) {
          console.error('Error signing out:', error);
          set({ user: null, error: null, initialized: false });
          window.location.assign(window.location.origin);
        }
      }
    }),
    persistOptions
  )
);

export default useAuthStore;