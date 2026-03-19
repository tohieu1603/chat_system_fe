'use client';

import { Button, Input, DatePicker, Typography, Card, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Milestone } from '@/types/talent-venture';

const { Text } = Typography;

interface MilestonesEditorProps {
  value: Milestone[];
  onChange: (milestones: Milestone[]) => void;
  disabled?: boolean;
}

export default function MilestonesEditor({ value, onChange, disabled }: MilestonesEditorProps) {
  const milestones = value ?? [];

  const add = () => {
    onChange([...milestones, { name: '', date: '', goal: '' }]);
  };

  const remove = (idx: number) => {
    onChange(milestones.filter((_, i) => i !== idx));
  };

  const update = (idx: number, field: keyof Milestone, val: string) => {
    const updated = milestones.map((m, i) => (i === idx ? { ...m, [field]: val } : m));
    onChange(updated);
  };

  return (
    <div>
      {milestones.map((m, idx) => (
        <Card
          key={idx}
          size="small"
          style={{ marginBottom: 8, borderRadius: 8 }}
          styles={{ body: { padding: 12 } }}
          extra={
            !disabled && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => remove(idx)}
              />
            )
          }
          title={<Text style={{ fontSize: 12, color: '#64748B' }}>Cột mốc {idx + 1}</Text>}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <div>
              <Text style={{ fontSize: 11, color: '#64748B' }}>Tên cột mốc</Text>
              <Input
                value={m.name}
                onChange={e => update(idx, 'name', e.target.value)}
                placeholder="VD: Ra mắt sản phẩm beta"
                size="small"
                disabled={disabled}
              />
            </div>
            <div>
              <Text style={{ fontSize: 11, color: '#64748B' }}>Ngày dự kiến</Text>
              <DatePicker
                value={m.date ? dayjs(m.date) : null}
                onChange={d => update(idx, 'date', d ? d.format('YYYY-MM-DD') : '')}
                style={{ width: '100%' }}
                size="small"
                format="DD/MM/YYYY"
                disabled={disabled}
              />
            </div>
            <div>
              <Text style={{ fontSize: 11, color: '#64748B' }}>Mục tiêu cụ thể</Text>
              <Input.TextArea
                value={m.goal}
                onChange={e => update(idx, 'goal', e.target.value)}
                placeholder="Mô tả mục tiêu cần đạt được..."
                rows={2}
                size="small"
                disabled={disabled}
              />
            </div>
          </Space>
        </Card>
      ))}

      {!disabled && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={add}
          block
          style={{ borderRadius: 8 }}
        >
          Thêm cột mốc
        </Button>
      )}

      {milestones.length === 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Chưa có cột mốc nào. Thêm các mốc quan trọng trong kế hoạch của bạn.
        </Text>
      )}
    </div>
  );
}
