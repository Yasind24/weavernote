import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { toast } from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error('Invalid Supabase URL. Must be a valid HTTPS URL:', supabaseUrl);
  throw new Error('Invalid Supabase URL configuration');
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key');
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Check session before each attempt
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      
      if (error instanceof Error && error.message === 'No active session') {
        toast.error('Session expired. Please refresh the page.');
        break;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      attempt++;
    }
  }

  throw lastError || new Error('Operation failed after retries');
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

// Connection status monitoring
let isOffline = false;

window.addEventListener('online', () => {
  isOffline = false;
  console.log('Connection restored');
  toast.success('Connection restored');
});

window.addEventListener('offline', () => {
  isOffline = true;
  console.log('Connection lost');
  toast.error('Connection lost');
});

// Helper to check connection before operations
export function checkConnection() {
  if (isOffline) {
    throw new Error('No internet connection');
  }
}