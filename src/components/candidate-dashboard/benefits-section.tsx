'use client';

import { Card, Typography } from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  RocketOutlined,
  BulbOutlined,
  DollarOutlined,
  StarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const BENEFITS = [
  { icon: <TrophyOutlined />, title: 'Trải nghiệm thực chiến', desc: 'Xây dựng kế hoạch kinh doanh thực tế', color: '#4F46E5', bg: '#EEF2FF' },
  { icon: <TeamOutlined />, title: 'Làm việc nhóm', desc: 'Học cách phối hợp hiệu quả trong nhóm', color: '#059669', bg: '#ECFDF5' },
  { icon: <RocketOutlined />, title: 'Cơ hội phát triển', desc: 'Được mentor bởi chuyên gia hàng đầu', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: <BulbOutlined />, title: 'Tư duy sáng tạo', desc: 'Phát triển tư duy kinh doanh đột phá', color: '#D97706', bg: '#FFFBEB' },
  { icon: <DollarOutlined />, title: 'Phần thưởng hấp dẫn', desc: 'Cơ hội nhận học bổng và phần thưởng', color: '#DC2626', bg: '#FEF2F2' },
  { icon: <StarOutlined />, title: 'Chứng nhận chuyên môn', desc: 'Nhận chứng chỉ hoàn thành chương trình', color: '#0891B2', bg: '#ECFEFF' },
];

interface BenefitsSectionProps {
  compact?: boolean;
}

export default function BenefitsSection({ compact = false }: BenefitsSectionProps) {
  if (compact) {
    return (
      <Card
        style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Text strong style={{ color: '#fff', fontSize: 14 }}>
          Chương trình Talent Venture — Phát triển thế hệ doanh nhân trẻ
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, display: 'block', marginTop: 4 }}>
          Trải nghiệm xây dựng kế hoạch kinh doanh thực tế, được mentor và nhận phần thưởng hấp dẫn
        </Text>
      </Card>
    );
  }

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>Lợi ích khi tham gia</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {BENEFITS.map((b, i) => (
          <Card
            key={i}
            style={{ borderRadius: 10, border: '1px solid #F0F0F0' }}
            styles={{ body: { padding: 16 } }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: b.color, flexShrink: 0 }}>
                {b.icon}
              </div>
              <div>
                <Text strong style={{ fontSize: 13, display: 'block' }}>{b.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{b.desc}</Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
