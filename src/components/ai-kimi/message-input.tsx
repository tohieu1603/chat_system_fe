'use client';

import { useState, useRef } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useKimiChatStore } from '@/stores/kimi-chat-store';

const { TextArea } = Input;

interface Props {
  conversationId: string | null;
  onNeedNewConversation?: () => Promise<string>;
  prefillText?: string;
  onPrefillConsumed?: () => void;
}

export default function MessageInput({
  conversationId,
  onNeedNewConversation,
  prefillText,
  onPrefillConsumed,
}: Props) {
  const [value, setValue] = useState('');
  const { sendMessage, isStreaming, createConversation, setActiveConversation, fetchMessages } =
    useKimiChatStore();
  const inputRef = useRef<any>(null);

  // Consume prefill text when provided
  if (prefillText && value !== prefillText) {
    setValue(prefillText);
    onPrefillConsumed?.();
  }

  const handleSend = async () => {
    const text = value.trim();
    if (!text || isStreaming) return;

    setValue('');

    let convId = conversationId;

    // Auto-create conversation if none selected
    if (!convId) {
      if (onNeedNewConversation) {
        convId = await onNeedNewConversation();
      } else {
        const conv = await createConversation();
        setActiveConversation(conv.id);
        await fetchMessages(conv.id);
        convId = conv.id;
      }
    }

    await sendMessage(convId, text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        borderTop: '1px solid #e8e8e8',
        background: '#fff',
        alignItems: 'flex-end',
      }}
    >
      <TextArea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập câu hỏi... (Enter để gửi, Shift+Enter xuống dòng)"
        autoSize={{ minRows: 1, maxRows: 5 }}
        disabled={isStreaming}
        style={{ flex: 1, borderRadius: 8 }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        loading={isStreaming}
        disabled={!value.trim() || isStreaming}
        style={{ height: 38, borderRadius: 8 }}
      >
        Gửi
      </Button>
    </div>
  );
}
