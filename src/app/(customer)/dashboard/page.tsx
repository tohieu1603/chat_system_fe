'use client';

import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Tag, Button, Typography, Progress, Result, Spin, App, Tooltip, Statistic } from 'antd';
import {
  PlusOutlined, ArrowRightOutlined, ClockCircleOutlined, CheckCircleFilled,
  MessageOutlined, ProjectOutlined, SyncOutlined, RocketOutlined, FolderOpenOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Project, ProjectStatus } from '@/types';

const Pie = dynamic(() => import('@ant-design/charts').then(m => m.Pie), { ssr: false });
const Column = dynamic(() => import('@ant-design/charts').then(m => m.Column), { ssr: false });

const { Title, Text } = Typography;

const STATUS_MAP: Record<ProjectStatus, { color: string; label: string; chartColor: string }> = {
  COLLECTING:  { color: 'processing', label: 'Đang thu thập', chartColor: '#4096ff' },
  COLLECTED:   { color: 'cyan',       label: 'Đã thu thập',   chartColor: '#36cfc9' },
  REVIEWING:   { color: 'orange',     label: 'Đang review',   chartColor: '#ffa940' },
  APPROVED:    { color: 'green',      label: 'Đã duyệt',      chartColor: '#73d13d' },
  IN_PROGRESS: { color: 'purple',     label: 'Triển khai',     chartColor: '#b37feb' },
  COMPLETED:   { color: 'green',      label: 'Hoàn thành',     chartColor: '#52c41a' },
  ON_HOLD:     { color: 'default',    label: 'Tạm dừng',       chartColor: '#d9d9d9' },
};

function timeAgo(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  const days = Math.floor(h / 24);
  return days === 1 ? 'Hôm qua' : days < 30 ? `${days} ngày` : new Date(d).toLocaleDateString('vi-VN');
}

/** Normalize: progress data can be at root or under .categories */
function getCats(progress: Record<string, any> | undefined): Record<string, any> {
  if (!progress) return {};
  if (progress.categories && typeof progress.categories === 'object') return progress.categories;
  const KNOWN = ['COMPANY_INFO','DEPARTMENTS','EMPLOYEES','WORKFLOWS','SALARY','SCHEDULING','FEATURES','SPECIAL_REQUIREMENTS','PRIORITIES'];
  const out: Record<string, any> = {};
  for (const k of KNOWN) { if (progress[k]) out[k] = progress[k]; }
  return out;
}

function pct(p: Project): number {
  if (typeof p.collection_progress?.overall_progress === 'number') return Math.round(p.collection_progress.overall_progress);
  const cats = getCats(p.collection_progress);
  const total = Object.keys(cats).length || 9;
  // in_progress with fields_collected = done (backend marks in_progress even when collected)
  const done = Object.values(cats).filter((v: any) => v?.status === 'completed' || v?.status === 'done' || v?.fields_collected?.length > 0).length;
  if (done > 0) return Math.round((done / total) * 100);
  return ['COLLECTED', 'COMPLETED', 'APPROVED'].includes(p.status) ? 100 : 0;
}

