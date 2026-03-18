'use client';

import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import { FundOutlined, ProjectOutlined, CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';

const Pie = dynamic(() => import('@ant-design/charts').then(m => m.Pie), { ssr: false });

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  COLLECTING: { label: 'Thu thập', color: 'processing' },
  COLLECTED: { label: 'Đã thu thập', color: 'cyan' },
  REVIEWING: { label: 'Review', color: 'orange' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  IN_PROGRESS: { label: 'Triển khai', color: 'purple' },
  COMPLETED: { label: 'Hoàn thành', color: 'success' },
  ON_HOLD: { label: 'Tạm dừng', color: 'default' },
};

export default function FinanceDashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/projects').then(r => {
      const d = r.data?.data ?? [];
      setProjects(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: projects.length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    active: projects.filter(p => ['IN_PROGRESS', 'APPROVED'].includes(p.status)).length,
    estimatedBudget: projects.reduce((s, p) => s + (p.estimated_budget ?? 0), 0),
    actualBudget: projects.reduce((s, p) => s + (p.actual_budget ?? 0), 0),
  }), [projects]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([s, v]) => ({ type: STATUS_MAP[s]?.label ?? s, value: v }));
  }, [projects]);

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 20 }}>Dashboard Tài chính</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Tổng dự án" value={stats.total} prefix={<ProjectOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Đang triển khai" value={stats.active} valueStyle={{ color: '#7C3AED' }} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Hoàn thành" value={stats.completed} valueStyle={{ color: '#10B981' }} prefix={<CheckCircleFilled />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Budget ước tính" value={stats.estimatedBudget} valueStyle={{ color: '#4F46E5' }} prefix={<FundOutlined />} suffix="₫" /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card title="Phân bổ dự án" style={{ borderRadius: 10 }}>
            {pieData.length > 0 ? (
              <Pie data={pieData} angleField="value" colorField="type" radius={0.85} innerRadius={0.6} height={220}
                legend={{ color: { position: 'bottom' } }} label={{ text: 'value', style: { fontSize: 12, fontWeight: 600 } }} />
            ) : <Text type="secondary">Chưa có dữ liệu</Text>}
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card title="Dự án gần đây" style={{ borderRadius: 10 }} bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={projects.slice(0, 5)}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: 'Dự án', dataIndex: 'project_name', key: 'name', ellipsis: true },
                { title: 'Mã', dataIndex: 'project_code', key: 'code', width: 90 },
                { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110,
                  render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
                { title: 'Ngày tạo', dataIndex: 'created_at', key: 'date', width: 100,
                  render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
