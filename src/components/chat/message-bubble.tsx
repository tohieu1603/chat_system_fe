'use client';

import { Typography } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { Message } from '@/types';

const { Text } = Typography;

interface Props {
  message: Message;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/** Strip markdown syntax to plain readable text */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')           // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1')      // **bold**
    .replace(/\*([^*]+)\*/g, '$1')          // *italic*
    .replace(/__([^_]+)__/g, '$1')          // __bold__
    .replace(/_([^_]+)_/g, '$1')            // _italic_
    .replace(/~~([^~]+)~~/g, '$1')          // ~~strikethrough~~
    .replace(/`([^`]+)`/g, '$1')            // `code`
    .replace(/^[-*+]\s+/gm, '• ')           // - list → bullet
    .replace(/^\d+\.\s+/gm, (m) => m)       // keep numbered lists
    .replace(/^>\s+/gm, '')                 // > blockquote
    .replace(/---+/g, '')                   // horizontal rule
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link](url)
    .replace(/\n{3,}/g, '\n\n')             // excess newlines
    .trim();
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.sender_type === 'USER';
  const isSystem = message.sender_type === 'SYSTEM';

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', margin: '8px 0' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>{message.content}</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: isUser ? '#1890ff' : '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <UserOutlined style={{ color: '#fff', fontSize: 14 }} />
        ) : (
          <RobotOutlined style={{ color: '#666', fontSize: 14 }} />
        )}
      </div>

      <div style={{ maxWidth: '70%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            gap: 4,
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 11, color: '#999' }}>
            {isUser ? 'Bạn' : 'AI Assistant'} · {formatTime(message.created_at)}
          </Text>
        </div>
        <div
          style={{
            background: isUser ? '#1890ff' : '#f5f5f5',
            color: isUser ? '#fff' : '#333',
            padding: '10px 14px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {isUser ? message.content : stripMarkdown(message.content)}
        </div>
      </div>
    </div>
  );
}
