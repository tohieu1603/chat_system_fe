'use client';

import { useState, useEffect, useRef } from 'react';
import { Drawer, Button, Typography, Tag } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import { Input } from 'antd';

const { TextArea } = Input;
const { Text, Title } = Typography;

export interface AskKimiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  planId: string;
  sectionName: string;
  currentContent: string;
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api') + '/kimi-chat';

/**
 * Drawer component for "Hỏi Kimi" in plan editor.
 * Exported for Phase 05 (plan editor) to import.
 */
export default function AskKimiDrawer({
  open,
  onClose,
  planId,
  sectionName,
  currentContent,
}: Props) {
  const [messages, setMessages] = useState<AskKimiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Reset when section changes
  useEffect(() => {
    if (open) {
      setMessages([]);
      setStreamingContent('');
    }
  }, [open, sectionName]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: new Date().toISOString() },
    ]);
    setIsStreaming(true);
    setStreamingContent('');

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    try {
      const response = await fetch(`${API_BASE}/ask-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plan_id: planId,
          section_name: sectionName,
          current_content: currentContent,
          question: text,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              assistantText += json.content;
              setStreamingContent(assistantText);
            }
            if (json.done) {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: assistantText,
                  timestamp: new Date().toISOString(),
                },
              ]);
              setIsStreaming(false);
              setStreamingContent('');
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      console.error('[AskKimi] error:', err);
      setIsStreaming(false);
      setStreamingContent('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Đã xảy ra lỗi, vui lòng thử lại.',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#4F46E5' }} />
          <span>Hỏi Kimi</span>
          <Tag color="purple" style={{ marginLeft: 4, fontSize: 11 }}>
            {sectionName}
          </Tag>
        </div>
      }
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      styles={{ body: { display: 'flex', flexDirection: 'column', padding: 0, height: '100%' } }}
    >
      {/* Context hint */}
      <div
        style={{
          padding: '10px 16px',
          background: '#f5f0ff',
          borderBottom: '1px solid #e8e0ff',
          fontSize: 12,
          color: '#7c5cbf',
        }}
      >
        <Text style={{ fontSize: 12, color: '#7c5cbf' }}>
          Kimi sẽ tư vấn về phần <strong>{sectionName}</strong> trong kế hoạch của bạn.
        </Text>
      </div>

      {/* Message area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.length === 0 && !isStreaming && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
            <RobotOutlined style={{ fontSize: 32, color: '#d0d0d0', marginBottom: 12 }} />
            <div style={{ fontSize: 13 }}>Hỏi Kimi về phần này để nhận tư vấn cụ thể</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              marginBottom: 12,
              gap: 8,
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                background: msg.role === 'user' ? '#1890ff' : '#f5f5f5',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                maxWidth: '85%',
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming */}
        {isStreaming && (
          <div style={{ display: 'flex', marginBottom: 12, gap: 8, alignItems: 'flex-end' }}>
            <div
              style={{
                background: '#f5f5f5',
                color: '#333',
                padding: '8px 12px',
                borderRadius: '12px 12px 12px 4px',
                maxWidth: '85%',
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {streamingContent || <span style={{ opacity: 0.5 }}>Kimi đang trả lời...</span>}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 12, borderTop: '1px solid #e8e8e8', display: 'flex', gap: 8 }}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi Kimi về phần này..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={isStreaming}
          style={{ flex: 1, borderRadius: 8, fontSize: 13 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isStreaming}
          disabled={!input.trim() || isStreaming}
          style={{ borderRadius: 8 }}
        />
      </div>
    </Drawer>
  );
}
