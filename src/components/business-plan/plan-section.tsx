'use client';

import { Typography, Input, Button, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import type { BusinessPlan } from '@/types/talent-venture';
import type { PlanSection as PlanSectionType } from './plan-navigation';
import MilestonesEditor from './milestones-editor';
import type { Milestone } from '@/types/talent-venture';

const { Title, Text } = Typography;

interface PlanSectionProps {
  section: PlanSectionType;
  plan: BusinessPlan;
  onChange: (field: keyof BusinessPlan, value: any) => void;
  onAskAI?: () => void;
  disabled?: boolean;
}

export default function PlanSection({ section, plan, onChange, onAskAI, disabled }: PlanSectionProps) {
  const value = plan[section.key];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {section.label}
              {section.required && <Text type="danger" style={{ marginLeft: 4 }}>*</Text>}
            </Title>
            {section.hint && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {section.hint}
              </Text>
            )}
          </div>
          <Button
            icon={<RobotOutlined />}
            size="small"
            style={{ color: '#7C3AED', borderColor: '#DDD6FE', background: '#F5F3FF', flexShrink: 0 }}
            onClick={onAskAI}
          >
            Hỏi Kimi
          </Button>
        </Space>
      </div>

      {section.key === 'milestones' ? (
        <MilestonesEditor
          value={(value as Milestone[]) ?? []}
          onChange={v => onChange('milestones', v)}
          disabled={disabled}
        />
      ) : (
        <Input.TextArea
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(section.key, e.target.value)}
          placeholder={section.hint ?? `Nhập ${section.label.toLowerCase()}...`}
          rows={10}
          maxLength={5000}
          showCount
          disabled={disabled}
          style={{ borderRadius: 8, fontSize: 14, lineHeight: 1.7 }}
        />
      )}
    </div>
  );
}
