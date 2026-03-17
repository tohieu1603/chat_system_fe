'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Typography, Progress, Button, Drawer, Spin, App, Tag } from 'antd';
import { ArrowLeftOutlined, LoadingOutlined, CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useProjectStore } from '@/stores/project-store';
import { useChatStore } from '@/stores/chat-store';
import { useWebSocket } from '@/hooks/use-websocket';
import MessageBubble, { stripMarkdown } from '@/components/chat/message-bubble';
import CollectionSidebar from '@/components/chat/collection-sidebar';
import MessageInput from '@/components/chat/message-input';
import type { ApiResponse, Conversation, Message } from '@/types';

const { Text, Title } = Typography;

const FIELD_LABELS: Record<string, string> = {
  company_name: 'Tên công ty', industry: 'Ngành nghề', company_size: 'Quy mô',
  current_systems: 'Hệ thống hiện tại', pain_points: 'Khó khăn hiện tại',
  departments: 'Phòng ban', name: 'Tên', head_count: 'Số người', manager: 'Quản lý',
  responsibilities: 'Trách nhiệm', workflow_name: 'Tên quy trình', description: 'Mô tả',
  steps: 'Các bước', salary_structure: 'Cấu trúc lương', components: 'Thành phần',
  pay_cycle: 'Chu kỳ trả lương', special_rules: 'Quy định đặc biệt',
  work_schedule: 'Lịch làm việc', shift_types: 'Loại ca', deadline_management: 'Quản lý deadline',
  calendar_requirements: 'Yêu cầu lịch', feature_name: 'Tên tính năng', priority: 'Ưu tiên',
  user_stories: 'User Stories', acceptance_criteria: 'Tiêu chí chấp nhận',
  requirement: 'Yêu cầu', category: 'Loại', details: 'Chi tiết', constraints: 'Ràng buộc',
  status: 'Trạng thái', required: 'Bắt buộc', last_updated: 'Cập nhật lần cuối',
  fields_collected: 'Đã thu thập', fields_missing: 'Còn thiếu',
};

function CategoryDetail({ data }: { data: Record<string, any> }) {
  const collected = data.fields_collected ?? [];
  const missing = data.fields_missing ?? [];
  const hasData = collected.length > 0;

  return (
    <div>
      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: hasData ? '#f6ffed' : '#fff7e6', borderRadius: 8 }}>
        {hasData ? <CheckCircleFilled style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: '#fa8c16' }} />}
        <Text strong>{hasData ? 'Đã thu thập' : 'Chưa thu thập'}</Text>
      </div>

      {/* Collected fields */}
      {collected.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Thông tin đã thu thập</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {collected.map((f: string) => (
              <Tag key={f} color="green" style={{ borderRadius: 4 }}>{FIELD_LABELS[f] ?? f.replace(/_/g, ' ')}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* Missing fields */}
      {missing.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Còn thiếu</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {missing.map((f: string) => (
              <Tag key={f} color="orange" style={{ borderRadius: 4 }}>{FIELD_LABELS[f] ?? f.replace(/_/g, ' ')}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* Last updated */}
      {data.last_updated && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Cập nhật: {new Date(data.last_updated).toLocaleString('vi-VN')}
        </Text>
      )}
    </div>
  );
}

function ChatInner() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { message: antMsg } = App.useApp();

  const { currentProject, fetchProject } = useProjectStore();
  const { messages, setMessages, isAiTyping, collectionProgress, updateProgress, streamingContent } = useChatStore();

  const [conversationId, setConversationId] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<{ label: string; data: any } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, isConnected } = useWebSocket(conversationId);

  useEffect(() => {
    fetchProject(projectId);
    (async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<Conversation[]>>(`/projects/${projectId}/conversations`);
        const convs = data.data ?? [];
        let conv = convs[0];
        if (!conv) {
          const res = await apiClient.post<ApiResponse<Conversation>>(`/projects/${projectId}/conversations`, {
            conversation_type: 'AI_COLLECT',
          });
          conv = res.data.data!;
        }
        setConversationId(conv.id);
        const msgsRes = await apiClient.get<ApiResponse<Message[]>>(`/conversations/${conv.id}/messages`);
        setMessages(msgsRes.data.data ?? []);
        const projRes = await apiClient.get<ApiResponse<any>>(`/projects/${projectId}`);
        updateProgress(projRes.data.data?.collection_progress ?? {});
      } catch {
        antMsg.error('Không thể tải cuộc trò chuyện');
      } finally {
        setLoadingConv(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = useCallback((content: string) => {
    if (!conversationId || !isConnected) {
      antMsg.warning('Chưa kết nối. Vui lòng chờ...');
      return;
    }
    sendMessage(conversationId, content);
  }, [conversationId, isConnected, sendMessage, antMsg]);

  const handleCategoryClick = useCallback((key: string, data: any) => {
    const LABELS: Record<string, string> = {
      COMPANY_INFO: 'Thông tin công ty', DEPARTMENTS: 'Phòng ban', EMPLOYEES: 'Nhân sự',
      WORKFLOWS: 'Quy trình làm việc', SALARY: 'Lương & phúc lợi', SCHEDULING: 'Lịch làm việc',
      FEATURES: 'Tính năng yêu cầu', SPECIAL_REQUIREMENTS: 'Yêu cầu đặc biệt', PRIORITIES: 'Ưu tiên',
    };
    setDrawerCategory({ label: LABELS[key] ?? key, data });
    setDrawerOpen(true);
  }, []);

  const progress = currentProject?.collection_progress ?? collectionProgress ?? {};
  const overallProgress = typeof progress.overall_progress === 'number' ? progress.overall_progress : 0;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '12px 20px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => router.push(`/projects/${projectId}`)} />
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: 0 }}>
            {currentProject?.project_name ?? 'Chat với AI'}
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <Progress percent={Math.round(overallProgress)} size="small" style={{ width: 200, margin: 0 }} />
            <Text style={{ fontSize: 12, color: isConnected ? '#52c41a' : '#faad14' }}>
              {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
            </Text>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 250, flexShrink: 0, background: '#fff', borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
          <CollectionSidebar progress={progress} onCategoryClick={handleCategoryClick} />
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {loadingConv ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
            ) : (
              <>
                {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}

                {/* Streaming bubble */}
                {isAiTyping && streamingContent && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LoadingOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    </div>
                    <div style={{ maxWidth: '70%', background: '#f5f5f5', color: '#333', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {stripMarkdown(streamingContent)}
                      <span style={{ display: 'inline-block', width: 2, height: 14, background: '#1890ff', marginLeft: 2, verticalAlign: 'middle', animation: 'chatBlink 0.8s infinite' }} />
                    </div>
                  </div>
                )}

                {/* Typing indicator */}
                {isAiTyping && !streamingContent && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LoadingOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    </div>
                    <div style={{ background: '#f5f5f5', padding: '10px 14px', borderRadius: '16px 16px 16px 4px' }}>
                      <Text style={{ color: '#999', fontSize: 13 }}>AI đang soạn câu trả lời...</Text>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <MessageInput onSend={handleSend} disabled={isAiTyping || !isConnected || loadingConv} />
        </div>
      </div>

      {/* Category Drawer */}
      <Drawer title={drawerCategory?.label} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={420}>
        {drawerCategory?.data ? (
          <CategoryDetail data={drawerCategory.data} />
        ) : (
          <Text type="secondary">Chưa có dữ liệu cho mục này.</Text>
        )}
      </Drawer>

      <style>{`
        @keyframes chatBlink { 0%,100% { opacity:1 } 50% { opacity:0 } }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  return <ChatInner />;
}
