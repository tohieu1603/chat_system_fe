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

  const currentMember = members.find((m) => m.user_id === user?.id);
  const isLeader = currentMember?.role === 'LEADER';

  const handleRemove = async (memberId: string) => {
    try {
      await removeMember(memberId);
      message.success('Da xoa thanh vien');
    } catch {
      message.error('Khong the xoa thanh vien');
    }
  };

  const avatarColors = [
    '#4F46E5', '#059669', '#7C3AED', '#F59E0B',
    '#DC2626', '#0891B2', '#D97706',
  ];

  const columns: ColumnsType<TeamMember> = [
    {
      title: (
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Thanh vien
        </Text>
      ),
      dataIndex: 'user',
      key: 'user',
      render: (_, record, idx) => {
        const name = record.user?.full_name ?? 'Chua cap nhat';
        const initials = name
          .split(' ')
          .filter(Boolean)
          .slice(-2)
          .map((w: string) => w[0]?.toUpperCase() ?? '')
          .join('');
        const color = avatarColors[idx % avatarColors.length];

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={38}
              src={record.user?.avatar_url}
              style={
                !record.user?.avatar_url
                  ? { background: color, fontSize: 14, fontWeight: 600 }
                  : undefined
              }
              icon={!record.user?.avatar_url && !initials ? <UserOutlined /> : undefined}
            >
              {!record.user?.avatar_url && initials ? initials : undefined}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 13, display: 'block', color: '#111827' }}>
                {name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                {record.user?.email}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Vai tro
        </Text>
      ),
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: 'LEADER' | 'MEMBER') =>
        role === 'LEADER' ? (
          <Tag
            icon={<CrownOutlined />}
            color="gold"
            style={{ borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}
          >
            Truong nhom
          </Tag>
        ) : (
          <Tag
            style={{
              borderRadius: 8,
              padding: '2px 10px',
              background: '#F8FAFC',
              color: '#64748B',
              border: '1px solid #E2E8F0',
            }}
          >
            Thanh vien
          </Tag>
        ),
    },
    {
      title: (
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tham gia
        </Text>
      ),
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
            width: 52,
            render: (_: any, record: TeamMember) =>
              record.role !== 'LEADER' ? (
                <Popconfirm
                  title="Xoa thanh vien nay?"
                  onConfirm={() => handleRemove(record.id)}
                  okText="Xoa"
                  cancelText="Huy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={isLoading}
                    style={{ opacity: 0.6 }}
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
      size="middle"
      style={{ borderRadius: 16 }}
      rowClassName={(_, idx) => (idx % 2 === 1 ? '' : '')}
    />
  );
}
