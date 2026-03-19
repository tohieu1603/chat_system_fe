'use client';

import { Typography, Button, Row, Col } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

const HERO_IMG = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80';
const TEAM_IMG = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80';
const WORK_IMG = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80';

const STEPS = [
  { num: '01', title: 'Đăng ký', desc: 'Tạo tài khoản, điền thông tin cá nhân, trường học và lĩnh vực quan tâm.', time: '5 phút' },
  { num: '02', title: 'Lập đội nhóm', desc: 'Tạo đội 2-3 thành viên hoặc tham gia đội bạn bè bằng mã mời.', time: '1 ngày' },
  { num: '03', title: 'Xây dựng kế hoạch', desc: 'Viết kế hoạch kinh doanh 14 phần — từ ý tưởng đến tài chính. AI Kimi hỗ trợ 24/7.', time: '2-4 tuần' },
  { num: '04', title: 'Nộp & đánh giá', desc: 'Gửi bản hoàn chỉnh cho hội đồng. Chấm theo 4 tiêu chí với trọng số rõ ràng.', time: '1 tuần' },
  { num: '05', title: 'Nhận kết quả', desc: 'Xem điểm chi tiết, nhận xét từ mentor và khuyến nghị cải thiện.', time: '3 ngày' },
  { num: '06', title: 'Triển khai dự án', desc: 'Kế hoạch được duyệt → chuyển thành dự án thật. AI tạo task, giao cho team.', time: 'Liên tục' },
];

const CRITERIA = [
  { name: 'Hệ thống Workflow', weight: 35, desc: 'Quy trình vận hành, tự động hóa, thanh toán' },
  { name: 'Mô hình kinh doanh', weight: 30, desc: 'Doanh thu, chi phí, khả năng mở rộng' },
  { name: 'Marketing Organic', weight: 25, desc: 'Chiến lược nội dung, SEO, cộng đồng' },
  { name: 'Quảng cáo trả phí', weight: 10, desc: 'Facebook Ads, Google Ads, TikTok Ads' },
];

const HIGHLIGHTS = [
  'Kế hoạch kinh doanh thực tế, không phải bài tập',
  'AI Kimi hỗ trợ phân tích thị trường và viết content',
  'Kế hoạch được duyệt → dự án thật với task management',
  'Đánh giá minh bạch: 4 tiêu chí, điểm chi tiết',
  'Làm việc nhóm, phát triển kỹ năng lãnh đạo',
  'Hoàn toàn miễn phí cho sinh viên',
];

const STATS = [
  { value: '14', label: 'phần kế hoạch' },
  { value: '4', label: 'tiêu chí đánh giá' },
  { value: '24/7', label: 'AI hỗ trợ' },
  { value: '100%', label: 'miễn phí' },
];

