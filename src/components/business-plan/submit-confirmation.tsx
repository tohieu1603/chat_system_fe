'use client';

import { Modal, Typography, Alert, List } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import type { BusinessPlan } from '@/types/talent-venture';
import { PLAN_SECTIONS } from './plan-navigation';

const { Text, Paragraph } = Typography;

interface SubmitConfirmationProps {
  plan: BusinessPlan;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SubmitConfirmation({ plan, open, onConfirm, onCancel, isLoading }: SubmitConfirmationProps) {
  const requiredSections = PLAN_SECTIONS.filter(s => s.required);
  const missingRequired = requiredSections.filter(s => {
    const val = plan[s.key];
    if (val === undefined || val === null || val === '') return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  });

  const canSubmit = missingRequired.length === 0;

  return (
    <Modal
      title="Xác nhận nộp kế hoạch"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Nộp kế hoạch"
      cancelText="Hủy"
      okButtonProps={{ disabled: !canSubmit, loading: isLoading, type: 'primary' }}
      width={480}
    >
      {canSubmit ? (
        <>
          <Alert
            icon={<CheckCircleOutlined />}
            type="success"
            message="Kế hoạch đã đủ điều kiện nộp"
            description="Tất cả các phần bắt buộc đã được điền đầy đủ."
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Paragraph style={{ fontSize: 13 }}>
            Sau khi nộp, kế hoạch sẽ được khóa lại và gửi đến ban giám khảo xét duyệt.
            Bạn sẽ không thể chỉnh sửa nội dung sau khi nộp.
          </Paragraph>
        </>
      ) : (
        <>
          <Alert
            icon={<WarningOutlined />}
            type="warning"
            message={`Còn ${missingRequired.length} phần bắt buộc chưa điền`}
            showIcon
            style={{ marginBottom: 16 }}
          />
          <List
            size="small"
            dataSource={missingRequired}
            renderItem={s => (
              <List.Item>
                <Text type="danger" style={{ fontSize: 12 }}>• {s.label} ({s.group})</Text>
              </List.Item>
            )}
          />
        </>
      )}
    </Modal>
  );
}
