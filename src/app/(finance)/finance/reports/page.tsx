'use client';

import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Table, Tag } from 'antd';
import { ProjectOutlined, CheckCircleFilled, SyncOutlined, FundOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';

const Pie = dynamic(() => import('@ant-design/charts').then(m => m.Pie), { ssr: false });
const Column = dynamic(() => import('@ant-design/charts').then(m => m.Column), { ssr: false });

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  COLLECTING: { label: 'Thu thập', color: '#4096ff' },
  COLLECTED: { label: 'Đã thu thập', color: '#36cfc9' },
  REVIEWING: { label: 'Review', color: '#ffa940' },
  APPROVED: { label: 'Đã duyệt', color: '#73d13d' },
  IN_PROGRESS: { label: 'Triển khai', color: '#b37feb' },
  COMPLETED: { label: 'Hoàn thành', color: '#52c41a' },
  ON_HOLD: { label: 'Tạm dừng', color: '#d9d9d9' },
};

export default function FinanceReportsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/projects').then(r => {
      setProjects(Array.isArray(r.data?.data) ? r.data.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    projects.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    return {
      total: projects.length,
      active: projects.filter(p => ['IN_PROGRESS', 'APPROVED'].includes(p.status)).length,
      completed: projects.filter(p => p.status === 'COMPLETED').length,
      estimatedBudget: projects.reduce((s, p) => s + (p.estimated_budget ?? 0), 0),
      byStatus,
    };
  }, [projects]);

  const pieData = useMemo(() =>
    Object.entries(stats.byStatus).map(([s, v]) => ({
      type: STATUS_MAP[s]?.label ?? s, value: v, color: STATUS_MAP[s]?.color ?? '#d9d9d9',
    })), [stats.byStatus]);

  const statusTable = useMemo(() =>
    Object.entries(stats.byStatus).map(([s, count]) => ({
      key: s, status: s, label: STATUS_MAP[s]?.label ?? s, count,
      pct: stats.total > 0 ? Math.round((count / stats.total) * 100) : 0,
    })), [stats]);

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 20 }}>Báo cáo tổng quan</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Tổng dự án" value={stats.total} prefix={<ProjectOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Đang triển khai" value={stats.active} prefix={<SyncOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Hoàn thành" value={stats.completed} prefix={<CheckCircleFilled />} valueStyle={{ color: '#10B981' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Budget ước tính" value={stats.estimatedBudget} prefix={<FundOutlined />} suffix="₫" /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <Card title="Phân bổ trạng thái" style={{ borderRadius: 10 }}>
            {pieData.length > 0 ? (
              <Pie data={pieData} angleField="value" colorField="type" radius={0.85} innerRadius={0.6} height={240}
                color={pieData.map(d => d.color)}
                legend={{ color: { position: 'bottom' } }}
                label={{ text: 'value', style: { fontSize: 13, fontWeight: 600, fill: '#fff' }, position: 'inside' }}
              />
            ) : <Text type="secondary">Chưa có dữ liệu</Text>}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Số dự án theo trạng thái" style={{ borderRadius: 10 }}>
            <Table
              dataSource={statusTable}
              rowKey="key"
              size="small"
              pagination={false}
              columns={[
                { title: 'Trạng thái', key: 'label', render: (_, r) => <Tag color={STATUS_MAP[r.status]?.color}>{r.label}</Tag> },
                { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 90 },
                { title: 'Tỷ lệ', key: 'pct', width: 80, render: (_, r) => `${r.pct}%` },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
