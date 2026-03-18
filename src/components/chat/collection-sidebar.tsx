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

/** Get category data - handle both nested and flat structures */
function getCatData(key: string, progress: Record<string, any>): any {
  // Try nested: progress.categories.KEY
  if (progress?.categories?.[key]) return progress.categories[key];
  // Try flat: progress.KEY
  if (progress?.[key]) return progress[key];
  return null;
}

function getStatus(key: string, progress: Record<string, any>): CategoryStatus {
  const val = getCatData(key, progress);
  if (!val) return 'not_started';

  // Explicit status field
  if (val.status === 'completed' || val.status === 'done') return 'completed';

  // Has collected fields = at least in_progress
  if (val.fields_collected?.length > 0) {
    // If overall is complete, mark as completed
    if (progress?.is_complete || progress?.overall_progress === 100) return 'completed';
    return 'in_progress';
  }

  if (val.status === 'in_progress') return 'in_progress';
  return 'not_started';
}

function overallPercent(progress: Record<string, any>): number {
  if (typeof progress?.overall_progress === 'number') return Math.round(progress.overall_progress);

  // Count both completed and in_progress as collected
  let collected = 0;
  for (const cat of CATEGORIES) {
    const s = getStatus(cat.key, progress);
    if (s === 'completed') collected += 1;
    else if (s === 'in_progress') collected += 0.7; // partially done
  }
  return Math.round((collected / CATEGORIES.length) * 100);
}

export default function CollectionSidebar({ progress, onCategoryClick }: Props) {
  const percent = overallPercent(progress);

  return (
    <div style={{ padding: '16px 12px' }}>
      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
        Thu thập thông tin
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Progress percent={percent} size="small" style={{ flex: 1, margin: 0 }} />
        <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{percent}%</Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {CATEGORIES.map((cat) => {
          const status = getStatus(cat.key, progress);
          const catData = getCatData(cat.key, progress);
          const icon =
            status === 'completed' ? (
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14 }} />
            ) : status === 'in_progress' ? (
              <LoadingOutlined style={{ color: '#4F46E5', fontSize: 14 }} />
            ) : (
              <ClockCircleOutlined style={{ color: '#CBD5E1', fontSize: 14 }} />
            );

          const statusLabel = status === 'completed' ? 'Đã thu thập' : status === 'in_progress' ? 'Đang thu thập' : 'Chưa thu thập';

          return (
            <Tooltip key={cat.key} title={statusLabel} placement="right">
              <div
                onClick={() => onCategoryClick?.(cat.key, catData)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 8,
                  cursor: onCategoryClick ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                  background: status === 'in_progress' ? '#EEF2FF' : 'transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = status === 'in_progress' ? '#EEF2FF' : 'transparent'; }}
              >
                {icon}
                <Text style={{ fontSize: 12, flex: 1, color: status === 'not_started' ? '#94A3B8' : '#1E293B' }}>
                  {cat.label}
                </Text>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
