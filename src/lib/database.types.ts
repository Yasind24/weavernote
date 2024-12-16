export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          created_at: string
          name: string
          user_id: string
          color: string
          is_default: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          user_id: string
          color?: string
          is_default?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          user_id?: string
          color?: string
          is_default?: boolean
        }
      }
      notebooks: {
        Row: {
          id: string
          created_at: string
          name: string
          user_id: string
          color: string
          folder_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          user_id: string
          color?: string
          folder_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          user_id?: string
          color?: string
          folder_id?: string
        }
      }
      notes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          notebook_id: string
          user_id: string
          is_pinned: boolean
          is_archived: boolean
          is_trashed: boolean
          trashed_at: string | null
          color: string
          tags: string[]
          labels: string[]
          position_x: number | null
          position_y: number | null
          layout_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          notebook_id: string
          user_id: string
          is_pinned?: boolean
          is_archived?: boolean
          is_trashed?: boolean
          trashed_at?: string | null
          color?: string
          tags?: string[]
          labels?: string[]
          position_x?: number | null
          position_y?: number | null
          layout_type?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          notebook_id?: string
          user_id?: string
          is_pinned?: boolean
          is_archived?: boolean
          is_trashed?: boolean
          trashed_at?: string | null
          color?: string
          tags?: string[]
          labels?: string[]
          position_x?: number | null
          position_y?: number | null
          layout_type?: string
        }
      }
      note_shares: {
        Row: {
          id: number
          created_at: string
          note_id: string
          shared_with: string
          can_edit: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          note_id: string
          shared_with: string
          can_edit?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          note_id?: string
          shared_with?: string
          can_edit?: boolean
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          email: string
          name: string | null
          subscription_status: string
          subscription_type: string
          activated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          subscription_status: string
          subscription_type: string
          activated_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          subscription_status?: string
          subscription_type?: string
          activated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}