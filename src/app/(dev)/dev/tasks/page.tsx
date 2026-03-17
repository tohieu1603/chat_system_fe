'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Typography, Card, Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { TaskItem } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  TODO: 'default', IN_PROGRESS: 'blue', IN_REVIEW: 'orange', DONE: 'green', BLOCKED: 'red',
};
const STATUS_LABEL: Record<string, string> = {
  TODO: 'Cần làm', IN_PROGRESS: 'Đang làm', IN_REVIEW: 'Đang review', DONE: 'Hoàn thành', BLOCKED: 'Bị chặn',
};
const PRIORITY_COLOR: Record<string, string> = { LOW: 'default', MEDIUM: 'blue', HIGH: 'orange', URGENT: 'red' };
const PRIORITY_LABEL: Record<string, string> = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', URGENT: 'Khẩn cấp' };

export default function DevTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  useEffect(() => {
    apiClient.get('/tasks/my-tasks').then((r) => {
      const d = r.data?.data ?? r.data;
      setTasks(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) =>
    (!statusFilter || t.status === statusFilter) &&
    (!priorityFilter || t.priority === priorityFilter),
  );

  const columns: ColumnsType<TaskItem> = [
    {
      title: 'Tiêu đề', dataIndex: 'title', key: 'title',
      render: (v, r) => <a onClick={() => router.push(`/dev/tasks/${r.id}`)}>{v}</a>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
      filters: Object.entries(STATUS_LABEL).map(([k, v]) => ({ text: v, value: k })),
      onFilter: (v, r) => r.status === v,
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 110,
      render: (p: string) => <Tag color={PRIORITY_COLOR[p]}>{PRIORITY_LABEL[p]}</Tag>,
    },
    {
      title: 'Loại', dataIndex: 'task_type', key: 'task_type', width: 110,
      render: (v: string) => v ? <Tag>{v}</Tag> : '—',
    },
    {
      title: 'Giờ', key: 'hours', width: 90,
      render: (_, r) => r.estimated_hours ? `${r.actual_hours ?? 0}/${r.estimated_hours}h` : '—',
    },
    {
      title: 'Hạn chót', dataIndex: 'due_date', key: 'due_date', width: 120,
      render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
      sorter: (a, b) => new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime(),
    },
    {
      title: '', key: 'actions', width: 40,
      render: (_, r) => (
        <Button type="link" size="small" icon={<FileTextOutlined />}
          onClick={(e) => { e.stopPropagation(); router.push(`/dev/projects/${r.project_id}/document`); }}
          title="Xem tài liệu"
        />
      ),
    },
  ];

  return (
    <AppLayout>
      <Title level={4}>Tasks của tôi</Title>
      <Card style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Space style={{ marginBottom: 16 }}>
          <Select allowClear placeholder="Lọc trạng thái" style={{ width: 160 }} onChange={setStatusFilter}>
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
          onRow={(r) => ({ onClick: () => router.push(`/dev/tasks/${r.id}`), style: { cursor: 'pointer' } })}
        />
      </Card>
    </AppLayout>
  );
}
