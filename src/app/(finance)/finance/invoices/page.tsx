'use client';

import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Result, Spin } from 'antd';
import { FileTextOutlined, ProjectOutlined, CheckCircleFilled, FundOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';

const { Title } = Typography;

export default function FinanceInvoicesPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/projects').then(r => {
      setProjects(Array.isArray(r.data?.data) ? r.data.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: projects.length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    estimatedBudget: projects.reduce((s, p) => s + (p.estimated_budget ?? 0), 0),
    actualBudget: projects.reduce((s, p) => s + (p.actual_budget ?? 0), 0),
  }), [projects]);

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 20 }}>Quản lý hóa đơn</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Tổng dự án" value={stats.total} prefix={<ProjectOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Hoàn thành" value={stats.completed} prefix={<CheckCircleFilled />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Budget ước tính" value={stats.estimatedBudget} prefix={<FundOutlined />} suffix="₫" /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 10 }}><Statistic title="Chi phí thực tế" value={stats.actualBudget} prefix={<FundOutlined />} suffix="₫" /></Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, textAlign: 'center' }}>
        <Result
          icon={<FileTextOutlined style={{ color: '#4F46E5' }} />}
          title="Tính năng đang phát triển"
          subTitle="Module quản lý hóa đơn, báo giá và thanh toán sẽ sớm được triển khai. Hiện tại bạn có thể xem tổng quan tài chính từ danh sách dự án."
        />
      </Card>
    </AppLayout>
  );
}
