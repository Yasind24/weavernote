import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useNoteStore from './noteStore';
import type { Database } from '../lib/database.types';

type Notebook = Database['public']['Tables']['notebooks']['Row'];

interface NotebookStore {
  notebooks: Notebook[];
  loading: boolean;
  error: string | null;
  fetchNotebooks: () => Promise<void>;
  addNotebook: (notebook: Omit<Notebook, 'id' | 'created_at'>) => Promise<Notebook | null>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<{ success: boolean; error?: string }>;
  hasNotes: (id: string) => Promise<boolean>;
}

const useNotebookStore = create<NotebookStore>((set, get) => ({
  notebooks: [],
  loading: false,
  error: null,

  fetchNotebooks: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notebooks: data || [], error: null });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addNotebook: async (notebook) => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert([notebook])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ notebooks: [data, ...state.notebooks] }));
      return data;
    } catch (error) {
      console.error('Error adding notebook:', error);
      set({ error: error.message });
      return null;
    }
  },

  updateNotebook: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        notebooks: state.notebooks.map((notebook) =>
          notebook.id === id ? data : notebook
        ),
      }));
    } catch (error) {
      console.error('Error updating notebook:', error);
      set({ error: error.message });
    }
  },

  hasNotes: async (id: string) => {
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('notebook_id', id);
    
    if (error) {
      console.error('Error checking for notes:', error);
      return false;
    }

    return (count || 0) > 0;
  },

  deleteNotebook: async (id) => {
    try {
      // Check if this is the last notebook
      if (get().notebooks.length <= 1) {
        return {
          success: false,
          error: "Cannot delete the last notebook. At least one notebook must exist."
        };
      }

      // Delete the notebook - cascade trigger will handle notes
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        notebooks: state.notebooks.filter((notebook) => notebook.id !== id),
      }));

      // Update note store to remove deleted notes
      useNoteStore.getState().removeNotesFromNotebook(id);

      return { success: true };
    } catch (error) {
      console.error('Error deleting notebook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
}));

export default useNotebookStore;