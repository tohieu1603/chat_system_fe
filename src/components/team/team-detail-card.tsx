'use client';

import { Card, Typography, Tag, Button, Space } from 'antd';
import { TeamOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { Team } from '@/types/talent-venture';
import InviteCodeDisplay from './invite-code-display';

const { Title, Text } = Typography;

interface TeamDetailCardProps {
  team: Team;
}

export default function TeamDetailCard({ team }: TeamDetailCardProps) {
  const router = useRouter();

  return (
    <Card
      style={{ borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 16 }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#4F46E5' }}>
            <TeamOutlined />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>{team.name}</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {team.members.length}/{team.max_members} thành viên
            </Text>
          </div>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => router.push('/ke-hoach')}
          >
            Kế hoạch <ArrowRightOutlined />
          </Button>
        </Space>
      </div>

      {team.description && (
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
          {team.description}
        </Text>
      )}

      <InviteCodeDisplay code={team.invite_code} />
    </Card>
  );
}
