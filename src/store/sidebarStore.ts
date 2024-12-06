import { create } from 'zustand';

interface SidebarState {
  selectedCategory: string;
  selectedFolder: string | null;
  setSelectedCategory: (category: string) => void;
  setSelectedFolder: (folderId: string | null) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  selectedCategory: 'all',
  selectedFolder: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
}));

export default useSidebarStore;