'use client';

import { Typography, Tag, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { Team } from '@/types/talent-venture';
import InviteCodeDisplay from './invite-code-display';

const { Text } = Typography;

interface TeamDetailCardProps {
  team: Team;
}

export default function TeamDetailCard({ team }: TeamDetailCardProps) {
  const router = useRouter();
  const memberCount = team.members.length;
  const maxMembers = team.max_members;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
      {/* Team info */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{team.name}</Text>
            <Tag color="green" style={{ margin: 0, fontSize: 11, borderRadius: 4 }}>Hoạt động</Tag>
          </div>
          {team.description && (
            <Text style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>{team.description}</Text>
          )}
          <Text style={{ fontSize: 13, color: '#888' }}>{memberCount}/{maxMembers} thành viên</Text>
        </div>
        <Button
          onClick={() => router.push('/ke-hoach')}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          Xem kế hoạch <ArrowRightOutlined />
        </Button>
      </div>

      {/* Invite code */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
        <InviteCodeDisplay code={team.invite_code} />
      </div>
    </div>
  );
}
