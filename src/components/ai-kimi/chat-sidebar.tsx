'use client';

import { Button, List, Typography, Spin, Empty } from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { useKimiChatStore, type KimiConversation } from '@/stores/kimi-chat-store';

const { Text } = Typography;

interface Props {
  onSelectConversation?: (conv: KimiConversation) => void;
}

export default function ChatSidebar({ onSelectConversation }: Props) {
  const {
    conversations,
    activeConversationId,
    isLoadingConversations,
    createConversation,
    setActiveConversation,
    fetchMessages,
  } = useKimiChatStore();

  const handleNew = async () => {
    const conv = await createConversation();
    setActiveConversation(conv.id);
    onSelectConversation?.(conv);
  };

  const handleSelect = async (conv: KimiConversation) => {
    setActiveConversation(conv.id);
    await fetchMessages(conv.id);
    onSelectConversation?.(conv);
  };

  return (
    <div
      style={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e8e8e8',
        background: '#fafafa',
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={handleNew}
        >
          Trò chuyện mới
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {isLoadingConversations ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin size="small" />
          </div>
        ) : conversations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có cuộc trò chuyện"
            style={{ padding: 24 }}
          />
        ) : (
          <List
            dataSource={conversations}
            renderItem={(conv) => (
              <List.Item
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: conv.id === activeConversationId ? '#e6f4ff' : 'transparent',
                  borderLeft: conv.id === activeConversationId ? '3px solid #1890ff' : '3px solid transparent',
                }}
                onClick={() => handleSelect(conv)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%' }}>
                  <MessageOutlined style={{ color: '#8c8c8c', marginTop: 3, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      ellipsis
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: conv.id === activeConversationId ? 600 : 400,
                        color: conv.id === activeConversationId ? '#1890ff' : '#333',
                      }}
                    >
                      {conv.title || 'Trò chuyện mới'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#aaa' }}>
                      {conv.total_messages} tin nhắn
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
