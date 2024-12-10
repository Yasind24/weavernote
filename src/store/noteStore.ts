import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Note } from '../types/Note';
import type { Database } from '../lib/database.types';

type DBNote = Database['public']['Tables']['notes']['Row'];

interface NoteStore {
  notes: Note[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  currentNote: Partial<Note> | null;
  isEditing: boolean;
  fetchNotes: (notebookId?: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
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
      set({ notes: (data || []) as Note[], error: null });
    } catch (error) {
      console.error('Error fetching notes:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch notes';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isFetching: false });
    }
  },

  addNote: async (noteData) => {
    set({ loading: true, error: null });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const now = new Date().toISOString();
      const insertData = {
        ...noteData,
        created_at: now,
        updated_at: now,
        labels: noteData.labels || [],
        tags: noteData.tags || []
      } as DBNote;

      const { data, error } = await supabase
        .from('notes')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create note');

      const newNote = data as Note;
      set(state => ({
        notes: [newNote, ...state.notes],
        loading: false,
        error: null
      }));

      return newNote;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create note';
      set({ error: message, loading: false });
      toast.error(message);
      throw error;
    }
  },

  updateNote: async (id, updates) => {
    set({ loading: true, error: null });
    const previousNote = get().notes.find(note => note.id === id);
    if (!previousNote) {
      set({ loading: false });
      throw new Error('Note not found');
    }

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        labels: updates.labels || previousNote.labels || [],
        tags: updates.tags || previousNote.tags || []
      } as DBNote;

      // First update without returning data
      const { error: updateError } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Then fetch the updated note separately
      const { data: fetchedNote, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!fetchedNote) throw new Error('Note not found after update');

      const updatedNote = fetchedNote as Note;
      set(state => ({
        notes: state.notes.map(note => note.id === id ? updatedNote : note),
        loading: false,
        error: null
      }));

      return updatedNote;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update note';
      set(state => ({ 
        error: message,
        loading: false,
        notes: state.notes.map(note => note.id === id ? previousNote : note)
      }));
      throw error;
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