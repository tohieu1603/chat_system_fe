'use client';

import { Table, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/types';

interface CandidateRow extends User {
  university?: string;
  major?: string;
  team_name?: string;
  plan_status?: string;
  assessment_avg?: number;
}

interface CandidateListTableProps {
  data: CandidateRow[];
  loading?: boolean;
}

const PLAN_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default', SUBMITTED: 'blue', REVIEWING: 'orange', APPROVED: 'green', REJECTED: 'red',
};
const PLAN_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp', SUBMITTED: 'Đã nộp', REVIEWING: 'Đang xét', APPROVED: 'Phê duyệt', REJECTED: 'Từ chối',
};

export default function CandidateListTable({ data, loading }: CandidateListTableProps) {
  const router = useRouter();

  const columns: ColumnsType<CandidateRow> = [
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (v) => <strong>{v}</strong>,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Trường', dataIndex: 'university', key: 'university', render: (v) => v ?? '—' },
    { title: 'Đội nhóm', dataIndex: 'team_name', key: 'team_name', render: (v) => v ?? '—' },
    {
      title: 'TT kế hoạch',
      dataIndex: 'plan_status',
      key: 'plan_status',
      width: 120,
      render: (v) => v ? <Tag color={PLAN_STATUS_COLORS[v]}>{PLAN_STATUS_LABELS[v] ?? v}</Tag> : '—',
    },
    {
      title: 'Điểm TB',
      dataIndex: 'assessment_avg',
      key: 'assessment_avg',
      width: 90,
      render: (v) => v != null ? <strong style={{ color: '#4F46E5' }}>{Number(v).toFixed(1)}</strong> : '—',
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
        onClick: () => router.push(`/admin/ung-vien/${record.id}`),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
