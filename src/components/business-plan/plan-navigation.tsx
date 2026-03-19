'use client';

import { Menu, Typography, Progress } from 'antd';
import type { MenuProps } from 'antd';
import type { BusinessPlan } from '@/types/talent-venture';

const { Text } = Typography;

export interface PlanSection {
  key: keyof BusinessPlan;
  label: string;
  group: string;
  required?: boolean;
  hint?: string;
}

export const PLAN_SECTIONS: PlanSection[] = [
  // Part 1: Tổng quan
  { key: 'executive_summary',    label: 'Tóm tắt điều hành',       group: 'Phần 1: Tổng quan',         required: true,  hint: 'Mô tả ngắn gọn về kế hoạch kinh doanh của bạn (200-500 từ)' },
  // Part 2: Vấn đề & Giải pháp
  { key: 'problem_statement',    label: 'Vấn đề cần giải quyết',    group: 'Phần 2: Vấn đề & Giải pháp', required: true,  hint: 'Mô tả rõ ràng vấn đề mà sản phẩm/dịch vụ của bạn giải quyết' },
  { key: 'solution',             label: 'Giải pháp của bạn',         group: 'Phần 2: Vấn đề & Giải pháp', required: true,  hint: 'Giải pháp của bạn là gì và tại sao nó hiệu quả?' },
  // Part 3: Thị trường
  { key: 'target_market',        label: 'Thị trường mục tiêu',       group: 'Phần 3: Thị trường',          required: true,  hint: 'Quy mô thị trường, phân khúc khách hàng, tiềm năng tăng trưởng' },
  { key: 'customer_persona',     label: 'Chân dung khách hàng',      group: 'Phần 3: Thị trường',          required: false, hint: 'Mô tả chi tiết khách hàng lý tưởng: độ tuổi, thu nhập, hành vi' },
  { key: 'competitive_analysis', label: 'Phân tích cạnh tranh',      group: 'Phần 3: Thị trường',          required: false, hint: 'Đối thủ cạnh tranh là ai? Điểm khác biệt của bạn là gì?' },
  // Part 4: Marketing
  { key: 'organic_marketing',    label: 'Marketing tự nhiên',        group: 'Phần 4: Marketing',            required: false, hint: 'Kế hoạch content, SEO, mạng xã hội, cộng đồng...' },
  { key: 'paid_advertising',     label: 'Quảng cáo trả phí',         group: 'Phần 4: Marketing',            required: false, hint: 'Kênh quảng cáo, ngân sách, chiến lược targeting...' },
  // Part 5: Vận hành & Tài chính
  { key: 'operation_workflow',   label: 'Quy trình vận hành',        group: 'Phần 5: Vận hành & Tài chính', required: false, hint: 'Mô tả quy trình cung cấp sản phẩm/dịch vụ từ đầu đến cuối' },
  { key: 'payment_system',       label: 'Hệ thống thanh toán',       group: 'Phần 5: Vận hành & Tài chính', required: false, hint: 'Phương thức thanh toán, cổng thanh toán, xử lý hoàn tiền...' },
  { key: 'tech_requirements',    label: 'Yêu cầu công nghệ',         group: 'Phần 5: Vận hành & Tài chính', required: false, hint: 'Công nghệ cần thiết: phần mềm, phần cứng, nhân lực IT...' },
  { key: 'cost_structure',       label: 'Cơ cấu chi phí',            group: 'Phần 5: Vận hành & Tài chính', required: true,  hint: 'Chi phí cố định, chi phí biến đổi, chi phí khởi động...' },
  { key: 'revenue_model',        label: 'Mô hình doanh thu',         group: 'Phần 5: Vận hành & Tài chính', required: true,  hint: 'Cách bạn kiếm tiền: giá bán, dự báo doanh thu, dòng tiền...' },
  { key: 'milestones',           label: 'Cột mốc thực hiện',         group: 'Phần 5: Vận hành & Tài chính', required: false, hint: 'Các mốc quan trọng trong 6-12 tháng đầu' },
];

const GROUPS = [
  'Phần 1: Tổng quan',
  'Phần 2: Vấn đề & Giải pháp',
  'Phần 3: Thị trường',
  'Phần 4: Marketing',
  'Phần 5: Vận hành & Tài chính',
];

function isFieldFilled(plan: BusinessPlan, key: keyof BusinessPlan): boolean {
  const val = plan[key];
  if (val === undefined || val === null || val === '') return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

interface PlanNavigationProps {
  plan: BusinessPlan;
  activeSection: keyof BusinessPlan;
  onSelect: (section: keyof BusinessPlan) => void;
}

export default function PlanNavigation({ plan, activeSection, onSelect }: PlanNavigationProps) {
  const filled = PLAN_SECTIONS.filter(s => isFieldFilled(plan, s.key)).length;
  const pct = Math.round((filled / PLAN_SECTIONS.length) * 100);

  const menuItems: MenuProps['items'] = GROUPS.map(group => {
    const sections = PLAN_SECTIONS.filter(s => s.group === group);
    return {
      key: group,
      label: <Text style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>{group}</Text>,
      type: 'group',
      children: sections.map(s => ({
        key: s.key as string,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12 }}>{s.label}</Text>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isFieldFilled(plan, s.key) ? '#10B981' : '#D1D5DB', display: 'inline-block', flexShrink: 0 }} />
          </div>
        ),
      })),
    };
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
        <Text style={{ fontSize: 11, color: '#64748B', display: 'block', marginBottom: 6 }}>
          HOÀN THÀNH {pct}%
        </Text>
        <Progress percent={pct} size="small" showInfo={false} strokeColor="#4F46E5" />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeSection as string]}
          items={menuItems}
          onClick={({ key }) => onSelect(key as keyof BusinessPlan)}
          style={{ border: 'none', fontSize: 12 }}
        />
      </div>
    </div>
  );
}
