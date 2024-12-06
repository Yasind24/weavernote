import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager;
  private reconnectTimeout: number | null = null;
  private isReconnecting = false;

  private constructor() {
    this.setupConnectionListeners();
  }

  public static getInstance(): SupabaseConnectionManager {
    if (!SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance = new SupabaseConnectionManager();
    }
    return SupabaseConnectionManager.instance;
  }

  private setupConnectionListeners() {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleVisibilityChange();
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Setup Supabase realtime presence
    const channel = supabase.channel('system');
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Realtime connection synced');
      })
      .on('presence', { event: 'join' }, () => {
        console.log('Realtime connection joined');
      })
      .on('presence', { event: 'leave' }, () => {
        console.log('Realtime connection left');
        this.scheduleReconnect();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await channel.track({
            online_at: new Date().toISOString(),
          });
          console.log('Presence track status:', presenceTrackStatus);
        }
      });
  }

  private async handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      await this.refreshConnection();
    }
  }

  private async handleOnline() {
    toast.success('Connection restored');
    await this.refreshConnection();
  }

  private handleOffline() {
    toast.error('Connection lost');
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.refreshConnection();
    }, 1000) as unknown as number;
  }

  private async refreshConnection() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        toast.error('Failed to restore connection');
        return;
      }

      if (!session) {
        console.warn('No session found during refresh');
        return;
      }

      // Refresh the access token
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Token refresh error:', refreshError);
        toast.error('Failed to refresh session');
        return;
      }

    } catch (error) {
      console.error('Connection refresh error:', error);
      toast.error('Failed to restore connection');
    } finally {
      this.isReconnecting = false;
    }
  }
}

export const connectionManager = SupabaseConnectionManager.getInstance();