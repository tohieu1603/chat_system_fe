'use client';

import { useState } from 'react';
import { Button, Popconfirm, message } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import apiClient from '@/lib/api-client';

interface ConvertToProjectBtnProps {
  planId: string;
  onConverted?: (project: any) => void;
}

export default function ConvertToProjectBtn({ planId, onConverted }: ConvertToProjectBtnProps) {
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      // Duyệt plan trước nếu chưa APPROVED
      await apiClient.patch(`/business-plans/${planId}/status`, { status: 'APPROVED' }).catch(() => {});
      // Chuyển thành dự án
      const res = await apiClient.post(`/business-plans/${planId}/convert`);
      const project = res.data?.data ?? res.data;
      message.success(`Đã tạo dự án ${project?.project_code ?? ''} thành công!`);
      onConverted?.(project);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Chuyển đổi thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popconfirm
      title="Chuyển kế hoạch này thành Dự án?"
      description="Hành động này sẽ tạo một dự án mới từ kế hoạch kinh doanh đã phê duyệt."
      onConfirm={handleConvert}
      okText="Chuyển đổi"
      cancelText="Huỷ"
    >
      <Button
        type="primary"
        icon={<SwapOutlined />}
        loading={loading}
        style={{ background: '#52c41a', borderColor: '#52c41a' }}
      >
        Chuyển thành Dự án
      </Button>
    </Popconfirm>
  );
}
