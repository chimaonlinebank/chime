import { getClient } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessage {
  id?: string;
  room_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  timestamp: string;
  read?: boolean;
}

class ChatRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to chat messages for a room
  async subscribeToChatRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void
  ) {
    const client = getClient();
    if (!client) {
      console.error('Supabase client not initialized');
      return;
    }

    try {
      // First, load existing messages
      const { data: existingMessages, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to load existing messages:', error);
      } else if (existingMessages) {
        existingMessages.forEach(msg => onMessage(msg as ChatMessage));
      }

      // Subscribe to new messages in real-time
      const channel = client
        .channel(`chat:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          (payload) => {
            if (payload.eventType !== 'DELETE') {
              onMessage(payload.new as ChatMessage);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Chat room ${roomId} subscription status:`, status);
        });

      this.channels.set(roomId, channel);
    } catch (err) {
      console.error('Failed to subscribe to chat room:', err);
    }
  }

  // Send a chat message
  async sendChatMessage(message: ChatMessage): Promise<ChatMessage | null> {
    const client = getClient();
    if (!client) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      const { data, error } = await client
        .from('chat_messages')
        .insert([message])
        .select()
        .single();

      if (error) {
        console.error('Failed to send message:', error);
        return null;
      }

      return data as ChatMessage;
    } catch (err) {
      console.error('Failed to send message:', err);
      return null;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(roomId: string, userId: string) {
    const client = getClient();
    if (!client) return;

    try {
      await client
        .from('chat_messages')
        .update({ read: true })
        .eq('room_id', roomId)
        .neq('sender_id', userId);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }

  // Unsubscribe from chat room
  unsubscribeFromChatRoom(roomId: string) {
    const channel = this.channels.get(roomId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(roomId);
    }
  }

  // Unsubscribe from all rooms
  unsubscribeFromAll() {
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

export const chatRealtimeService = new ChatRealtimeService();
