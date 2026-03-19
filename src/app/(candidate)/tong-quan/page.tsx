'use client';

import { useEffect, useState } from 'react';
import { Typography, Spin, Row, Col } from 'antd';
import { useAuthStore } from '@/stores/auth-store';
import { useTeamStore } from '@/stores/team-store';
import { usePlanStore } from '@/stores/plan-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Notification } from '@/types';
import StatCards from '@/components/candidate-dashboard/stat-cards';
import BenefitsSection from '@/components/candidate-dashboard/benefits-section';
import RecentNotifications from '@/components/candidate-dashboard/recent-notifications';

const { Title, Text } = Typography;

export default function TongQuanPage() {
  const { user } = useAuthStore();
  const { team, fetchMyTeam } = useTeamStore();
  const { plans, fetchMyPlans } = usePlanStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMyTeam(),
      fetchMyPlans(),
      apiClient
        .get<ApiResponse<Notification[]>>('/notifications?limit=10')
        .then(({ data }) => setNotifications(data.data ?? []))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const latestPlan = plans[0] ?? null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Tổng quan</Title>
        <Text type="secondary">Xin chào, {user?.full_name ?? user?.email}!</Text>
      </div>

      {/* Stat cards */}
      <div style={{ marginBottom: 20 }}>
        <StatCards team={team} plan={latestPlan} chatCount={0} />
      </div>

      {/* Benefits banner */}
      <div style={{ marginBottom: 20 }}>
        <BenefitsSection compact />
      </div>

      {/* Notifications */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <RecentNotifications notifications={notifications} />
        </Col>
        <Col xs={24} lg={8}>
          <BenefitsSection compact={false} />
        </Col>
      </Row>
    </div>
  );
}
