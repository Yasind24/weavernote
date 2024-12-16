import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { toast } from 'react-hot-toast';

function getSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    db: {
      schema: 'public'
    },
    global: {
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        return fetch(url, {
          ...options,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
      }
    }
  });
}

function getSupabaseAdminClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required Supabase environment variables for admin client');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Client for normal user operations
export const supabase = getSupabaseClient();

// Client with service role for admin operations (like webhook handling)
export const supabaseAdmin = getSupabaseAdminClient();

// Initialize realtime connection
supabase.realtime.connect();

// Handle visibility change
if (typeof document !== 'undefined') {
  let reconnectTimeout: NodeJS.Timeout | null = null;
  
  document.addEventListener('visibilitychange', async () => {
    // Clear any pending reconnect first
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (document.visibilityState === 'visible') {
      // Check if we have a valid session before reconnecting
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Ensure we're disconnected if no valid session
        await supabase.realtime.disconnect();
        return;
      }
      
      // Only reconnect if not already connected and we have a valid session
      if (!supabase.realtime.isConnected()) {
        supabase.realtime.connect();
      }
    }
  });
}

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('note-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('note-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
    return null;
  }
}

// Save queue implementation
interface SaveOperation<T> {
  operation: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

class SaveQueue {
  private queue: SaveOperation<any>[] = [];
  private processing = false;
  private saveKey = 'weavernote_save_queue';

  constructor() {
    // Try to restore pending operations on init
    this.restoreQueue();
    window.addEventListener('beforeunload', () => this.persistQueue());
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    console.log(`Processing save queue (${this.queue.length} items)`);

    while (this.queue.length > 0) {
      const operation = this.queue[0];
      try {
        const result = await operation.operation();
        operation.resolve(result);
      } catch (error) {
        console.error('Error processing save operation:', error);
        operation.reject(error instanceof Error ? error : new Error('Save failed'));
      } finally {
        this.queue.shift();
        this.persistQueue();
      }
    }

    this.processing = false;
  }

  private persistQueue() {
    // Only persist the operations, not the promises
    const serializedQueue = this.queue.map(() => ({
      type: 'save_operation',
      timestamp: Date.now()
    }));
    localStorage.setItem(this.saveKey, JSON.stringify(serializedQueue));
  }

  private restoreQueue() {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (saved) {
        localStorage.removeItem(this.saveKey);
      }
    } catch (error) {
      console.error('Error restoring save queue:', error);
    }
  }

  add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.persistQueue();
      this.processQueue();
    });
  }
}

export const saveNote = async <T>(operation: () => Promise<T>): Promise<T> => {
  const saveQueue = new SaveQueue();
  const MAX_SAVE_TIME = 8000; // 8 seconds max for save operation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MAX_SAVE_TIME);

  try {
    // Attempt the save operation with timeout
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Save operation timed out - please try again'));
        }, MAX_SAVE_TIME);
      })
    ]);

    return result;
  } catch (error) {
    // Force disconnect and reconnect on failure
    try {
      await supabase.realtime.disconnect();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await supabase.realtime.connect();
    } catch (reconnectError) {
      console.error('Failed to reconnect:', reconnectError);
    }

    const enhancedError = error instanceof Error 
      ? new Error(`Save operation failed: ${error.message}`)
      : new Error('Save operation failed with an unknown error');
    throw enhancedError;
  } finally {
    clearTimeout(timeoutId);
  }
};