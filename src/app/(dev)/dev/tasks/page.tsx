'use client';

import { useEffect, useState, useMemo } from 'react';
import { Tag, Typography, Card, Row, Col, Progress, Statistic, Tooltip, Collapse, Badge } from 'antd';
import {
  FileTextOutlined, CheckCircleFilled, ClockCircleOutlined,
  ExclamationCircleFilled, SyncOutlined, StopOutlined, RightOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { TaskItem } from '@/types';

const { Title, Text } = Typography;

const STATUS_CFG: Record<string, { color: string; label: string; icon: React.ReactNode; tagColor: string }> = {
  TODO:        { color: '#f5f5f5', label: 'Cần làm',      icon: <ClockCircleOutlined />,      tagColor: 'default' },
  IN_PROGRESS: { color: '#e6f7ff', label: 'Đang làm',     icon: <SyncOutlined spin />,        tagColor: 'processing' },
  IN_REVIEW:   { color: '#fff7e6', label: 'Đang review',  icon: <ExclamationCircleFilled />,   tagColor: 'warning' },
  DONE:        { color: '#f6ffed', label: 'Hoàn thành',   icon: <CheckCircleFilled />,         tagColor: 'success' },
  BLOCKED:     { color: '#fff2f0', label: 'Bị chặn',      icon: <StopOutlined />,               tagColor: 'error' },
};
const PRIORITY_CFG: Record<string, { color: string; label: string }> = {
  LOW: { color: 'default', label: 'Thấp' }, MEDIUM: { color: 'blue', label: 'TB' },
  HIGH: { color: 'orange', label: 'Cao' }, URGENT: { color: 'red', label: 'Khẩn' },
};
const TYPE_CFG: Record<string, string> = {
  BACKEND: '#722ed1', FRONTEND: '#1677ff', DATABASE: '#13c2c2',
  DESIGN: '#eb2f96', DEVOPS: '#52c41a', TESTING: '#fa8c16', OTHER: '#8c8c8c',
};

export default function DevTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/tasks/my-tasks?limit=200').then((r) => {
      const d = r.data?.data ?? r.data;
      setTasks(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
  }), [tasks]);

  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  // Group by project
  const grouped = useMemo(() => {
    const map = new Map<string, { projectName: string; projectId: string; tasks: TaskItem[] }>();
    tasks.forEach(t => {
      const pid = t.project_id ?? 'unknown';
      const pName = (t as any).project?.project_name ?? 'Dự án không xác định';
      if (!map.has(pid)) map.set(pid, { projectName: pName, projectId: pid, tasks: [] });
      map.get(pid)!.tasks.push(t);
    });
    return Array.from(map.values());
  }, [tasks]);

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 20 }}>Tasks của tôi</Title>

      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng', value: stats.total, color: undefined },
          { label: 'Đang làm', value: stats.inProgress, color: '#1677ff' },
          { label: 'Hoàn thành', value: stats.done, color: '#52c41a' },
          { label: 'Bị chặn', value: stats.blocked, color: '#ff4d4f' },
        ].map(s => (
          <Col xs={12} sm={6} key={s.label}>
            <Card size="small" style={{ borderRadius: 8, textAlign: 'center', borderTop: s.color ? `3px solid ${s.color}` : undefined }}>
              <Statistic title={s.label} value={s.value} valueStyle={{ fontSize: 20, color: s.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Progress */}
      <Card size="small" style={{ marginBottom: 20, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text strong>Tiến độ tổng</Text>
          <Progress percent={completionPct} style={{ flex: 1, margin: 0 }} strokeColor={completionPct >= 100 ? '#52c41a' : '#4F46E5'} />
          <Text type="secondary">{stats.done}/{stats.total} tasks</Text>
        </div>
      </Card>

      {/* Grouped by project */}
      {loading ? (
        <Card loading style={{ borderRadius: 10 }} />
      ) : grouped.length === 0 ? (
        <Card style={{ borderRadius: 10, textAlign: 'center', padding: 40 }}>
          <Text type="secondary">Chưa có task nào được giao</Text>
        </Card>
      ) : (
        <Collapse
          defaultActiveKey={grouped.map(g => g.projectId)}
          style={{ background: 'transparent', border: 'none' }}
          expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
          items={grouped.map(group => {
            const done = group.tasks.filter(t => t.status === 'DONE').length;
            const pct = Math.round((done / group.tasks.length) * 100);
            return {
              key: group.projectId,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                  <ProjectOutlined style={{ color: '#4F46E5' }} />
                  <Text strong style={{ fontSize: 14 }}>{group.projectName}</Text>
                  <Badge count={group.tasks.length} style={{ background: '#4F46E5' }} />
                  <Progress percent={pct} size="small" style={{ width: 120, margin: '0 0 0 auto' }}
                    strokeColor={pct >= 100 ? '#52c41a' : '#4F46E5'} format={() => `${done}/${group.tasks.length}`} />
                  <Tooltip title="Xem tài liệu">
                    <FileTextOutlined
                      style={{ color: '#8c8c8c', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); router.push(`/dev/projects/${group.projectId}/document`); }}
                    />
                  </Tooltip>
                </div>
              ),
              style: { marginBottom: 12, borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden' },
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {group.tasks.map(task => {
                    const sCfg = STATUS_CFG[task.status];
                    const pCfg = PRIORITY_CFG[task.priority];
                    return (
                      <div
                        key={task.id}
                        onClick={() => router.push(`/dev/tasks/${task.id}`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                          borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s',
                          background: sCfg?.color ?? 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                        onMouseLeave={e => e.currentTarget.style.background = sCfg?.color ?? 'transparent'}
                      >
                        <span style={{ fontSize: 14 }}>{sCfg?.icon}</span>
                        <Text style={{ flex: 1, fontSize: 13 }}>{task.title}</Text>
                        {task.task_type && <Tag color={TYPE_CFG[task.task_type]} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{task.task_type}</Tag>}
                        <Tag color={pCfg?.color} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{pCfg?.label}</Tag>
                        <Tag icon={sCfg?.icon} color={sCfg?.tagColor} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{sCfg?.label}</Tag>
                        {task.estimated_hours && (
                          <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                            {task.actual_hours ?? 0}/{task.estimated_hours}h
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            };
          })}
        />
      )}
    </AppLayout>
  );
}
