'use client';

import { Statistic, Card } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

interface WeightedTotalDisplayProps {
  workflow: number;
  business: number;
  organic: number;
  ads: number;
}

export function calcWeightedTotal(w: number, b: number, o: number, a: number): number {
  return parseFloat((w * 0.35 + b * 0.30 + o * 0.25 + a * 0.10).toFixed(2));
}

export default function WeightedTotalDisplay({ workflow, business, organic, ads }: WeightedTotalDisplayProps) {
  const total = calcWeightedTotal(workflow, business, organic, ads);
  const color = total >= 7 ? '#52c41a' : total >= 5 ? '#faad14' : '#ff4d4f';

  return (
    <Card size="small" style={{ textAlign: 'center', background: '#f9f9ff', marginBottom: 16 }}>
      <Statistic
        title="Tổng điểm có trọng số"
        value={total}
        suffix="/ 10"
        precision={2}
        prefix={<TrophyOutlined />}
        valueStyle={{ color, fontSize: 28 }}
      />
    </Card>
  );
}
