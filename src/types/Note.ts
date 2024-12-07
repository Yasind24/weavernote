interface Note {
  id: string;
  title: string;
  content: string;
  notebook_id: string;
  user_id: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  trashed_at: string | null;
  color: string;
  labels: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  position_x: number | null;
  position_y: number | null;
  layout_type: string;
}

interface Folder {
  id: string;
  name: string;
  user_id: string;
  color: string;
}

interface Notebook {
  id: string;
  name: string;
  user_id: string;
  color: string;
  folder_id: string;
}

export type { Note, Folder, Notebook }; 