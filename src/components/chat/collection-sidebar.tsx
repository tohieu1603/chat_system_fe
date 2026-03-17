'use client';

import { Progress, Typography, Tooltip } from 'antd';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const CATEGORIES = [
  { key: 'COMPANY_INFO', label: 'Thông tin công ty' },
  { key: 'DEPARTMENTS', label: 'Phòng ban' },
  { key: 'EMPLOYEES', label: 'Nhân sự' },
  { key: 'WORKFLOWS', label: 'Quy trình làm việc' },
  { key: 'SALARY', label: 'Lương & phúc lợi' },
  { key: 'SCHEDULING', label: 'Lịch làm việc' },
  { key: 'FEATURES', label: 'Tính năng yêu cầu' },
  { key: 'SPECIAL_REQUIREMENTS', label: 'Yêu cầu đặc biệt' },
  { key: 'PRIORITIES', label: 'Ưu tiên' },
];

type CategoryStatus = 'completed' | 'in_progress' | 'not_started';

interface Props {
  progress: Record<string, any>;
  onCategoryClick?: (key: string, data: any) => void;
}

function getStatus(key: string, progress: Record<string, any>): CategoryStatus {
  const categories = progress?.categories ?? progress ?? {};
  const val = categories[key];
  const isComplete = progress?.is_complete || progress?.overall_progress === 100;
  if (!val) return 'not_started';
  if (val.status === 'completed' || val.completed) return 'completed';
  // If overall collection is complete, mark categories with data as completed
  if (isComplete && val.fields_collected?.length > 0) return 'completed';
  if (val.status === 'in_progress' || val.fields_collected?.length > 0) return 'in_progress';
  return 'not_started';
}

function overallPercent(progress: Record<string, any>): number {
  if (progress.overall_progress !== undefined) return Math.round(progress.overall_progress);
  const completed = CATEGORIES.filter((c) => getStatus(c.key, progress) === 'completed').length;
  return Math.round((completed / CATEGORIES.length) * 100);
}

export default function CollectionSidebar({ progress, onCategoryClick }: Props) {
  const percent = overallPercent(progress);

  return (
    <div style={{ padding: '16px 12px' }}>
      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
        Thu thập thông tin
      </Text>
      <Progress percent={percent} size="small" style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {CATEGORIES.map((cat) => {
          const status = getStatus(cat.key, progress);
          const icon =
            status === 'completed' ? (
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: 15 }} />
            ) : status === 'in_progress' ? (
              <LoadingOutlined style={{ color: '#1890ff', fontSize: 15 }} />
            ) : (
              <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: 15 }} />
            );

          return (
            <Tooltip key={cat.key} title={status === 'not_started' ? 'Chưa thu thập' : status === 'in_progress' ? 'Đang thu thập' : 'Hoàn thành'} placement="right">
              <div
                onClick={() => onCategoryClick?.(cat.key, (progress?.categories ?? progress)?.[cat.key])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 8px',
                  borderRadius: 6,
                  cursor: onCategoryClick ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {icon}
                <Text style={{ fontSize: 12, flex: 1 }}>{cat.label}</Text>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
