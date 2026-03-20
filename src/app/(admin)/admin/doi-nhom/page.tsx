'use client';

import { useEffect, useState } from 'react';
import { Typography, Table, Tag, Button, Popconfirm, App } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';

const { Title } = Typography;

interface TeamRow {
  id: string;
  name: string;
  invite_code: string;
  max_members: number;
  batch?: { name: string };
  members?: { user_id: string; role: string; user?: { full_name: string; email: string } }[];
  created_at: string;
}

export default function AdminDoiNhomPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchTeams = () => {
    setLoading(true);
    apiClient.get('/teams')
      .then(({ data }) => {
        const d = data?.data ?? data;
        setTeams(Array.isArray(d) ? d : d?.items ?? []);
      })
      .catch(() => message.error('Tải dữ liệu thất bại'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/teams/${id}`);
      message.success('Đã xóa đội nhóm');
      fetchTeams();
    } catch { message.error('Lỗi xóa đội nhóm'); }
  };

  const columns: ColumnsType<TeamRow> = [
    { title: 'Tên đội', dataIndex: 'name', key: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Mã mời', dataIndex: 'invite_code', key: 'invite_code', render: (v) => <code>{v}</code> },
    { title: 'Đợt tuyển', key: 'batch', render: (_, r) => r.batch?.name ?? '—' },
    {
      title: 'Thành viên',
      key: 'members',
      render: (_, r) => `${r.members?.length ?? 0}/${r.max_members}`,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Popconfirm title="Xóa đội nhóm này?" onConfirm={() => handleDelete(record.id)}>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 16 }}>Danh sách đội nhóm</Title>
      <Table
        dataSource={teams}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 20 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '8px 0' }}>
              {record.members?.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <span style={{ fontSize: 13 }}>{m.user?.full_name ?? m.user_id}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{m.user?.email}</span>
                  <Tag color={m.role === 'LEADER' ? 'blue' : undefined} style={{ fontSize: 11 }}>
                    {m.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                  </Tag>
                </div>
              ))}
            </div>
          ),
        }}
      />
    </AppLayout>
  );
}
