'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Typography, Card, Button } from 'antd';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { Project, ProjectStatus } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const fmt = (v?: number | null) => v != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '—';

const STATUS_COLOR: Record<ProjectStatus, string> = {
  COLLECTING: 'blue', COLLECTED: 'cyan', REVIEWING: 'orange',
  APPROVED: 'green', IN_PROGRESS: 'purple', COMPLETED: 'green', ON_HOLD: 'red',
};
const STATUS_LABEL: Record<ProjectStatus, string> = {
  COLLECTING: 'Đang thu thập', COLLECTED: 'Đã thu thập', REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn thành', ON_HOLD: 'Tạm dừng',
};

export default function FinanceProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    apiClient.get('/projects').then((res) => {
      const d = res.data?.data ?? res.data;
      setProjects(Array.isArray(d) ? d : d?.projects ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => !statusFilter || p.status === statusFilter);

  const columns: ColumnsType<Project> = [
    { title: 'Mã', dataIndex: 'project_code', key: 'project_code', width: 110 },
    {
      title: 'Tên dự án', dataIndex: 'project_name', key: 'project_name',
      render: (v, r) => <a onClick={() => router.push(`/finance/projects/${r.id}`)}>{v}</a>,
    },
    {
      title: 'Khách hàng', key: 'customer', width: 150,
      render: (_, r) => r.customer?.full_name ?? '—',
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: ProjectStatus) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
    },
    {
      title: 'Ngân sách dự kiến', dataIndex: 'estimated_budget', key: 'estimated_budget', width: 160,
      render: (v: number) => fmt(v),
    },
    {
      title: 'Ngân sách thực tế', dataIndex: 'actual_budget', key: 'actual_budget', width: 160,
      render: (v: number) => fmt(v),
    },
    {
      title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <AppLayout>
      <Title level={4}>Dự án & Tài chính</Title>
      <Card style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Space style={{ marginBottom: 16 }}>
          <Select allowClear placeholder="Lọc trạng thái" style={{ width: 180 }} onChange={setStatusFilter}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
          </Select>
        </Space>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </AppLayout>
  );
}
