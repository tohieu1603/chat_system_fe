'use client';

import { useEffect, useState } from 'react';
import { Tag, Button, Card, Select, Input, List, Typography, Spin, Row, Col, Progress, Tooltip, message, Avatar } from 'antd';
import {
  ArrowLeftOutlined, SendOutlined, FileTextOutlined, ClockCircleOutlined,
  CheckCircleFilled, SyncOutlined, ExclamationCircleFilled, StopOutlined,
  CodeOutlined, FieldTimeOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { TaskItem } from '@/types';

const { Title, Text, Paragraph } = Typography;

const STATUS_CFG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  TODO:        { color: 'default',    label: 'Cần làm',     icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { color: 'processing', label: 'Đang làm',    icon: <SyncOutlined spin /> },
  IN_REVIEW:   { color: 'warning',    label: 'Đang review', icon: <ExclamationCircleFilled /> },
  DONE:        { color: 'success',    label: 'Hoàn thành',  icon: <CheckCircleFilled /> },
  BLOCKED:     { color: 'error',      label: 'Bị chặn',     icon: <StopOutlined /> },
};
const PRIORITY_CFG: Record<string, { color: string; label: string }> = {
  LOW: { color: 'default', label: 'Thấp' }, MEDIUM: { color: 'blue', label: 'Trung bình' },
  HIGH: { color: 'orange', label: 'Cao' }, URGENT: { color: 'red', label: 'Khẩn cấp' },
};
const TYPE_CFG: Record<string, { color: string }> = {
  BACKEND: { color: '#722ed1' }, FRONTEND: { color: '#1677ff' }, DATABASE: { color: '#13c2c2' },
  DESIGN: { color: '#eb2f96' }, DEVOPS: { color: '#52c41a' }, TESTING: { color: '#fa8c16' }, OTHER: { color: '#8c8c8c' },
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  TODO: ['IN_PROGRESS'], IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS'], BLOCKED: ['TODO', 'IN_PROGRESS'], DONE: [],
};

interface Comment { id: string; content: string; created_at: string; user?: { full_name: string }; }

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
  if (!task) return <AppLayout><Text>Không tìm thấy task.</Text></AppLayout>;

  const allowedNext = ALLOWED_TRANSITIONS[task.status] ?? [];
  const sCfg = STATUS_CFG[task.status];
  const pCfg = PRIORITY_CFG[task.priority];
  const hoursPct = task.estimated_hours ? Math.min(100, Math.round(((task.actual_hours ?? 0) / task.estimated_hours) * 100)) : 0;

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/dev/tasks')} />
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ margin: 0 }}>{task.title}</Title>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Tag icon={sCfg?.icon} color={sCfg?.color} style={{ borderRadius: 4 }}>{sCfg?.label}</Tag>
            <Tag color={pCfg?.color} style={{ borderRadius: 4 }}>{pCfg?.label}</Tag>
            {task.task_type && <Tag color={TYPE_CFG[task.task_type]?.color} style={{ borderRadius: 4 }}>{task.task_type}</Tag>}
          </div>
        </div>
        <Button icon={<FileTextOutlined />} onClick={() => router.push(`/dev/projects/${task.project_id}/document`)}>
          Tài liệu yêu cầu
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left: Info + Description */}
        <Col xs={24} lg={16}>
          {/* Description */}
          <Card title={<Text strong style={{ fontSize: 14 }}>Mô tả</Text>} style={{ marginBottom: 16, borderRadius: 10 }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 13 }}>
              {task.description || 'Chưa có mô tả.'}
            </Paragraph>
          </Card>

          {/* Comments */}
          <Card title={<Text strong style={{ fontSize: 14 }}>Bình luận ({comments.length})</Text>} style={{ borderRadius: 10 }}>
            {comments.length > 0 && (
              <List
                dataSource={comments}
                renderItem={(c) => (
                  <List.Item style={{ padding: '10px 0', border: 'none' }}>
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                      <Avatar size={32} style={{ background: '#1677ff', flexShrink: 0 }}>
                        {(c.user?.full_name ?? '?')[0]}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text strong style={{ fontSize: 13 }}>{c.user?.full_name ?? 'Ẩn danh'}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>{new Date(c.created_at).toLocaleString('vi-VN')}</Text>
                        </div>
                        <Text style={{ fontSize: 13 }}>{c.content}</Text>
                      </div>
                    </div>
                  </List.Item>
                )}
                style={{ marginBottom: 12 }}
              />
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <Input.TextArea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="Nhập bình luận..."
                style={{ flex: 1, borderRadius: 8 }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
              />
              <Button type="primary" icon={<SendOutlined />} loading={saving} onClick={handleComment}
                style={{ alignSelf: 'flex-end', borderRadius: 8 }}>
                Gửi
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right: Actions */}
        <Col xs={24} lg={8}>
          {/* Info cards */}
          <Card size="small" style={{ marginBottom: 12, borderRadius: 10 }} bodyStyle={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}><FieldTimeOutlined /> Giờ ước tính</Text>
                <Text strong>{task.estimated_hours ?? '—'}h</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}><ClockCircleOutlined /> Giờ thực tế</Text>
                <Text strong>{task.actual_hours ?? 0}h</Text>
              </div>
              {task.estimated_hours && (
                <Progress percent={hoursPct} size="small"
                  strokeColor={hoursPct > 100 ? '#ff4d4f' : hoursPct > 80 ? '#faad14' : '#1677ff'}
                />
              )}
              {task.due_date && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Hạn chót</Text>
                  <Text strong style={{ color: new Date(task.due_date) < new Date() ? '#ff4d4f' : undefined }}>
                    {new Date(task.due_date).toLocaleDateString('vi-VN')}
                  </Text>
                </div>
              )}
              {task.assignee && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Giao cho</Text>
                  <Text strong>{task.assignee.full_name}</Text>
                </div>
              )}
            </div>
          </Card>

          {/* Status update */}
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Cập nhật trạng thái</Text>}
            style={{ marginBottom: 12, borderRadius: 10 }}>
            {allowedNext.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>Task đã hoàn thành</Text>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Select style={{ flex: 1 }} size="small" placeholder="Chọn" onChange={setNewStatus} value={newStatus}>
                  {allowedNext.map(s => (
                    <Select.Option key={s} value={s}>
                      <Tag icon={STATUS_CFG[s]?.icon} color={STATUS_CFG[s]?.color} style={{ margin: 0, borderRadius: 4 }}>
                        {STATUS_CFG[s]?.label}
                      </Tag>
                    </Select.Option>
                  ))}
                </Select>
                <Button type="primary" size="small" loading={saving} onClick={handleStatusUpdate} disabled={!newStatus}>
                  Cập nhật
                </Button>
              </div>
            )}
          </Card>

          {/* Log hours */}
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Ghi giờ thực tế</Text>}
            style={{ borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                type="number" size="small" value={actualHours}
                onChange={(e) => setActualHours(e.target.value)}
                style={{ flex: 1 }} suffix="giờ" min={0}
              />
              <Button size="small" loading={saving} onClick={handleLogHours}>Lưu</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
