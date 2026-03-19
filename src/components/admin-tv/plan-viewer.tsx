'use client';

import { Descriptions, Typography, Divider, Tag } from 'antd';
import type { BusinessPlan } from '@/types/talent-venture';

const { Title, Paragraph, Text } = Typography;

interface PlanViewerProps {
  plan: BusinessPlan;
}

interface Section {
  key: keyof BusinessPlan;
  label: string;
}

const PARTS: { title: string; sections: Section[] }[] = [
  {
    title: 'Phần 1: Tổng quan',
    sections: [
      { key: 'executive_summary', label: 'Tóm tắt điều hành' },
      { key: 'problem_statement', label: 'Vấn đề cần giải quyết' },
      { key: 'solution', label: 'Giải pháp đề xuất' },
    ],
  },
  {
    title: 'Phần 2: Thị trường & Khách hàng',
    sections: [
      { key: 'target_market', label: 'Thị trường mục tiêu' },
      { key: 'customer_persona', label: 'Chân dung khách hàng' },
      { key: 'competitive_analysis', label: 'Phân tích cạnh tranh' },
    ],
  },
  {
    title: 'Phần 3: Marketing',
    sections: [
      { key: 'organic_marketing', label: 'Marketing Organic' },
      { key: 'paid_advertising', label: 'Quảng cáo trả phí' },
    ],
  },
  {
    title: 'Phần 4: Vận hành & Kỹ thuật',
    sections: [
      { key: 'operation_workflow', label: 'Quy trình vận hành' },
      { key: 'payment_system', label: 'Hệ thống thanh toán' },
      { key: 'tech_requirements', label: 'Yêu cầu kỹ thuật' },
    ],
  },
  {
    title: 'Phần 5: Tài chính',
    sections: [
      { key: 'cost_structure', label: 'Cơ cấu chi phí' },
      { key: 'revenue_model', label: 'Mô hình doanh thu' },
    ],
  },
];

export default function PlanViewer({ plan }: PlanViewerProps) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 4 }}>{plan.title}</Title>
        <Text type="secondary">
          Nộp lúc: {plan.submitted_at ? new Date(plan.submitted_at).toLocaleString('vi-VN') : '—'}
        </Text>
      </div>

      {PARTS.map((part) => (
        <div key={part.title}>
          <Divider orientationMargin={0}>
            <Text strong style={{ color: '#4F46E5' }}>{part.title}</Text>
          </Divider>
          {part.sections.map((sec) => {
            const val = plan[sec.key];
            return (
              <div key={sec.key} style={{ marginBottom: 16 }}>
                <Text strong>{sec.label}</Text>
                <Paragraph
                  style={{
                    background: '#f5f5f5',
                    borderRadius: 6,
                    padding: '8px 12px',
                    marginTop: 4,
                    whiteSpace: 'pre-wrap',
                    minHeight: 40,
                  }}
                >
                  {(val as string) ?? <Text type="secondary">Chưa điền</Text>}
                </Paragraph>
              </div>
            );
          })}
        </div>
      ))}

      {plan.milestones && plan.milestones.length > 0 && (
        <div>
          <Divider orientationMargin={0}>
            <Text strong style={{ color: '#4F46E5' }}>Cột mốc</Text>
          </Divider>
          <Descriptions column={1} size="small" bordered>
            {plan.milestones.map((m, i) => (
              <Descriptions.Item key={i} label={new Date(m.date).toLocaleDateString('vi-VN')}>
                <strong>{m.name}</strong>: {m.goal}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}
    </div>
  );
}
