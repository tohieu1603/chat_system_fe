'use client';

import { Slider, Typography } from 'antd';

const { Text } = Typography;

interface CriteriaSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

const marks = { 1: '1', 3: '3', 5: '5', 7: '7', 10: '10' };

export default function CriteriaSlider({ label, value, onChange, disabled }: CriteriaSliderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text strong>{label}</Text>
        <Text style={{ color: '#4F46E5', fontWeight: 600, fontSize: 16 }}>{value}</Text>
      </div>
      <Slider
        min={1}
        max={10}
        marks={marks}
        value={value}
        onChange={onChange}
        disabled={disabled}
        tooltip={{ formatter: (v) => `${v}/10` }}
      />
    </div>
  );
}
