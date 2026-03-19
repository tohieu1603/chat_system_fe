'use client';

import { Radio } from 'antd';
import type { Evaluation } from '@/types/talent-venture';

interface RecommendationSelectProps {
  value: Evaluation['recommendation'];
  onChange: (val: Evaluation['recommendation']) => void;
  disabled?: boolean;
}

const OPTIONS = [
  { label: 'Phê duyệt', value: 'APPROVE' },
  { label: 'Từ chối', value: 'REJECT' },
  { label: 'Yêu cầu chỉnh sửa', value: 'REVISE' },
];

export default function RecommendationSelect({ value, onChange, disabled }: RecommendationSelectProps) {
  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {OPTIONS.map((o) => (
        <Radio.Button key={o.value} value={o.value}>
          {o.label}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
}
