import { create } from 'zustand';
import type { Message } from '@/types';

interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isAiTyping: boolean;
  collectionProgress: Record<string, any>;
  streamingContent: string;
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setAiTyping: (val: boolean) => void;
  setConnected: (val: boolean) => void;
  updateProgress: (data: Record<string, any>) => void;
  clearMessages: () => void;
  appendStreamChunk: (chunk: string) => void;
  clearStreamingContent: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isConnected: false,
  isAiTyping: false,
  collectionProgress: {},
  streamingContent: '',

  addMessage: (msg) => set((s) => {
    // Deduplicate by id
    if (msg.id && s.messages.some(m => m.id === msg.id)) return s;
    return { messages: [...s.messages, msg] };
  }),
  setMessages: (msgs) => set({ messages: msgs }),
  setAiTyping: (val) => set({ isAiTyping: val }),
  setConnected: (val) => set({ isConnected: val }),
  updateProgress: (data) => set({ collectionProgress: data }),
  clearMessages: () => set({ messages: [], streamingContent: '', isAiTyping: false }),
  appendStreamChunk: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),
  clearStreamingContent: () => set({ streamingContent: '' }),
}));
