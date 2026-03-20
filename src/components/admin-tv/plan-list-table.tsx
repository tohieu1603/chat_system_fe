'use client';

import { Table, Tag, Button, Popconfirm, App } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import type { BusinessPlan } from '@/types/talent-venture';
import apiClient from '@/lib/api-client';

interface PlanRow extends BusinessPlan {
  team_name?: string;
  batch_name?: string;
  weighted_total?: number;
}

interface PlanListTableProps {
  data: PlanRow[];
  loading?: boolean;
  onRefresh?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp', SUBMITTED: 'Đã nộp', REVIEWING: 'Đang xét', APPROVED: 'Phê duyệt', REJECTED: 'Từ chối',
};
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default', SUBMITTED: 'blue', REVIEWING: 'orange', APPROVED: 'green', REJECTED: 'red',
};

export default function PlanListTable({ data, loading, onRefresh }: PlanListTableProps) {
  const router = useRouter();
  const { message } = App.useApp();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/business-plans/${id}`);
      message.success('Đã xóa kế hoạch');
      onRefresh?.();
    } catch { message.error('Lỗi xóa kế hoạch'); }
  };

  const columns: ColumnsType<PlanRow> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (v) => <strong>{v}</strong>,
    },
    { title: 'Đội nhóm', dataIndex: 'team_name', key: 'team_name', render: (v) => v ?? '—' },
    { title: 'Đợt tuyển', dataIndex: 'batch_name', key: 'batch_name', render: (v) => v ?? '—' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v] ?? v}</Tag>,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      width: 120,
      render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: 'Điểm tổng',
      dataIndex: 'weighted_total',
      key: 'weighted_total',
      width: 100,
      render: (v) => v != null ? <strong style={{ color: '#4F46E5' }}>{Number(v).toFixed(2)}</strong> : '—',
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Popconfirm title="Xóa kế hoạch này?" onConfirm={(e) => handleDelete(record.id, e as any)} onCancel={(e) => e?.stopPropagation()}>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      loading={loading}
      size="small"
      pagination={{ pageSize: 20 }}
      onRow={(record) => ({
        onClick: () => router.push(`/admin/ke-hoach/${record.id}/danh-gia`),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
