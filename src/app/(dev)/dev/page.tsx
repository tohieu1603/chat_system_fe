'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Button, Typography, Spin, Progress, Empty } from 'antd';
import {
  CheckCircleFilled, ClockCircleOutlined, SyncOutlined,
  ExclamationCircleFilled, FileTextOutlined, RocketOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { TaskItem } from '@/types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  TODO: 'default', IN_PROGRESS: 'blue', IN_REVIEW: 'orange', DONE: 'green', BLOCKED: 'red',
};
const STATUS_LABEL: Record<string, string> = {
  TODO: 'Cần làm', IN_PROGRESS: 'Đang làm', IN_REVIEW: 'Đang review', DONE: 'Hoàn thành', BLOCKED: 'Bị chặn',
};
const PRIORITY_COLOR: Record<string, string> = { LOW: 'default', MEDIUM: 'blue', HIGH: 'orange', URGENT: 'red' };
const PRIORITY_LABEL: Record<string, string> = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', URGENT: 'Khẩn cấp' };

const cardStyle = { borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <Card bodyStyle={{ padding: '18px 20px' }} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color }}>{icon}</div>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: 1.2 }}>{label}</Text>
          <Text strong style={{ fontSize: 22, lineHeight: 1.3 }}>{value}</Text>
        </div>
      </div>
    </Card>
  );
}

export default function DevDashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/tasks/my-tasks').then((r) => {
      const d = r.data?.data ?? r.data;
      setTasks(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  }, []);

  const todo = tasks.filter(t => t.status === 'TODO');
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS');
  const inReview = tasks.filter(t => t.status === 'IN_REVIEW');
  const done = tasks.filter(t => t.status === 'DONE');
  const blocked = tasks.filter(t => t.status === 'BLOCKED');
  const donePct = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  // Group tasks by project
  const byProject: Record<string, TaskItem[]> = {};
  tasks.forEach(t => {
    const pid = t.project_id;
    if (!byProject[pid]) byProject[pid] = [];
    byProject[pid].push(t);
  });

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
      <Title level={4} style={{ margin: '0 0 20px' }}>Dashboard Dev</Title>

      {/* Stats */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}><StatCard icon={<ClockCircleOutlined />} label="Cần làm" value={todo.length} color="#8c8c8c" bg="#f5f5f5" /></Col>
        <Col xs={12} sm={6}><StatCard icon={<SyncOutlined />} label="Đang làm" value={inProgress.length} color="#1677ff" bg="#e6f4ff" /></Col>
        <Col xs={12} sm={6}><StatCard icon={<RocketOutlined />} label="Đang review" value={inReview.length} color="#fa8c16" bg="#fff7e6" /></Col>
        <Col xs={12} sm={6}><StatCard icon={<CheckCircleFilled />} label="Hoàn thành" value={done.length} color="#52c41a" bg="#f6ffed" /></Col>
      </Row>

      {/* Overall progress */}
      {tasks.length > 0 && (
        <Card style={{ ...cardStyle, marginBottom: 20 }} bodyStyle={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text strong style={{ fontSize: 13 }}>Tiến độ tổng thể</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{done.length}/{tasks.length} tasks</Text>
          </div>
          <Progress percent={donePct} strokeColor={donePct >= 100 ? '#52c41a' : '#1677ff'} />
        </Card>
      )}

      {tasks.length === 0 ? (
        <Card style={cardStyle}><Empty description="Chưa có task nào được giao" /></Card>
      ) : (
        <Row gutter={[14, 14]}>
          {/* Active tasks */}
          <Col xs={24} lg={14}>
            <Card
              title={<Text strong style={{ fontSize: 14 }}>Tasks cần xử lý</Text>}
              bodyStyle={{ padding: 0 }}
              style={cardStyle}
            >
              {[...inProgress, ...todo, ...blocked].slice(0, 8).map((t, i, arr) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/dev/tasks/${t.id}`)}
                  style={{
                    padding: '14px 20px', cursor: 'pointer', transition: 'background 0.2s',
                    borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>{t.title}</Text>
                    <Tag color={STATUS_COLOR[t.status]} style={{ margin: 0, fontSize: 11 }}>{STATUS_LABEL[t.status]}</Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Tag color={PRIORITY_COLOR[t.priority]} style={{ fontSize: 10, margin: 0 }}>{PRIORITY_LABEL[t.priority]}</Tag>
                    {t.due_date && <Text type="secondary" style={{ fontSize: 11 }}>Hạn: {new Date(t.due_date).toLocaleDateString('vi-VN')}</Text>}
                    {t.estimated_hours && <Text type="secondary" style={{ fontSize: 11 }}>{t.estimated_hours}h dự kiến</Text>}
                  </div>
                </div>
              ))}
            </Card>
          </Col>

          {/* Right sidebar */}
          <Col xs={24} lg={10}>
            {/* By project */}
            <Card title={<Text strong style={{ fontSize: 14 }}>Theo dự án</Text>} bodyStyle={{ padding: 0 }} style={{ ...cardStyle, marginBottom: 14 }}>
              {Object.entries(byProject).map(([pid, ptasks], i, arr) => {
                const projectName = ptasks[0]?.project_id ?? pid;
                const pdone = ptasks.filter(t => t.status === 'DONE').length;
                return (
                  <div key={pid} style={{ padding: '12px 20px', borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>{projectName.substring(0, 8)}...</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{pdone}/{ptasks.length} done</Text>
                    </div>
                    <Progress percent={Math.round((pdone / ptasks.length) * 100)} size="small" />
                    <Button type="link" size="small" style={{ padding: 0, fontSize: 11, marginTop: 2 }}
                      icon={<FileTextOutlined />}
                      onClick={() => router.push(`/dev/projects/${pid}/document`)}>
                      Xem tài liệu yêu cầu
                    </Button>
                  </div>
                );
              })}
            </Card>

            {/* Blocked */}
            {blocked.length > 0 && (
              <Card
                title={<Text strong style={{ fontSize: 14, color: '#ff4d4f' }}><ExclamationCircleFilled /> Bị chặn ({blocked.length})</Text>}
                bodyStyle={{ padding: 0 }}
                style={cardStyle}
              >
                {blocked.map((t, i) => (
                  <div key={t.id} onClick={() => router.push(`/dev/tasks/${t.id}`)}
                    style={{ padding: '10px 20px', borderBottom: i < blocked.length - 1 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer' }}>
                    <Text style={{ fontSize: 13 }}>{t.title}</Text>
                  </div>
                ))}
              </Card>
            )}
          </Col>
        </Row>
      )}
    </AppLayout>
  );
}
