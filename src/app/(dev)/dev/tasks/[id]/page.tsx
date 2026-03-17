'use client';

import { useEffect, useState } from 'react';
import { Descriptions, Tag, Button, Card, Select, Input, List, Typography, Spin, Space, message } from 'antd';
import { ArrowLeftOutlined, SendOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { TaskItem } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLOR: Record<string, string> = {
  TODO: 'default', IN_PROGRESS: 'blue', IN_REVIEW: 'orange', DONE: 'green', BLOCKED: 'red',
};
const STATUS_LABEL: Record<string, string> = {
  TODO: 'Cần làm', IN_PROGRESS: 'Đang làm', IN_REVIEW: 'Đang review', DONE: 'Hoàn thành', BLOCKED: 'Bị chặn',
};
const PRIORITY_COLOR: Record<string, string> = { LOW: 'default', MEDIUM: 'blue', HIGH: 'orange', URGENT: 'red' };

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS'],
  BLOCKED: ['TODO', 'IN_PROGRESS'],
  DONE: [],
};

interface Comment { id: string; content: string; created_at: string; sender?: { full_name: string }; }

export default function DevTaskDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [task, setTask] = useState<TaskItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string | undefined>();
  const [actualHours, setActualHours] = useState('');
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [tRes, cRes] = await Promise.all([
      apiClient.get(`/tasks/${id}`),
      apiClient.get(`/tasks/${id}/comments`).catch(() => ({ data: { data: [] } })),
    ]);
    const t = tRes.data?.data ?? tRes.data;
    setTask(t);
    setActualHours(String(t?.actual_hours ?? ''));
    const cd = cRes.data?.data ?? cRes.data;
    setComments(Array.isArray(cd) ? cd : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setSaving(true);
    try {
      await apiClient.put(`/tasks/${id}/status`, { status: newStatus });
      message.success('Cập nhật trạng thái thành công');
      setNewStatus(undefined);
      load();
    } catch { message.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleLogHours = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/tasks/${id}`, { actual_hours: parseFloat(actualHours) || 0 });
      message.success('Cập nhật giờ thành công');
      load();
    } catch { message.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSaving(true);
    try {
      await apiClient.post(`/tasks/${id}/comments`, { content: commentText });
      setCommentText('');
      load();
    } catch { message.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;
  if (!task) return <AppLayout><p>Không tìm thấy task.</p></AppLayout>;

  const allowedNext = ALLOWED_TRANSITIONS[task.status] ?? [];

  return (
    <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/dev/tasks')} />
          <Title level={4} style={{ margin: 0 }}>{task.title}</Title>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Trạng thái"><Tag color={STATUS_COLOR[task.status]}>{STATUS_LABEL[task.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="Ưu tiên"><Tag color={PRIORITY_COLOR[task.priority]}>{task.priority}</Tag></Descriptions.Item>
            <Descriptions.Item label="Giờ ước tính">{task.estimated_hours ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Giờ thực tế">{task.actual_hours ?? '—'}</Descriptions.Item>
            {task.due_date && <Descriptions.Item label="Hạn chót">{new Date(task.due_date).toLocaleDateString('vi-VN')}</Descriptions.Item>}
            {task.description && <Descriptions.Item label="Mô tả" span={2}>{task.description}</Descriptions.Item>}
          </Descriptions>
        </Card>

        {/* Quick actions */}
        {task.project_id && (
          <Button icon={<FileTextOutlined />} style={{ marginBottom: 16 }} onClick={() => router.push(`/dev/projects/${task.project_id}/document`)}>
            Xem tài liệu yêu cầu dự án
          </Button>
        )}

        <Card title="Cập nhật trạng thái" style={{ marginBottom: 16 }}>
          <Space>
            <Select style={{ width: 180 }} placeholder="Chọn trạng thái" onChange={setNewStatus} disabled={allowedNext.length === 0}>
              {allowedNext.map((s) => <Select.Option key={s} value={s}>{STATUS_LABEL[s]}</Select.Option>)}
            </Select>
            <Button type="primary" loading={saving} onClick={handleStatusUpdate} disabled={!newStatus}>Cập nhật</Button>
          </Space>
        </Card>

        <Card title="Ghi giờ thực tế" style={{ marginBottom: 16 }}>
          <Space>
            <Input
              type="number"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              style={{ width: 120 }}
              addonAfter="giờ"
            />
            <Button loading={saving} onClick={handleLogHours}>Lưu</Button>
          </Space>
        </Card>

        <Card title="Bình luận">
          <List
            dataSource={comments}
            renderItem={(c) => (
              <List.Item>
                <div>
                  <Text strong>{c.sender?.full_name ?? 'Ẩn danh'}</Text>
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{new Date(c.created_at).toLocaleString('vi-VN')}</Text>
                  <div>{c.content}</div>
                </div>
              </List.Item>
            )}
            style={{ marginBottom: 16 }}
          />
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              placeholder="Nhập bình luận..."
            />
            <Button type="primary" icon={<SendOutlined />} loading={saving} onClick={handleComment}>Gửi</Button>
          </Space.Compact>
        </Card>
    </AppLayout>
  );
}
