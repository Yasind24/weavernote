import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NoteDraft {
  title: string;
  content: string;
  notebookId: string;
  color: string;
  labels: string[];
}

interface DraftStore {
  draft: NoteDraft | null;
  setDraft: (draft: NoteDraft | null) => void;
}

const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      draft: null,
      setDraft: (draft) => set({ draft }),
    }),
    {
      name: 'note-draft-storage',
    }
  )
);

export default useDraftStore;