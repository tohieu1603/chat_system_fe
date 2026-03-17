'use client';

import { useEffect, useState } from 'react';
import { Button, Typography, Spin, Empty, Tag, Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import MessageBubble from '@/components/chat/message-bubble';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Conversation, Message, Project } from '@/types';

const { Title, Text } = Typography;

export default function AdminChatHistoryPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          apiClient.get<ApiResponse<Project>>(`/projects/${id}`),
          apiClient.get<ApiResponse<Conversation[]>>(`/projects/${id}/conversations`),
        ]);
        setProject(pRes.data.data ?? null);
        const convs = cRes.data.data ?? [];
        if (convs.length > 0) {
          const msgsRes = await apiClient.get<ApiResponse<Message[]>>(`/conversations/${convs[0].id}/messages`);
          setMessages(msgsRes.data.data ?? []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/admin/projects/${id}`)} />
        <div>
          <Title level={4} style={{ margin: 0 }}>Lịch sử chat</Title>
          {project && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {project.project_name} · {project.project_code}
            </Text>
          )}
        </div>
        <Tag color="orange" style={{ marginLeft: 'auto' }}>Chỉ xem</Tag>
      </div>

      <Card
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {messages.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Empty description="Chưa có tin nhắn nào" />
          </div>
        ) : (
          <div style={{ padding: '20px 24px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', background: '#fafafa', borderRadius: 10 }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </Card>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Tổng cộng {messages.length} tin nhắn
        </Text>
      </div>
    </AppLayout>
  );
}
