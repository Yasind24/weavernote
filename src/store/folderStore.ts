import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useNoteStore from './noteStore';
import type { Database } from '../lib/database.types';

type Folder = Database['public']['Tables']['folders']['Row'];

interface FolderStore {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  fetchFolders: () => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'created_at'>) => Promise<Folder | null>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const useFolderStore = create<FolderStore>((set) => ({
  folders: [],
  loading: false,
  error: null,

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ folders: data || [], error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addFolder: async (folder) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([folder])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create folder');
      
      set((state) => ({ folders: [data, ...state.folders] }));
      return data;
    } catch (error) {
      console.error('Error adding folder:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create folder' });
      return null;
    }
  },

  updateFolder: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id ? data : folder
        ),
      }));
    } catch (error: any) {
      console.error('Error updating folder:', error);
      set({ error: error.message });
    }
  },

  deleteFolder: async (id) => {
    try {
      // Get notebooks in this folder first
      const { data: notebooks } = await supabase
        .from('notebooks')
        .select('id')
        .eq('folder_id', id);

      const notebookIds = notebooks?.map(n => n.id) || [];

      // Delete the folder - cascade triggers will handle notebooks and notes
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== id),
      }));

      // Update note store to remove deleted notes
      useNoteStore.getState().removeNotesFromFolder(notebookIds);

      return { success: true };
    } catch (error) {
      console.error('Error deleting folder:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
}));

export default useFolderStore;