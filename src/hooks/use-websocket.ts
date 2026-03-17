'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/stores/chat-store';
import type { Message } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
const MAX_RETRIES = 5;

export function useWebSocket(conversationId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    addMessage,
    setAiTyping,
    setConnected,
    updateProgress,
    appendStreamChunk,
    clearStreamingContent,
  } = useChatStore();

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    if (!token || !conversationId) return;

    const url = `${WS_URL}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      setConnected(true);
      ws.send(JSON.stringify({ event: 'join_conversation', data: { conversation_id: conversationId } }));
    };

    ws.onmessage = (event) => {
      try {
        const { event: evtName, data } = JSON.parse(event.data);
        switch (evtName) {
          case 'new_message':
            addMessage(data as Message);
            // Only stop typing if AI message (not user's own echoed message)
            if (data.sender_type === 'AI') setAiTyping(false);
            break;
          case 'ai_stream_chunk':
            setAiTyping(true);
            appendStreamChunk(data.chunk ?? '');
            // Safety: auto-reset typing after 60s in case typing:false is lost
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setAiTyping(false);
              clearStreamingContent();
            }, 60000);
            break;
          case 'ai_stream_done':
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setAiTyping(false);
            clearStreamingContent();
            // Backend sends { full_message, message_id, collection_progress }
            if (data.full_message || data.message) {
              const aiMsg: Message = data.message ?? {
                id: data.message_id ?? `ai_${Date.now()}`,
                conversation_id: data.conversation_id ?? '',
                sender_type: 'AI',
                content: data.full_message ?? '',
                created_at: new Date().toISOString(),
              };
              addMessage(aiMsg);
            }
            if (data.collection_progress) updateProgress(data.collection_progress);
            break;
          case 'typing':
            if (!data.is_typing && typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setAiTyping(data.is_typing ?? data.sender_type === 'AI');
            break;
          case 'collection_updated':
          case 'collection_complete':
            if (data.collection_progress) updateProgress(data.collection_progress);
            break;
          default:
            break;
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (retriesRef.current < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
        retriesRef.current += 1;
        retryTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => ws.close();
  }, [conversationId, addMessage, setAiTyping, setConnected, updateProgress, appendStreamChunk, clearStreamingContent]);

  useEffect(() => {
    connect();
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ event: 'send_message', data: { conversation_id: conversationId, content, message_type: 'TEXT' } }),
      );
    }
  }, []);

  const disconnect = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retriesRef.current = MAX_RETRIES; // prevent reconnect
    wsRef.current?.close();
  }, []);

  const isConnected = useChatStore((s) => s.isConnected);
  return { sendMessage, isConnected, disconnect };
}
