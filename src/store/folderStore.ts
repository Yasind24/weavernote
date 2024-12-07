import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useNoteStore from './noteStore';
import type { Folder } from '../types/Note';
import { toast } from 'react-hot-toast';

interface FolderStore {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  fetchFolders: () => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'created_at' | 'is_pinned'>) => Promise<Folder | null>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<{ success: boolean; error?: string }>;
  togglePin: (id: string) => Promise<void>;
}

const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [],
  loading: false,
  error: null,

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Ensure all folders have the is_pinned property
      const foldersWithPin = (data || []).map(folder => ({
        ...folder,
        is_pinned: folder.is_pinned || false
      }));
      set({ folders: foldersWithPin, error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addFolder: async (folder) => {
    try {
      const folderWithDefaults = {
        ...folder,
        is_pinned: false
      };

      const { data, error } = await supabase
        .from('folders')
        .insert([folderWithDefaults])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create folder');
      
      const folderWithPin = {
        ...data,
        is_pinned: data.is_pinned || false
      };
      
      set((state) => ({ folders: [folderWithPin, ...state.folders] }));
      return folderWithPin;
    } catch (error) {
      console.error('Error adding folder:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create folder' });
      return null;
    }
  },

  updateFolder: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    }));

    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update with server data
      const folderWithPin = {
        ...data,
        is_pinned: data.is_pinned || false
      };
      
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id ? folderWithPin : folder
        ),
      }));
    } catch (error: any) {
      console.error('Error updating folder:', error);
      // Revert optimistic update on error
      const { data } = await supabase
        .from('folders')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) {
        const folderWithPin = {
          ...data,
          is_pinned: data.is_pinned || false
        };
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? folderWithPin : folder
          ),
        }));
      }
      toast.error('Failed to update folder');
    }
  },

  togglePin: async (id) => {
    const folder = get().folders.find(f => f.id === id);
    if (!folder) return;

    // Optimistic update
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, is_pinned: !f.is_pinned } : f
      ).sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
      }),
    }));

    try {
      const { error } = await supabase
        .from('folders')
        .update({ is_pinned: !folder.is_pinned })
        .eq('id', id);

      if (error) throw error;
      
      // Return success
      return Promise.resolve();
    } catch (error) {
      console.error('Error toggling folder pin:', error);
      // Revert optimistic update
      set((state) => ({
        folders: state.folders.map((f) =>
          f.id === id ? { ...f, is_pinned: folder.is_pinned } : f
        ).sort((a, b) => {
          if (a.is_pinned === b.is_pinned) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
        }),
      }));
      toast.error('Failed to update folder');
      // Return rejected promise
      return Promise.reject(error);
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