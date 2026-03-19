'use client';

import { useState, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useKimiChatStore } from '@/stores/kimi-chat-store';
import ChatSidebar from './chat-sidebar';
import MessageList from './message-list';
import MessageInput from './message-input';
import QuickPrompts from './quick-prompts';

const { Title } = Typography;

export default function ChatInterface() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [quickPromptText, setQuickPromptText] = useState('');
  const {
    activeConversationId,
    fetchConversations,
    createConversation,
    setActiveConversation,
    fetchMessages,
    isStreaming,
  } = useKimiChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleQuickPrompt = (text: string) => {
    setQuickPromptText(text);
  };

  const handleNeedNewConversation = async (): Promise<string> => {
    const conv = await createConversation();
    setActiveConversation(conv.id);
    await fetchMessages(conv.id);
    return conv.id;
  };

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 104px)',
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {/* Sidebar */}
      {sidebarVisible && (
        <ChatSidebar
          onSelectConversation={() => {}}
        />
      )}

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#fff',
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setSidebarVisible((v) => !v)}
            size="small"
          />
          <Title level={5} style={{ margin: 0, fontSize: 15 }}>
            Kimi — Trợ lý AI K25
          </Title>
          <span
            style={{
              fontSize: 11,
              background: '#f0f2ff',
              color: '#4F46E5',
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            Talent Venture
          </span>
        </div>

        {/* Messages */}
        <MessageList />

        {/* Quick prompts */}
        <QuickPrompts onSelect={handleQuickPrompt} disabled={isStreaming} />

        {/* Input */}
        <MessageInput
          conversationId={activeConversationId}
          onNeedNewConversation={handleNeedNewConversation}
          prefillText={quickPromptText}
          onPrefillConsumed={() => setQuickPromptText('')}
        />
      </div>
    </div>
  );
}
