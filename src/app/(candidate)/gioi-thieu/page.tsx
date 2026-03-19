'use client';

import { Card, Row, Col, Steps, Typography, Button, Divider, Space } from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  RocketOutlined,
  BulbOutlined,
  DollarOutlined,
  StarOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SendOutlined,
  CommentOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

const BENEFITS = [
  { icon: <TrophyOutlined />, title: 'Trải nghiệm thực chiến', desc: 'Xây dựng và trình bày kế hoạch kinh doanh thực tế trước hội đồng chuyên gia', color: '#4F46E5', bg: '#EEF2FF' },
  { icon: <TeamOutlined />, title: 'Phát triển kỹ năng nhóm', desc: 'Học cách làm việc nhóm hiệu quả, phân công nhiệm vụ và phối hợp ăn ý', color: '#059669', bg: '#ECFDF5' },
  { icon: <RocketOutlined />, title: 'Mentorship 1-1', desc: 'Được hướng dẫn trực tiếp bởi các doanh nhân và chuyên gia kinh doanh hàng đầu', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: <BulbOutlined />, title: 'Tư duy sáng tạo', desc: 'Phát triển tư duy phản biện, sáng tạo và khả năng giải quyết vấn đề phức tạp', color: '#D97706', bg: '#FFFBEB' },
  { icon: <DollarOutlined />, title: 'Phần thưởng hấp dẫn', desc: 'Cơ hội nhận học bổng, phần thưởng tiền mặt và cơ hội đầu tư cho ý tưởng tốt nhất', color: '#DC2626', bg: '#FEF2F2' },
  { icon: <StarOutlined />, title: 'Chứng nhận chuyên môn', desc: 'Nhận chứng chỉ hoàn thành chương trình được công nhận bởi cộng đồng doanh nhân', color: '#0891B2', bg: '#ECFEFF' },
];

const RESPONSIBILITIES = [
  'Tham gia đầy đủ các buổi học, workshop và phiên mentoring theo lịch chương trình',
  'Hoàn thành kế hoạch kinh doanh theo 14 phần hướng dẫn trong thời gian quy định',
  'Làm việc nhóm tích cực, đóng góp công bằng và hỗ trợ đồng đội',
  'Trình bày kế hoạch kinh doanh trước hội đồng giám khảo vào cuối chương trình',
  'Cam kết nghiêm túc và chuyên nghiệp trong suốt quá trình tham gia',
];

const STEPS = [
  { icon: <UserOutlined />, title: 'Đăng ký & Xét duyệt', desc: 'Điền đầy đủ hồ sơ, nộp CV và vượt qua vòng xét duyệt hồ sơ ban đầu' },
  { icon: <TeamOutlined />, title: 'Tạo đội nhóm', desc: 'Thành lập hoặc tham gia đội 3–5 người với mã mời' },
  { icon: <FileTextOutlined />, title: 'Xây dựng kế hoạch', desc: 'Nghiên cứu thị trường và viết kế hoạch kinh doanh 14 phần với hỗ trợ AI' },
  { icon: <CommentOutlined />, title: 'Mentoring & Điều chỉnh', desc: 'Nhận phản hồi từ mentor, cải thiện kế hoạch dựa trên góp ý chuyên gia' },
  { icon: <SendOutlined />, title: 'Nộp & Bảo vệ', desc: 'Nộp kế hoạch chính thức và trình bày trước hội đồng giám khảo' },
  { icon: <CrownOutlined />, title: 'Trao giải & Kết thúc', desc: 'Công bố kết quả, trao phần thưởng và nhận chứng nhận hoàn thành' },
];

export default function GioiThieuPage() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Hero */}
      <Card
        style={{ borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', marginBottom: 24 }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          Chương trình Talent Venture
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 8, marginBottom: 24 }}>
          Nơi ươm mầm những doanh nhân trẻ tài năng — xây dựng kế hoạch kinh doanh thực chiến, được dẫn dắt bởi chuyên gia và thi đua cùng những cá nhân xuất sắc nhất.
        </Paragraph>
        <Button
          type="default"
          size="large"
          style={{ background: '#fff', color: '#4F46E5', fontWeight: 600, border: 'none' }}
          onClick={() => router.push('/tong-quan')}
        >
          Bắt đầu ngay →
        </Button>
      </Card>

      {/* Benefits */}
      <Title level={4} style={{ marginBottom: 16 }}>Lợi ích khi tham gia</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {BENEFITS.map((b, i) => (
          <Col key={i} xs={24} sm={12} md={8}>
            <Card
              style={{ borderRadius: 12, border: '1px solid #F0F0F0', height: '100%' }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: b.color, flexShrink: 0 }}>
                  {b.icon}
                </div>
                <div>
                  <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>{b.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{b.desc}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Responsibilities */}
      <Card
        title={<Text strong>Trách nhiệm của học viên</Text>}
        style={{ borderRadius: 12, border: '1px solid #F0F0F0', marginBottom: 32 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {RESPONSIBILITIES.map((r, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13 }}>{r}</Text>
            </li>
          ))}
        </ul>
      </Card>

      {/* Process */}
      <Title level={4} style={{ marginBottom: 16 }}>Quy trình 6 bước</Title>
      <Card
        style={{ borderRadius: 12, border: '1px solid #F0F0F0', marginBottom: 32 }}
        styles={{ body: { padding: '24px 20px' } }}
      >
        <Steps
          direction="vertical"
          items={STEPS.map((s, i) => ({
            title: <Text strong style={{ fontSize: 14 }}>{s.title}</Text>,
            description: <Text type="secondary" style={{ fontSize: 12 }}>{s.desc}</Text>,
            icon: <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontSize: 14 }}>{s.icon}</div>,
          }))}
        />
      </Card>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Button
          type="primary"
          size="large"
          icon={<RocketOutlined />}
          onClick={() => router.push('/tong-quan')}
          style={{ height: 48, paddingInline: 32, borderRadius: 10, fontSize: 15 }}
        >
          Bắt đầu ngay
        </Button>
      </div>
    </div>
  );
}
