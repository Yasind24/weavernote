import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import useNotebookStore from '../store/notebookStore';
import useNoteStore from '../store/noteStore';

export function useSupabase() {
  const { user, setUser, initialized } = useAuthStore();
  const { fetchNotebooks } = useNotebookStore();
  const { fetchNotes } = useNoteStore();

  const handleAuthChange = useCallback(async (session: any) => {
    if (session?.user) {
      setUser(session.user);
      await Promise.all([
        fetchNotebooks(),
        fetchNotes()
      ]);
    } else {
      setUser(null);
    }
  }, [setUser, fetchNotebooks, fetchNotes]);

  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleAuthChange(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized, handleAuthChange, setUser]);

  return { user };
}