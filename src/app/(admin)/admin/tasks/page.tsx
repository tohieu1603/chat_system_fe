'use client';

import { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Select, Typography, Card, Row, Col, Statistic, Progress, Tooltip, Avatar } from 'antd';
import {
  CheckCircleFilled, ClockCircleOutlined, SyncOutlined,
  ExclamationCircleFilled, StopOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { TaskItem } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const STATUS_CFG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  TODO:        { color: 'default',    label: 'Cần làm',     icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { color: 'processing', label: 'Đang làm',    icon: <SyncOutlined spin /> },
  IN_REVIEW:   { color: 'warning',    label: 'Đang review', icon: <ExclamationCircleFilled /> },
  DONE:        { color: 'success',    label: 'Hoàn thành',  icon: <CheckCircleFilled /> },
  BLOCKED:     { color: 'error',      label: 'Bị chặn',     icon: <StopOutlined /> },
};
const PRIORITY_CFG: Record<string, { color: string; label: string }> = {
  LOW: { color: 'default', label: 'Thấp' }, MEDIUM: { color: 'blue', label: 'TB' },
  HIGH: { color: 'orange', label: 'Cao' }, URGENT: { color: 'red', label: 'Khẩn' },
};
const TYPE_CFG: Record<string, { color: string }> = {
  BACKEND: { color: '#722ed1' }, FRONTEND: { color: '#1677ff' }, DATABASE: { color: '#13c2c2' },
  DESIGN: { color: '#eb2f96' }, DEVOPS: { color: '#52c41a' }, TESTING: { color: '#fa8c16' }, OTHER: { color: '#8c8c8c' },
};

export default function AdminAllTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>();

  useEffect(() => {
    apiClient.get('/tasks/all?limit=200').then((r) => {
      const d = r.data?.data ?? r.data;
      setTasks(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    tasks.filter(t =>
      (!statusFilter || t.status === statusFilter) &&
      (!assigneeFilter || t.assignee_id === assigneeFilter),
    ), [tasks, statusFilter, assigneeFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
  }), [tasks]);

  const assignees = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach(t => { if (t.assignee) map.set(t.assignee_id!, t.assignee.full_name); });
    return Array.from(map.entries());
  }, [tasks]);

  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const columns: ColumnsType<TaskItem> = [
    {
      title: 'Task', dataIndex: 'title', key: 'title', ellipsis: true,
      render: (v, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{v}</Text>
          {(r as any).project && <div><Text type="secondary" style={{ fontSize: 11 }}>{(r as any).project.project_name}</Text></div>}
        </div>
      ),
    },
    {
      title: 'Loại', dataIndex: 'task_type', key: 'task_type', width: 95,
      render: (v: string) => v ? <Tag color={TYPE_CFG[v]?.color} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{v}</Tag> : '—',
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => {
        const c = STATUS_CFG[s];
        return <Tag icon={c?.icon} color={c?.color} style={{ borderRadius: 4, margin: 0 }}>{c?.label}</Tag>;
      },
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 90,
      render: (p: string) => <Tag color={PRIORITY_CFG[p]?.color} style={{ borderRadius: 4, margin: 0 }}>{PRIORITY_CFG[p]?.label}</Tag>,
    },
    {
      title: 'Dev', key: 'assignee', width: 140,
      render: (_, r) => r.assignee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar size={22} style={{ background: '#1677ff', fontSize: 11 }}>{r.assignee.full_name[0]}</Avatar>
          <Text style={{ fontSize: 12 }}>{r.assignee.full_name}</Text>
        </div>
      ) : <Text type="secondary">—</Text>,
    },
    {
      title: 'Giờ', key: 'hours', width: 90,
      render: (_, r) => {
        if (!r.estimated_hours) return '—';
        const actual = r.actual_hours ?? 0;
        return (
          <Tooltip title={`${actual}/${r.estimated_hours}h`}>
            <Progress percent={Math.min(100, Math.round((actual / r.estimated_hours) * 100))} size="small"
              strokeColor={actual > r.estimated_hours ? '#ff4d4f' : '#1677ff'}
              format={() => `${actual}/${r.estimated_hours}h`} />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 20 }}>Tất cả Tasks</Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng', value: stats.total, color: undefined },
          { label: 'Cần làm', value: stats.todo, color: '#8c8c8c' },
          { label: 'Đang làm', value: stats.inProgress, color: '#1677ff' },
          { label: 'Review', value: stats.inReview, color: '#fa8c16' },
          { label: 'Hoàn thành', value: stats.done, color: '#52c41a' },
          { label: 'Bị chặn', value: stats.blocked, color: '#ff4d4f' },
        ].map(s => (
          <Col xs={8} sm={4} key={s.label}>
            <Card size="small" style={{ borderRadius: 8, textAlign: 'center', borderTop: s.color ? `3px solid ${s.color}` : undefined }}>
              <Statistic title={s.label} value={s.value} valueStyle={{ fontSize: 20, color: s.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: 0 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text strong style={{ fontSize: 14 }}>Tasks</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Tiến độ: {completionPct}%</Text>
            <Progress percent={completionPct} size="small" style={{ width: 120, margin: 0 }} strokeColor={completionPct >= 100 ? '#52c41a' : '#1677ff'} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <Select allowClear placeholder="Trạng thái" size="small" style={{ width: 140 }} onChange={setStatusFilter}>
                {Object.entries(STATUS_CFG).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
              </Select>
              <Select allowClear placeholder="Dev" size="small" style={{ width: 140 }} onChange={setAssigneeFilter}>
                {assignees.map(([id, name]) => <Select.Option key={id} value={id}>{name}</Select.Option>)}
              </Select>
            </div>
          </div>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 20, showTotal: (t) => `${t} tasks` }}
          onRow={(r) => ({ onClick: () => router.push(`/admin/projects/${r.project_id}/tasks`), style: { cursor: 'pointer' } })}
        />
      </Card>
    </AppLayout>
  );
}
