'use client';

import { useEffect, useRef } from 'react';
import { Typography, Spin } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useKimiChatStore, type KimiMessage } from '@/stores/kimi-chat-store';

const { Text } = Typography;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message }: { message: KimiMessage }) {
  const isUser = message.sender_type === 'USER';
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: isUser ? '#1890ff' : '#f0f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isUser ? <UserOutlined style={{ color: '#fff', fontSize: 14 }} /> : <RobotOutlined style={{ color: '#4F46E5', fontSize: 14 }} />}
      </div>
      <div style={{ maxWidth: '72%' }}>
        <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 4, marginBottom: 4 }}>
          <Text style={{ fontSize: 11, color: '#aaa' }}>{isUser ? 'Bạn' : 'Kimi'} · {formatTime(message.created_at)}</Text>
        </div>
        <div style={{ background: isUser ? '#1890ff' : '#f5f5f5', color: isUser ? '#fff' : '#333', padding: '10px 14px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}>
          {isUser ? (
            <span style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 14 }}>{message.content}</span>
          ) : (
            <div className="kimi-md" style={{ lineHeight: 1.7, fontSize: 14 }}><ReactMarkdown>{message.content}</ReactMarkdown></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessageList() {
  const { messages, isStreaming, streamingContent, isLoadingMessages } = useKimiChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingContent]);

  if (isLoadingMessages) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>
      {messages.length === 0 && !isStreaming && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <RobotOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d0d0d0' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#666' }}>Xin chào! Tôi là Kimi</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Trợ lý AI chương trình Talent Venture K25</div>
        </div>
      )}
      {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
      {isStreaming && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RobotOutlined style={{ color: '#4F46E5', fontSize: 14 }} />
          </div>
          <div style={{ maxWidth: '72%' }}>
            <Text style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 4 }}>Kimi</Text>
            <div style={{ background: '#f5f5f5', color: '#333', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', minWidth: 40 }}>
              {streamingContent ? <div className="kimi-md" style={{ lineHeight: 1.7, fontSize: 14 }}><ReactMarkdown>{streamingContent}</ReactMarkdown></div> : <span style={{ opacity: 0.5 }}>Kimi đang trả lời...</span>}
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
