'use client';

import { Button, Space } from 'antd';
import {
  BarChartOutlined,
  TeamOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  EditOutlined,
} from '@ant-design/icons';

const QUICK_PROMPTS = [
  {
    label: 'Phân tích thị trường',
    icon: <BarChartOutlined />,
    text: 'Hãy giúp tôi phân tích thị trường cho ý tưởng kinh doanh của mình. Tôi cần biết quy mô thị trường, xu hướng, và cơ hội.',
  },
  {
    label: 'Chân dung khách hàng',
    icon: <TeamOutlined />,
    text: 'Giúp tôi xây dựng chân dung khách hàng mục tiêu (customer persona) bao gồm nhân khẩu học, hành vi, nhu cầu và willingness to pay.',
  },
  {
    label: 'Marketing Organic',
    icon: <RocketOutlined />,
    text: 'Tư vấn cho tôi chiến lược marketing organic hiệu quả nhất cho startup: SEO, content marketing, personal branding và affiliate.',
  },
  {
    label: 'Quy trình tự động',
    icon: <ThunderboltOutlined />,
    text: 'Hãy đề xuất quy trình tự động hóa cho đơn hàng, thanh toán và CRM của doanh nghiệp nhỏ với ngân sách hạn chế.',
  },
  {
    label: 'Ý tưởng kinh doanh',
    icon: <BulbOutlined />,
    text: 'Tôi muốn khám phá ý tưởng kinh doanh mới. Hãy gợi ý các mô hình kinh doanh tiềm năng phù hợp với sinh viên hoặc người mới bắt đầu.',
  },
  {
    label: 'Viết content',
    icon: <EditOutlined />,
    text: 'Giúp tôi viết content marketing hiệu quả: mô tả sản phẩm, bài đăng social media và email marketing.',
  },
];

interface Props {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export default function QuickPrompts({ onSelect, disabled }: Props) {
  return (
    <div
      style={{
        padding: '8px 16px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        background: '#fafafa',
      }}
    >
      {QUICK_PROMPTS.map((p) => (
        <Button
          key={p.label}
          size="small"
          icon={p.icon}
          disabled={disabled}
          onClick={() => onSelect(p.text)}
          style={{
            borderRadius: 20,
            fontSize: 12,
            height: 28,
            border: '1px solid #e8e8e8',
            background: '#fff',
          }}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
