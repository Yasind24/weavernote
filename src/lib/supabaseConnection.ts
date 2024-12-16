import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private channel: RealtimeChannel | null = null;
  private isReconnecting: boolean = false;
  private lastActiveSession: boolean = false;

  private constructor() {
    this.setupConnectionHandling();
  }

  public static getInstance(): SupabaseConnectionManager {
    if (!SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance = new SupabaseConnectionManager();
    }
    return SupabaseConnectionManager.instance;
  }

  private setupConnectionHandling() {
    // Create a channel for connection monitoring
    this.channel = supabase.channel('connection-monitor')
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connection established');
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
          this.isReconnecting = false;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('Realtime connection lost');
          if (!this.isReconnecting) {
            this.scheduleReconnect();
          }
        }
      });

    // Handle browser visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
      });
    }
  }

  private async handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Only attempt reconnection if we previously had an active session
      if (this.lastActiveSession || session) {
        const isConnected = await this.checkConnection();
        if (!isConnected) {
          await this.reconnect();
        }
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, 500); // Reduced to 500ms for faster reconnection
  }

  private async reconnect() {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    
    try {
      await supabase.realtime.disconnect();
      
      if (this.channel) {
        await this.channel.unsubscribe();
        this.channel = null;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      await supabase.realtime.connect();
      this.setupConnectionHandling();

      this.isReconnecting = false;
    } catch (error) {
      console.error('Error reconnecting:', error);
      this.isReconnecting = false;
      this.scheduleReconnect();
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.lastActiveSession = !!session;

      if (!session) {
        return false;
      }

      if (!supabase.realtime.isConnected()) {
        await this.reconnect();
      }

      return true;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }

  public cleanup() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isReconnecting = false;
  }
}

// Initialize the connection manager
const connectionManager = SupabaseConnectionManager.getInstance();

export { connectionManager };