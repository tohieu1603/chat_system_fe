'use client';

import { useEffect } from 'react';
import { Typography, Spin, Row, Col, Card } from 'antd';
import { useTeamStore } from '@/stores/team-store';
import CreateTeamForm from '@/components/team/create-team-form';
import JoinTeamForm from '@/components/team/join-team-form';
import TeamDetailCard from '@/components/team/team-detail-card';
import MemberList from '@/components/team/member-list';

const { Title, Text } = Typography;

export default function DoiNhomPage() {
  const { team, members, fetchMyTeam, isLoading } = useTeamStore();

  useEffect(() => {
    fetchMyTeam();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Đội nhóm</Title>
        <Text type="secondary">
          {team ? `${team.name} — ${members.length}/${team.max_members} thành viên` : 'Tạo hoặc tham gia một đội nhóm để bắt đầu'}
        </Text>
      </div>

      {!team ? (
        // No team — show create/join forms
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <CreateTeamForm />
          </Col>
          <Col xs={24} md={12}>
            <JoinTeamForm />
          </Col>
        </Row>
      ) : (
        // Has team
        <div>
          <TeamDetailCard team={team} />

          <Card
            title={<Text strong>Danh sách thành viên</Text>}
            style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
            styles={{ body: { padding: 0 } }}
          >
            <MemberList members={members} />
          </Card>
        </div>
      )}
    </div>
  );
}
