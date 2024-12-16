import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SubscriptionState {
  hasActiveSubscription: boolean;
  isLoading: boolean;
  lastCheckedEmail: string | null;
  checkSubscription: (email: string) => Promise<void>;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  hasActiveSubscription: false,
  isLoading: true,
  lastCheckedEmail: null,

  checkSubscription: async (email: string) => {
    if (email === get().lastCheckedEmail && !get().isLoading) {
      return;
    }

    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Subscription check failed:', error);
        set({ 
          hasActiveSubscription: false, 
          isLoading: false,
          lastCheckedEmail: email 
        });
        return;
      }

      const isActive = data?.subscription_status === 'paid';
      set({ 
        hasActiveSubscription: isActive,
        isLoading: false,
        lastCheckedEmail: email
      });

    } catch (error) {
      console.error('Error checking subscription:', error);
      set({ 
        hasActiveSubscription: false,
        isLoading: false,
        lastCheckedEmail: email
      });
    }
  },

  reset: () => {
    set({ 
      hasActiveSubscription: false,
      isLoading: false,
      lastCheckedEmail: null
    });
  }
}));
