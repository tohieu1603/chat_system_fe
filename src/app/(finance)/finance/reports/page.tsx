'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0);

const STATUS_COLOR: Record<string, string> = { PENDING: 'orange', SENT: 'blue', PAID: 'green', OVERDUE: 'red', CANCELLED: 'default' };
const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ xử lý', SENT: 'Đã gửi', PAID: 'Đã thanh toán', OVERDUE: 'Quá hạn', CANCELLED: 'Huỷ' };

interface MonthlyStat {
  month: string;
  total: number;
  paid: number;
  pending: number;
  count: number;
}

interface Summary {
  total_revenue?: number;
  pending_amount?: number;
  paid_amount?: number;
  overdue_amount?: number;
  by_status?: Record<string, number>;
  monthly?: MonthlyStat[];
}

export default function FinanceReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/finance/summary').then((r) => {
      setSummary(r.data?.data ?? r.data);
    }).finally(() => setLoading(false));
  }, []);

  const monthly: MonthlyStat[] = summary?.monthly ?? [];

  const monthlyColumns: ColumnsType<MonthlyStat> = [
    { title: 'Tháng', dataIndex: 'month', key: 'month', width: 100 },
    { title: 'Tổng phát sinh', dataIndex: 'total', key: 'total', render: (v) => fmt(v) },
    { title: 'Đã thu', dataIndex: 'paid', key: 'paid', render: (v) => fmt(v) },
    { title: 'Chờ thu', dataIndex: 'pending', key: 'pending', render: (v) => fmt(v) },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 90 },
  ];

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
        <Title level={4}>Báo cáo tài chính</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Tổng doanh thu" value={fmt(summary?.total_revenue ?? 0)} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Đã thanh toán" value={fmt(summary?.paid_amount ?? 0)} valueStyle={{ color: '#52c41a' }} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Chờ thanh toán" value={fmt(summary?.pending_amount ?? 0)} valueStyle={{ color: '#fa8c16' }} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Quá hạn" value={fmt(summary?.overdue_amount ?? 0)} valueStyle={{ color: '#ff4d4f' }} /></Card>
          </Col>
        </Row>

        {summary?.by_status && (
          <Card title="Theo trạng thái" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              {Object.entries(summary.by_status).map(([status, amount]) => (
                <Col key={status} xs={12} sm={6}>
                  <Statistic
                    title={<Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status] ?? status}</Tag>}
                    value={fmt(amount)}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {monthly.length > 0 && (
          <Card title="Theo tháng">
            <Table dataSource={monthly} columns={monthlyColumns} rowKey="month" size="small" pagination={false} />
          </Card>
        )}
    </AppLayout>
  );
}
