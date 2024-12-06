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
          await supabase.auth.signOut();
          set({ user: null, error: null });
        } catch (error) {
          console.error('Error signing out:', error);
          set({ error: 'Failed to sign out' });
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