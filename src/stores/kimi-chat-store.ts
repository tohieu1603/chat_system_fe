import { create } from 'zustand';
import apiClient from '@/lib/api-client';

export interface KimiConversation {
  id: string;
  user_id: string;
  title: string;
  plan_id?: string;
  total_messages: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KimiMessage {
  id: string;
  conversation_id: string;
  sender_type: 'USER' | 'ASSISTANT';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface KimiChatState {
  conversations: KimiConversation[];
  activeConversationId: string | null;
  messages: KimiMessage[];
  isStreaming: boolean;
  streamingContent: string;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  fetchConversations: () => Promise<void>;
  createConversation: (planId?: string) => Promise<KimiConversation>;
  setActiveConversation: (id: string | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  clearMessages: () => void;
}

const API_BASE = '/kimi-chat';

export const useKimiChatStore = create<KimiChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  isLoadingConversations: false,
  isLoadingMessages: false,

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const { data } = await apiClient.get(`${API_BASE}/conversations`);
      set({ conversations: data.data ?? [] });
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  createConversation: async (planId?: string) => {
    const { data } = await apiClient.post(`${API_BASE}/conversations`, { plan_id: planId });
    const conv: KimiConversation = data.data;
    set((s) => ({ conversations: [conv, ...s.conversations] }));
    return conv;
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id, messages: [], streamingContent: '' });
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await apiClient.get(`${API_BASE}/conversations/${conversationId}/messages`);
      set({ messages: data.data ?? [] });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    const userMsg: KimiMessage = {
      id: `tmp-${Date.now()}`,
      conversation_id: conversationId,
      sender_type: 'USER',
      content,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      isStreaming: true,
      streamingContent: '',
    }));

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const apiUrl =
      (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api') +
      `${API_BASE}/conversations/${conversationId}/messages`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              assistantContent += json.content;
              set({ streamingContent: assistantContent });
            }
            if (json.done) {
              // Finalize: add assistant message to list
              const assistantMsg: KimiMessage = {
                id: `tmp-ai-${Date.now()}`,
                conversation_id: conversationId,
                sender_type: 'ASSISTANT',
                content: assistantContent,
                metadata: {},
                created_at: new Date().toISOString(),
              };
              set((s) => ({
                messages: [...s.messages, assistantMsg],
                isStreaming: false,
                streamingContent: '',
              }));

              // Refresh conversations to update last message / title
              get().fetchConversations();
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      console.error('[KimiChat] sendMessage error:', err);
      set({ isStreaming: false, streamingContent: '' });
    }
  },

  clearMessages: () => set({ messages: [], streamingContent: '', isStreaming: false }),
}));
