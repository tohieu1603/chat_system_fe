'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Typography, Card } from 'antd';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { Project, ProjectStatus } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const STATUS_COLOR: Record<ProjectStatus, string> = {
  COLLECTING: 'blue', COLLECTED: 'cyan', REVIEWING: 'orange',
  APPROVED: 'green', IN_PROGRESS: 'purple', COMPLETED: 'green', ON_HOLD: 'red',
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  COLLECTING: 'Đang thu thập', COLLECTED: 'Đã thu thập', REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn thành', ON_HOLD: 'Tạm dừng',
};

const PRIORITY_COLOR: Record<string, string> = { LOW: 'default', MEDIUM: 'blue', HIGH: 'orange', URGENT: 'red' };
const PRIORITY_LABEL: Record<string, string> = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', URGENT: 'Khẩn cấp' };

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  useEffect(() => {
    apiClient.get('/projects').then((res) => {
      const d = res.data?.data ?? res.data;
      setProjects(Array.isArray(d) ? d : d?.projects ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) =>
    (!statusFilter || p.status === statusFilter) &&
    (!priorityFilter || p.priority === priorityFilter),
  );

  const columns: ColumnsType<Project> = [
    { title: 'Mã dự án', dataIndex: 'project_code', key: 'project_code', width: 120 },
    {
      title: 'Tên dự án', dataIndex: 'project_name', key: 'project_name',
      render: (v, r) => <a onClick={() => router.push(`/admin/projects/${r.id}`)}>{v}</a>,
    },
    {
      title: 'Khách hàng', key: 'customer', width: 160,
      render: (_, r) => r.customer?.full_name ?? '—',
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 160,
      render: (s: ProjectStatus) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 110,
      render: (p: string) => <Tag color={PRIORITY_COLOR[p]}>{PRIORITY_LABEL[p]}</Tag>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', width: 130,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <AppLayout>
        <Title level={4}>Tất cả dự án</Title>
        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Select allowClear placeholder="Lọc trạng thái" style={{ width: 180 }} onChange={setStatusFilter}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
            </Select>
            <Select allowClear placeholder="Lọc ưu tiên" style={{ width: 150 }} onChange={setPriorityFilter}>
              {Object.entries(PRIORITY_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
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
