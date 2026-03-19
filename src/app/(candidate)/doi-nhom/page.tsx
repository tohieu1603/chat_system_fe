'use client';

import { useEffect } from 'react';
import { Typography, Spin, Row, Col, Card } from 'antd';
import { useTeamStore } from '@/stores/team-store';
import CreateTeamForm from '@/components/team/create-team-form';
import JoinTeamForm from '@/components/team/join-team-form';
import TeamDetailCard from '@/components/team/team-detail-card';
import MemberList from '@/components/team/member-list';

const { Text } = Typography;

export default function DoiNhomPage() {
  const { team, members, fetchMyTeam, isLoading } = useTeamStore();

  useEffect(() => { fetchMyTeam(); }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 600, color: '#111', display: 'block' }}>Đội nhóm</Text>
        <Text style={{ fontSize: 14, color: '#888' }}>
          {team ? `${team.name} — ${members.length}/${team.max_members} thành viên` : 'Tạo hoặc tham gia một đội nhóm để bắt đầu'}
        </Text>
      </div>

      {!team ? (
        <div>
          {/* No team banner */}
          <div style={{ padding: '20px 24px', border: '1px dashed #d1d5db', borderRadius: 6, marginBottom: 24, background: '#fafafa' }}>
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#111', display: 'block', marginBottom: 4 }}>Bạn chưa có đội nhóm</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>
              Mỗi đội gồm 2-3 thành viên. Tạo đội mới hoặc tham gia bằng mã mời từ trưởng nhóm.
            </Text>
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}><CreateTeamForm /></Col>
            <Col xs={24} md={12}><JoinTeamForm /></Col>
          </Row>
        </div>
      ) : (
        <div>
          <TeamDetailCard team={team} />

          <Card
            title={<Text style={{ fontSize: 14, fontWeight: 600 }}>Danh sách thành viên</Text>}
            style={{ borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 16 }}
            styles={{ header: { borderBottom: '1px solid #f0f0f0', padding: '12px 20px' }, body: { padding: 0 } }}
          >
            <MemberList members={members} />
          </Card>
        </div>
      )}
    </div>
  );
}
