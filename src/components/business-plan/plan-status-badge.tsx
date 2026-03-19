'use client';

import { Tag } from 'antd';
import type { BusinessPlan } from '@/types/talent-venture';

const STATUS_CONFIG: Record<BusinessPlan['status'], { color: string; label: string }> = {
  DRAFT:      { color: 'default',    label: 'Bản nháp' },
  SUBMITTED:  { color: 'processing', label: 'Đã nộp' },
  REVIEWING:  { color: 'orange',     label: 'Đang xét duyệt' },
  APPROVED:   { color: 'success',    label: 'Đã duyệt' },
  REJECTED:   { color: 'error',      label: 'Bị từ chối' },
};

interface PlanStatusBadgeProps {
  status: BusinessPlan['status'];
}

export default function PlanStatusBadge({ status }: PlanStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? { color: 'default', label: status };
  return <Tag color={cfg.color} style={{ borderRadius: 4 }}>{cfg.label}</Tag>;
}