export default function GioiThieuPage() {
  const router = useRouter();

  return (
    <div style={{ marginLeft: -24, marginRight: -24, marginTop: -24 }}>
      {/* Hero Banner — cinematic */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <img
          src={HERO_IMG}
          alt="Talent Venture"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) saturate(1.2)' }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(94,106,210,0.4) 0%, rgba(30,30,60,0.6) 100%)' }} />
        {/* Animated glow orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(165,180,252,0.3) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,106,210,0.25) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite reverse' }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 56px' }}>
          <div style={{ maxWidth: 620 }}>
            {/* Glass badge */}
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>Talent Venture 2025</Text>
            </div>
            <Title style={{ color: '#fff', fontSize: 40, fontWeight: 700, lineHeight: 1.2, margin: '0 0 16px', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
              Biến ý tưởng thành{' '}
              <span style={{ background: 'linear-gradient(90deg, #a5b4fc, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>dự án kinh doanh thật</span>
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 520 }}>
              Chương trình ươm tạo doanh nhân trẻ — nơi sinh viên xây dựng kế hoạch kinh doanh,
              được hỗ trợ bởi AI và mentor, rồi triển khai thành dự án thực tế.
            </Paragraph>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button
                type="primary"
                size="large"
                onClick={() => router.push('/doi-nhom')}
                style={{ background: '#5e6ad2', borderColor: '#5e6ad2', borderRadius: 8, height: 48, fontWeight: 600, paddingInline: 32, fontSize: 15, boxShadow: '0 4px 20px rgba(94,106,210,0.4)' }}
              >
                Bắt đầu ngay <ArrowRightOutlined />
              </Button>
              <Button
                size="large"
                ghost
                onClick={() => {
                  document.getElementById('steps-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, height: 48, fontWeight: 500, paddingInline: 24 }}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>

      {/* Stats Bar — floating glass */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '24px', textAlign: 'center', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
            <div style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #5e6ad2, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Content sections */}
      <div style={{ padding: '0 48px' }}>

        {/* About + Image */}
        <Row gutter={[48, 32]} style={{ padding: '48px 0', borderBottom: '1px solid #e5e7eb' }} align="middle">
          <Col xs={24} md={14}>
            <Title level={3} style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 16 }}>
              Chương trình dành cho ai?
            </Title>
            <Paragraph style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 24 }}>
              Dành cho sinh viên và người trẻ có ý tưởng kinh doanh muốn thử nghiệm thực tế.
              Bạn không cần kinh nghiệm — chỉ cần sự nghiêm túc và ham học hỏi.
              AI Kimi sẽ đồng hành suốt quá trình, từ phân tích thị trường đến lập kế hoạch tài chính.
            </Paragraph>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircleFilled style={{ color: '#5e6ad2', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                  <Text style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>{h}</Text>
                </div>
              ))}
            </div>
          </Col>
          <Col xs={24} md={10}>
            <img
              src={TEAM_IMG}
              alt="Teamwork"
              style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
          </Col>
        </Row>

        {/* 6 Steps */}
        <div id="steps-section" style={{ padding: '48px 0', borderBottom: '1px solid #e5e7eb' }}>
          <Title level={3} style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Quy trình 6 bước</Title>
          <Text style={{ color: '#888', fontSize: 14, display: 'block', marginBottom: 32 }}>Từ đăng ký đến triển khai dự án thật</Text>

          <Row gutter={[20, 20]}>
            {STEPS.map((step) => (
              <Col xs={24} md={12} lg={8} key={step.num}>
                <div style={{ padding: 24, border: '1px solid #e5e7eb', borderRadius: 8, height: '100%', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #5e6ad2, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{step.num}</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>{step.title}</span>
                  </div>
                  <Text style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{step.desc}</Text>
                  <div style={{ marginTop: 14 }}>
                    <span style={{ fontSize: 11, color: '#888', background: '#f5f5f5', padding: '3px 10px', borderRadius: 3 }}>{step.time}</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Evaluation Criteria + Image */}
        <Row gutter={[48, 32]} style={{ padding: '48px 0', borderBottom: '1px solid #e5e7eb' }} align="middle">
          <Col xs={24} md={10}>
            <img
              src={WORK_IMG}
              alt="Working"
              style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
          </Col>
          <Col xs={24} md={14}>
            <Title level={3} style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Tiêu chí đánh giá</Title>
            <Text style={{ color: '#888', fontSize: 14, display: 'block', marginBottom: 24 }}>Kế hoạch được chấm điểm theo 4 tiêu chí với trọng số rõ ràng</Text>

            {CRITERIA.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: '#111', display: 'block' }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: '#888' }}>{c.desc}</Text>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#5e6ad2', width: 50, textAlign: 'right', flexShrink: 0 }}>{c.weight}%</div>
                <div style={{ width: 100, height: 6, background: '#f0f0f0', borderRadius: 3, flexShrink: 0 }}>
                  <div style={{ width: `${c.weight}%`, height: '100%', background: '#5e6ad2', borderRadius: 3, minWidth: 10 }} />
                </div>
              </div>
            ))}
          </Col>
        </Row>

        {/* Bottom CTA — gradient banner */}
        <div style={{ margin: '48px -48px 0', padding: '56px 48px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: -40, right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(165,180,252,0.2) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
          <Title level={3} style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            Sẵn sàng bắt đầu hành trình?
          </Title>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 28 }}>
            Tạo đội nhóm và xây dựng kế hoạch kinh doanh đầu tiên của bạn.
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/doi-nhom')}
            style={{ background: '#fff', borderColor: '#fff', color: '#5e6ad2', borderRadius: 8, height: 48, fontWeight: 700, paddingInline: 36, fontSize: 15, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
          >
            Tạo đội nhóm ngay <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
}
