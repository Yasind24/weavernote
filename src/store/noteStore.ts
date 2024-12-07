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
    set({ loading: true, error: null });
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000;

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
            await supabase.auth.refreshSession();
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, baseDelay * retryCount));
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

        toast.success('Note created successfully');
        return newNote;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create note';
        if (retryCount === maxRetries - 1) {
          set({ error: message, loading: false });
          toast.error(message);
          throw error;
        }
        console.warn(`Retry ${retryCount + 1}/${maxRetries}: ${message}`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, baseDelay * retryCount));
      }
    }
    set({ loading: false });
    throw new Error('Failed to create note after retries');
  },

  updateNote: async (id, updates) => {
    set({ loading: true, error: null });
    const previousNote = get().notes.find(note => note.id === id);
    if (!previousNote) {
      set({ loading: false });
      throw new Error('Note not found');
    }

    // Update UI immediately for better responsiveness
    set(state => ({
      notes: state.notes.map(note => 
        note.id === id 
          ? { ...note, ...updates, updated_at: new Date().toISOString() }
          : note
      )
    }));

    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000;

    while (retryCount < maxRetries) {
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
            await supabase.auth.refreshSession();
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, baseDelay * retryCount));
            continue;
          }
          throw error;
        }

        if (!data) throw new Error('Note not found');

        set(state => ({
          notes: state.notes.map(note => note.id === id ? (data as Note) : note),
          loading: false,
          error: null
        }));
        toast.success('Note updated successfully');
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update note';
        if (retryCount === maxRetries - 1) {
          // Revert the optimistic update on final failure
          set(state => ({ 
            error: message,
            loading: false,
            notes: state.notes.map(note => note.id === id ? previousNote : note)
          }));
          toast.error(message);
          throw error;
        }
        console.warn(`Retry ${retryCount + 1}/${maxRetries}: ${message}`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, baseDelay * retryCount));
      }
    }
    set({ loading: false });
    throw new Error('Failed to update note after retries');
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