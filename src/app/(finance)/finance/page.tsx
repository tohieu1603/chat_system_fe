'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { FinanceRecord } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const TYPE_COLOR: Record<string, string> = { QUOTE: 'blue', INVOICE: 'purple', PAYMENT: 'green' };
const TYPE_LABEL: Record<string, string> = { QUOTE: 'Báo giá', INVOICE: 'Hóa đơn', PAYMENT: 'Thanh toán' };
const STATUS_COLOR: Record<string, string> = { PENDING: 'orange', SENT: 'blue', PAID: 'green', OVERDUE: 'red', CANCELLED: 'default' };
const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ xử lý', SENT: 'Đã gửi', PAID: 'Đã thanh toán', OVERDUE: 'Quá hạn', CANCELLED: 'Huỷ' };

interface FinanceSummary {
  total_revenue?: number;
  pending_amount?: number;
  paid_amount?: number;
  recent_invoices?: FinanceRecord[];
}

export default function FinanceDashboardPage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/finance/summary').then((r) => {
      setSummary(r.data?.data ?? r.data);
    }).finally(() => setLoading(false));
  }, []);

  const recent: FinanceRecord[] = summary?.recent_invoices ?? [];

  const columns: ColumnsType<FinanceRecord> = [
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => <Tag color={TYPE_COLOR[t]}>{TYPE_LABEL[t]}</Tag>,
    },
    {
      title: 'Số tiền', dataIndex: 'amount', key: 'amount', width: 160,
      render: (v: number) => fmt(v),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
    },
    {
      title: 'Hạn thanh toán', dataIndex: 'due_date', key: 'due_date', width: 140,
      render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
    },
  ];

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
        <Title level={4}>Dashboard Tài chính</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card><Statistic title="Tổng doanh thu" value={fmt(summary?.total_revenue ?? 0)} /></Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card><Statistic title="Chờ thanh toán" value={fmt(summary?.pending_amount ?? 0)} valueStyle={{ color: '#fa8c16' }} /></Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card><Statistic title="Đã thanh toán" value={fmt(summary?.paid_amount ?? 0)} valueStyle={{ color: '#52c41a' }} /></Card>
          </Col>
        </Row>
        <Card title="Hóa đơn gần đây">
          <Table dataSource={recent} columns={columns} rowKey="id" size="small" pagination={false} />
        </Card>
    </AppLayout>
  );
}