function catCount(p: Project): { done: number; total: number } {
  const cats = getCats(p.collection_progress);
  const keys = Object.keys(cats);
  if (keys.length === 0) {
    // No category data — infer from status
    return ['COLLECTED', 'COMPLETED', 'APPROVED'].includes(p.status) ? { done: 9, total: 9 } : { done: 0, total: 9 };
  }
  const done = keys.filter(k => {
    const v = cats[k];
    return v?.status === 'completed' || v?.status === 'done' || v?.fields_collected?.length > 0;
  }).length;
  return { done, total: 9 };
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <Card bodyStyle={{ padding: '20px 24px' }} style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color }}>
          {icon}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: 1.2 }}>{label}</Text>
          <Text strong style={{ fontSize: 24, lineHeight: 1.3 }}>{value}</Text>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { message } = App.useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ApiResponse<Project[]>>('/projects')
      .then(({ data }) => setProjects(data.data ?? []))
      .catch(() => message.error('Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  const collecting = useMemo(() => projects.filter(p => p.status === 'COLLECTING'), [projects]);
  const done = useMemo(() => projects.filter(p => ['COLLECTED', 'COMPLETED', 'APPROVED'].includes(p.status)), [projects]);
  const inProgress = useMemo(() => projects.filter(p => p.status === 'IN_PROGRESS'), [projects]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      type: STATUS_MAP[status as ProjectStatus]?.label ?? status,
      value: count,
      color: STATUS_MAP[status as ProjectStatus]?.chartColor ?? '#d9d9d9',
    }));
  }, [projects]);

  const progressData = useMemo(() =>
    projects
      .map(p => ({
        name: p.project_name.length > 14 ? p.project_name.substring(0, 14) + '…' : p.project_name,
        progress: pct(p),
        status: STATUS_MAP[p.status]?.label ?? p.status,
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 8),
    [projects]
  );

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 120 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
          {user?.company_name && <Text type="secondary" style={{ fontSize: 13 }}>{user.company_name}</Text>}
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="middle" onClick={() => router.push('/projects/new')}>
          Dự án mới
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card style={{ borderRadius: 12 }}>
          <Result status="info" title="Bắt đầu thu thập yêu cầu"
            subTitle="Tạo dự án đầu tiên để AI giúp bạn thu thập thông tin xây dựng phần mềm."
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/projects/new')}>Tạo dự án đầu tiên</Button>}
          />
        </Card>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={12} sm={6}>
              <StatCard icon={<FolderOpenOutlined />} label="Tổng dự án" value={projects.length} color="#1677ff" bg="#e6f4ff" />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard icon={<SyncOutlined />} label="Đang thu thập" value={collecting.length} color="#fa8c16" bg="#fff7e6" />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard icon={<RocketOutlined />} label="Đang triển khai" value={inProgress.length} color="#722ed1" bg="#f9f0ff" />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard icon={<CheckCircleFilled />} label="Hoàn thành" value={done.length} color="#52c41a" bg="#f6ffed" />
            </Col>
          </Row>

          {/* ── Charts ── */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} md={10}>
              <Card
                title={<Text strong style={{ fontSize: 14 }}>Phân bổ trạng thái</Text>}
                bodyStyle={{ padding: '16px 20px' }}
                style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <Pie
                  data={pieData}
                  angleField="value"
                  colorField="type"
                  radius={0.85}
                  innerRadius={0.65}
                  height={220}
                  color={pieData.map(d => d.color)}
                  label={{ text: 'value', style: { fontSize: 13, fontWeight: 600, fill: '#fff' }, position: 'inside' }}
                  legend={{ color: { position: 'bottom', layout: { justifyContent: 'center' } } }}
                  tooltip={{ title: 'type' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={14}>
              <Card
                title={<Text strong style={{ fontSize: 14 }}>Tiến độ thu thập</Text>}
                bodyStyle={{ padding: '16px 20px' }}
                style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <Column
                  data={progressData}
                  xField="name"
                  yField="progress"
                  height={220}
                  color={(_datum: any, index: number) => {
                    const d = progressData[index];
                    if (!d) return '#4096ff';
                    return d.progress >= 100 ? '#52c41a' : d.progress >= 50 ? '#4096ff' : '#faad14';
                  }}
                  columnWidthRatio={0.45}
                  label={{ text: (d: any) => `${d.progress}%`, position: 'inside', style: { fill: '#fff', fontSize: 11, fontWeight: 600 } }}
                  axis={{
                    y: { title: '', labelFormatter: (v: number) => `${v}%` },
                    x: { title: '', label: { autoRotate: true, style: { fontSize: 11 } } },
                  }}
                  scale={{ y: { domain: [0, 100] } }}
                  style={{ radiusTopLeft: 4, radiusTopRight: 4 }}
                />
              </Card>
            </Col>
          </Row>

          {/* ── Project Lists ── */}
          <Row gutter={[16, 16]}>
            {/* Active projects */}
            <Col xs={24} lg={14}>
              <Card
                title={<Text strong style={{ fontSize: 14 }}>Dự án đang xử lý</Text>}
                extra={<Button type="link" size="small" onClick={() => router.push('/projects')}>Xem tất cả <ArrowRightOutlined /></Button>}
                bodyStyle={{ padding: 0 }}
                style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                {collecting.length === 0 ? (
                  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                    <Text type="secondary">Không có dự án đang thu thập</Text>
                  </div>
                ) : (
                  collecting.slice(0, 5).map((p, i) => {
                    const s = STATUS_MAP[p.status];
                    const c = catCount(p);
                    const progress = pct(p);
                    return (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/projects/${p.id}/chat`)}
                        style={{
                          padding: '16px 24px',
                          borderBottom: i < Math.min(collecting.length, 5) - 1 ? '1px solid #f5f5f5' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Text strong style={{ fontSize: 14 }}>{p.project_name}</Text>
                            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{p.project_code}</Text>
                          </div>
                          <Tag color={s.color} style={{ margin: 0, borderRadius: 4, fontSize: 11 }}>{s.label}</Tag>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                          <Progress
                            percent={progress}
                            size="small"
                            style={{ flex: 1, margin: 0 }}
                            strokeColor={progress >= 100 ? '#52c41a' : progress >= 50 ? '#1677ff' : '#faad14'}
                          />
                          <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{c.done}/{c.total} mục</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />{timeAgo(p.updated_at)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11, color: '#1677ff' }}>
                            <MessageOutlined style={{ marginRight: 4 }} />Tiếp tục
                          </Text>
                        </div>
                      </div>
                    );
                  })
                )}
              </Card>
            </Col>

            {/* Right sidebar */}
            <Col xs={24} lg={10}>
              {/* Completed */}
              <Card
                title={<Text strong style={{ fontSize: 14 }}>Hoàn thành gần đây</Text>}
                bodyStyle={{ padding: done.length ? 0 : undefined }}
                style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                {done.length === 0 ? (
                  <Text type="secondary" style={{ fontSize: 13 }}>Chưa có dự án hoàn thành</Text>
                ) : (
                  done.slice(0, 5).map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/projects/${p.id}`)}
                      style={{
                        padding: '12px 20px',
                        borderBottom: i < Math.min(done.length, 5) - 1 ? '1px solid #f5f5f5' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14 }} />
                        <div>
                          <Text strong style={{ fontSize: 13, display: 'block' }}>{p.project_name}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>{p.project_code}</Text>
                        </div>
                      </div>
                      <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{timeAgo(p.updated_at)}</Text>
                    </div>
                  ))
                )}
              </Card>

              {/* All projects quick list */}
              <Card
                title={<Text strong style={{ fontSize: 14 }}>Tất cả dự án</Text>}
                bodyStyle={{ padding: 0 }}
                style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                {projects.slice(0, 6).map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/projects/${p.id}`)}
                    style={{
                      padding: '10px 20px',
                      borderBottom: i < Math.min(projects.length, 6) - 1 ? '1px solid #f5f5f5' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Text style={{ fontSize: 13 }}>{p.project_name}</Text>
                    <Tag
                      color={STATUS_MAP[p.status].color}
                      style={{ margin: 0, borderRadius: 4, fontSize: 10 }}
                    >
                      {STATUS_MAP[p.status].label}
                    </Tag>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </AppLayout>
  );
}
