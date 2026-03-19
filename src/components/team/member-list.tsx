'use client';

import { Table, Tag, Avatar, Button, Popconfirm, Typography, App } from 'antd';
import { UserOutlined, DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TeamMember } from '@/types/talent-venture';
import { useTeamStore } from '@/stores/team-store';
import { useAuthStore } from '@/stores/auth-store';

const { Text } = Typography;

interface MemberListProps {
  members: TeamMember[];
}

export default function MemberList({ members }: MemberListProps) {
  const { removeMember, isLoading } = useTeamStore();
  const { user } = useAuthStore();
  const { message } = App.useApp();

  const currentMember = members.find(m => m.user_id === user?.id);
  const isLeader = currentMember?.role === 'LEADER';

  const handleRemove = async (memberId: string) => {
    try {
      await removeMember(memberId);
      message.success('Đã xóa thành viên');
    } catch {
      message.error('Không thể xóa thành viên');
    }
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: 'Thành viên',
      dataIndex: 'user',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size="small"
            src={record.user?.avatar_url}
            icon={!record.user?.avatar_url ? <UserOutlined /> : undefined}
          />
          <div>
            <Text strong style={{ fontSize: 13 }}>
              {record.user?.full_name ?? 'Chưa cập nhật'}
            </Text>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              {record.user?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: 'LEADER' | 'MEMBER') => (
        <Tag
          icon={role === 'LEADER' ? <CrownOutlined /> : undefined}
          color={role === 'LEADER' ? 'gold' : 'default'}
        >
          {role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
        </Tag>
      ),
    },
    {
      title: 'Tham gia',
      dataIndex: 'joined_at',
      key: 'joined_at',
      width: 120,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(date).toLocaleDateString('vi-VN')}
        </Text>
      ),
    },
    ...(isLeader
      ? [
          {
            title: '',
            key: 'action',
            width: 60,
            render: (_: any, record: TeamMember) =>
              record.role !== 'LEADER' ? (
                <Popconfirm
                  title="Xóa thành viên này?"
                  onConfirm={() => handleRemove(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={isLoading}
                  />
                </Popconfirm>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <Table
      columns={columns}
      dataSource={members}
      rowKey="id"
      pagination={false}
      size="small"
      style={{ borderRadius: 8 }}
    />
  );
}
