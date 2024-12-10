import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private channel: RealtimeChannel | null = null;
  private isReconnecting: boolean = false;

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
      console.log('Tab became visible, checking connection');
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        console.log('Connection lost during tab switch, reconnecting...');
        await this.reconnect();
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
    console.log('Attempting to reconnect...');
    
    try {
      // Force disconnect all existing connections
      await supabase.realtime.disconnect();
      
      // Clean up existing channel
      if (this.channel) {
        await this.channel.unsubscribe();
        this.channel = null;
      }

      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Reconnect realtime client
      await supabase.realtime.connect();

      // Setup new connection monitoring
      this.setupConnectionHandling();

      // Verify connection with a test query
      const { error } = await supabase.from('notes').select('id').limit(1);
      if (error) {
        throw error;
      }

      console.log('Reconnection successful');
      this.isReconnecting = false;
    } catch (error) {
      console.error('Error reconnecting:', error);
      this.isReconnecting = false;
      this.scheduleReconnect();
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      console.log('Checking connection status...');
      
      // First check if realtime is connected
      if (!supabase.realtime.isConnected()) {
        console.log('Realtime not connected, attempting reconnect');
        await this.reconnect();
      }

      // Verify with a test query
      const { error } = await supabase.from('notes').select('id').limit(1);
      if (error) {
        console.log('Connection check failed, attempting reconnect');
        await this.reconnect();
        return false;
      }

      console.log('Connection check successful');
      return true;
    } catch (error) {
      console.error('Error checking connection:', error);
      await this.reconnect();
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