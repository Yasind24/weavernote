import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Note } from '../types/Note';

interface NoteStore {
  notes: Note[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  currentNote: Partial<Note> | null;
  isEditing: boolean;
  fetchNotes: (notebookId?: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  removeNotesFromNotebook: (notebookId: string) => void;
  removeNotesFromFolder: (notebookIds: string[]) => void;
  createNewNote: () => void;
  clearError: () => void;
}

const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: false,
  isFetching: false,
  error: null,
  currentNote: null,
  isEditing: false,

  clearError: () => set({ error: null }),

  fetchNotes: async (notebookId) => {
    if (get().isFetching) return;

    set({ isFetching: true, error: null });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      let query = supabase.from('notes').select('*');
      if (notebookId) {
        query = query.eq('notebook_id', notebookId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      set({ notes: data || [], error: null });
    } catch (error) {
      console.error('Error fetching notes:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch notes';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isFetching: false });
    }
  },

  addNote: async (note) => {
    if (get().loading) {
      throw new Error('Another operation is in progress');
    }
    
    set({ loading: true, error: null });
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error('No active session');
        }

        const now = new Date().toISOString();
        const noteData = {
          ...note,
          created_at: now,
          updated_at: now,
          labels: note.labels || [],
          tags: note.tags || []
        };

        const { data, error } = await supabase
          .from('notes')
          .insert([noteData])
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('JWT')) {
            // Token expired or invalid, retry after refreshing session
            await supabase.auth.refreshSession();
            retryCount++;
            continue;
          }
          throw error;
        }
        
        if (!data) throw new Error('Failed to create note');

        const newNote = data as Note;
        set(state => ({
          notes: [newNote, ...state.notes],
          loading: false,
          error: null
        }));

        return newNote;
      } catch (error) {
        if (retryCount === maxRetries - 1) {
          const message = error instanceof Error ? error.message : 'Failed to create note';
          set({ error: message, loading: false });
          toast.error(message);
          throw new Error(message);
        }
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    set({ loading: false });
    throw new Error('Failed to create note after retries');
  },

  updateNote: async (id, updates) => {
    // Update UI immediately for better responsiveness
    set(state => ({
      notes: state.notes.map(note => 
        note.id === id 
          ? { ...note, ...updates, updated_at: new Date().toISOString() }
          : note
      )
    }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase
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

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('JWT')) {
          // Token expired or invalid, refresh session and retry
          await supabase.auth.refreshSession();
          // Retry the update
          const { data: retryData, error: retryError } = await supabase
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

          if (retryError) throw retryError;
          if (!retryData) throw new Error('Note not found');
          
          set(state => ({
            notes: state.notes.map(note => note.id === id ? (retryData as Note) : note),
            error: null
          }));
          return;
        }
        throw error;
      }

      if (!data) throw new Error('Note not found');

      set(state => ({
        notes: state.notes.map(note => note.id === id ? (data as Note) : note),
        error: null
      }));
    } catch (error) {
      // Revert the optimistic update on error
      const message = error instanceof Error ? error.message : 'Failed to update note';
      set(state => ({ 
        error: message,
        notes: state.notes.map(note => {
          if (note.id === id) {
            // Fetch the original note from the server
            supabase
              .from('notes')
              .select('*')
              .eq('id', id)
              .single()
              .then(({ data }) => {
                if (data) {
                  set(state => ({
                    notes: state.notes.map(n => n.id === id ? (data as Note) : n)
                  }));
                }
              });
          }
          return note;
        })
      }));
      toast.error(message);
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        loading: false,
        error: null
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete note';
      set({ error: message, loading: false });
      toast.error(message);
      throw new Error(message);
    }
  },

  removeNotesFromNotebook: (notebookId) => {
    set(state => ({
      notes: state.notes.filter(note => note.notebook_id !== notebookId)
    }));
  },

  removeNotesFromFolder: (notebookIds) => {
    set(state => ({
      notes: state.notes.filter(note => !notebookIds.includes(note.notebook_id))
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
  }
}));

export default useNoteStore;