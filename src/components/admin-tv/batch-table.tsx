'use client';

import { Table, Tag, Button, Popconfirm, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Batch } from '@/types/talent-venture';

interface BatchTableProps {
  data: (Batch & { team_count?: number; candidate_count?: number; plan_count?: number })[];
  loading?: boolean;
  onEdit: (batch: Batch) => void;
  onDelete: (id: string) => void;
  onStatusTransition: (batch: Batch) => void;
}

const STATUS_LABELS: Record<string, string> = { UPCOMING: 'Sắp tới', OPEN: 'Đang mở', CLOSED: 'Đã đóng' };
const STATUS_COLORS: Record<string, string> = { UPCOMING: 'blue', OPEN: 'green', CLOSED: 'default' };

function nextStatus(status: string): string | null {
  if (status === 'UPCOMING') return 'OPEN';
  if (status === 'OPEN') return 'CLOSED';
  return null;
}

export default function BatchTable({ data, loading, onEdit, onDelete, onStatusTransition }: BatchTableProps) {
  const columns: ColumnsType<Batch & { team_count?: number }> = [
    {
      title: 'Tên đợt tuyển',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v] ?? v}</Tag>,
    },
    {
      title: 'Thời gian',
      key: 'dates',
      render: (_, r) => {
        if (!r.application_start && !r.application_end) return '—';
        const start = r.application_start ? new Date(r.application_start).toLocaleDateString('vi-VN') : '';
        const end = r.application_end ? new Date(r.application_end).toLocaleDateString('vi-VN') : '';
        return `${start} — ${end}`;
      },
    },
    { title: 'Giới hạn đội', dataIndex: 'max_teams', key: 'max_teams', width: 110, render: (v) => v ?? '—' },
    { title: 'Số đội', dataIndex: 'team_count', key: 'team_count', width: 80, render: (v) => v ?? 0 },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const next = nextStatus(record.status);
        return (
          <Space size="small">
            {next && (
              <Popconfirm
                title={`Chuyển sang "${STATUS_LABELS[next]}"?`}
                onConfirm={() => onStatusTransition(record)}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <Tooltip title={`Chuyển sang ${STATUS_LABELS[next]}`}>
                  <Button size="small" type="dashed" icon={<ArrowRightOutlined />}>
                    {STATUS_LABELS[next]}
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            <Popconfirm title="Xoá đợt tuyển này?" onConfirm={() => onDelete(record.id)} okText="Xoá" cancelText="Huỷ">
              <Button size="small" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      loading={loading}
      size="small"
      pagination={{ pageSize: 15 }}
    />
  );
}
