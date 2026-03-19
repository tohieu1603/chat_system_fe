'use client';

import { Card, Row, Col, Typography } from 'antd';
import { TeamOutlined, FileTextOutlined, RobotOutlined } from '@ant-design/icons';
import type { Team, BusinessPlan } from '@/types/talent-venture';

const { Text } = Typography;

interface StatCardsProps {
  team: Team | null;
  plan: BusinessPlan | null;
  chatCount: number;
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color: string;
  bg: string;
}) {
  return (
    <Card
      style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color,
          }}
        >
          {icon}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
            {label}
          </Text>
          <Text strong style={{ fontSize: 20 }}>
            {value}
          </Text>
          {subtext && (
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              {subtext}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function StatCards({ team, plan, chatCount }: StatCardsProps) {
  const memberCount = team?.members?.length ?? 0;
  const planStatus = plan
    ? plan.status === 'DRAFT'
      ? 'Bản nháp'
      : plan.status === 'SUBMITTED'
        ? 'Đã nộp'
        : plan.status === 'REVIEWING'
          ? 'Đang xét duyệt'
          : plan.status === 'APPROVED'
            ? 'Đã duyệt'
            : 'Bị từ chối'
    : 'Chưa có';

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <StatCard
          icon={<TeamOutlined />}
          label="Đội nhóm"
          value={team ? team.name : 'Chưa có'}
          subtext={team ? `${memberCount} thành viên` : 'Tạo hoặc tham gia đội'}
          color="#4F46E5"
          bg="#EEF2FF"
        />
      </Col>
      <Col xs={24} sm={8}>
        <StatCard
          icon={<FileTextOutlined />}
          label="Kế hoạch kinh doanh"
          value={plan ? plan.title : 'Chưa có'}
          subtext={`Trạng thái: ${planStatus}`}
          color="#059669"
          bg="#ECFDF5"
        />
      </Col>
      <Col xs={24} sm={8}>
        <StatCard
          icon={<RobotOutlined />}
          label="Trợ lý AI"
          value={`${chatCount} cuộc trò chuyện`}
          subtext="Kimi AI hỗ trợ 24/7"
          color="#D97706"
          bg="#FFFBEB"
        />
      </Col>
    </Row>
  );
}
