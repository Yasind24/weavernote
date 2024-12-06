export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
}

export interface Folder {
  id: string;
  created_at: string;
  name: string;
  user_id: string;
  color: string;
  is_default: boolean;
}

export interface Notebook {
  id: string;
  created_at: string;
  name: string;
  user_id: string;
  color: string;
  folder_id: string;
}

export interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  notebook_id: string;
  user_id: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  trashed_at: string | null;
  color: string;
  tags: string[];
  labels: string[];
  position_x: number | null;
  position_y: number | null;
  layout_type: string;
}