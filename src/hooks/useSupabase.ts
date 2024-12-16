import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import useNotebookStore from '../store/notebookStore';
import useNoteStore from '../store/noteStore';
import useFolderStore from '../store/folderStore';
import { toast } from 'react-hot-toast';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { useSubscriptionStore } from '../store/subscriptionStore';

export function useSupabase() {
  const { user, setUser, initialized } = useAuthStore();
  const { fetchNotebooks } = useNotebookStore();
  const { fetchNotes } = useNoteStore();
  const { checkSubscription } = useSubscriptionStore();

  const handleAuthChange = useCallback(async (session: any) => {
    if (session?.user) {
      setUser(session.user);
      if (session.user.email) {
        await checkSubscription(session.user.email);
      }
      try {
        await Promise.all([
          fetchNotebooks(),
          fetchNotes()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your data');
      }
    } else {
      setUser(null);
    }
  }, [setUser, fetchNotebooks, fetchNotes, checkSubscription]);

  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleAuthChange(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        window.location.href = '/';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized, handleAuthChange, setUser]);

  useEffect(() => {
    if (!user) {
      // Clear all stores when user signs out
      useNotebookStore.setState({ notebooks: [], loading: false, error: null });
      useNoteStore.setState({ notes: [], currentNote: null, loading: false, error: null });
      useFolderStore.setState({ folders: [], loading: false, error: null });
    }
  }, [user]);

  return { user };
}