import { create } from 'zustand';
import { supabase, fetchWithRetry } from '../lib/supabase';
import type { Note } from '../types/Note';
import { PostgrestResponse } from '@supabase/supabase-js';

interface NoteStore {
  notes: Note[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  currentNote: Partial<Note> | null;
  isEditing: boolean;
  fetchNotes: (notebookId?: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  removeNotesFromNotebook: (notebookId: string) => void;
  removeNotesFromFolder: (notebookIds: string[]) => void;
  createNewNote: () => void;
}

interface PostgrestError {
  message: string;
}

const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: false,
  isFetching: false,
  error: null,
  currentNote: null,
  isEditing: false,

  fetchNotes: async (notebookId) => {
    if (get().isFetching) {
      console.log('Already fetching notes, skipping...');
      return;
    }

    set({ isFetching: true, error: null });
    try {
      const fetchOperation = async () => {
        let query = supabase.from('notes').select('*');
        if (notebookId) {
          query = query.eq('notebook_id', notebookId);
        }
        const response = await query.order('created_at', { ascending: false });
        return response;
      };

      const { data, error } = await fetchWithRetry(fetchOperation);
      
      if (error) throw error;
      if (!data) {
        throw new Error('No data returned from database');
      }
      
      set({ notes: Array.isArray(data) ? data : [data], error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notes';
      console.error('Error fetching notes:', errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isFetching: false });
    }
  },

  addNote: async (note) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const { data, error } = await fetchWithRetry(async () => {
        const response = await supabase
          .from('notes')
          .insert([{
            title: note.title || 'Untitled',
            content: note.content || '',
            notebook_id: note.notebook_id,
            user_id: note.user_id,
            is_pinned: note.is_pinned || false,
            is_archived: note.is_archived || false,
            is_trashed: note.is_trashed || false,
            trashed_at: note.trashed_at || null,
            color: note.color || '#ffffff',
            labels: note.labels || [],
            tags: note.tags || [],
            position_x: note.position_x || null,
            position_y: note.position_y || null,
            layout_type: note.layout_type || 'circular',
            created_at: now,
            updated_at: now
          }])
          .select()
          .single();
        return response;
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned');
      
      set((state) => ({ 
        notes: [data as Note, ...state.notes]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add note';
      console.error('Error adding note:', errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateNote: async (id, updates) => {
    try {
      const { data, error } = await fetchWithRetry(async () => {
        const response = await supabase
          .from('notes')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
            labels: updates.labels || [],
            tags: updates.tags || []
          })
          .eq('id', id)
          .select()
          .single();
        return response;
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned');

      set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? (data as Note) : note
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
      console.error('Error updating note:', errorMessage);
      set({ error: errorMessage });
    }
  },

  deleteNote: async (id) => {
    try {
      const { error } = await fetchWithRetry(async () => {
        const response = await supabase
          .from('notes')
          .delete()
          .eq('id', id);
        return response;
      }) as PostgrestResponse<null>;

      if (error) throw error;
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting note:', error);
      set({ error: (error as PostgrestError).message });
    }
  },

  removeNotesFromNotebook: (notebookId) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.notebook_id !== notebookId),
    }));
  },

  removeNotesFromFolder: (notebookIds) => {
    set((state) => ({
      notes: state.notes.filter((note) => !notebookIds.includes(note.notebook_id))
    }));
  },

  createNewNote: () => {
    set({
      currentNote: {
        title: '',
        content: '',
        notebook_id: '',
        user_id: '',
        is_pinned: false,
        is_archived: false,
        is_trashed: false,
        trashed_at: null,
        color: '#ffffff',
        labels: [],
        tags: [],
        position_x: null,
        position_y: null,
        layout_type: 'circular',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      isEditing: true
    });
  },
}));

export default useNoteStore;