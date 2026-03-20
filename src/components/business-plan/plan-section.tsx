'use client';

import { Typography, Input, Button, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import type { BusinessPlan } from '@/types/talent-venture';
import type { PlanSection as PlanSectionType } from './plan-navigation';
import MilestonesEditor from './milestones-editor';
import type { Milestone } from '@/types/talent-venture';

const { Title, Text, Paragraph } = Typography;

interface PlanSectionProps {
  section: PlanSectionType;
  plan: BusinessPlan;
  onChange: (field: keyof BusinessPlan, value: any) => void;
  onAskAI?: () => void;
  disabled?: boolean;
}

export default function PlanSection({ section, plan, onChange, onAskAI, disabled }: PlanSectionProps) {
  const value = plan[section.key];

  // Read-only mode when plan is locked
  if (disabled) {
    return (
      <div>
        <Title level={5} style={{ margin: '0 0 8px' }}>{section.label}</Title>
        {section.key === 'milestones' ? (
          <div>
            {Array.isArray(value) && value.length > 0 ? (
              value.map((m: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < value.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#5e6ad2', width: 24, flexShrink: 0 }}>{i + 1}.</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{m.name ?? m.date}</span>
                    {m.goal && <span style={{ fontSize: 13, color: '#666' }}> — {m.goal}</span>}
                  </div>
                </div>
              ))
            ) : (
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa có cột mốc</Text>
            )}
          </div>
        ) : (
          <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 6, border: '1px solid #f0f0f0' }}>
            {typeof value === 'string' && value.trim() ? (
              <Paragraph style={{ fontSize: 14, color: '#333', margin: 0, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{value}</Paragraph>
            ) : (
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa điền</Text>
            )}
          </div>
        )}
      </div>
    );
  }

  // Editable mode
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
              <Text type="secondary" style={{ fontSize: 12 }}>{section.hint}</Text>
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
          style={{ borderRadius: 8, fontSize: 14, lineHeight: 1.7 }}
        />
      )}
    </div>
  );
}
