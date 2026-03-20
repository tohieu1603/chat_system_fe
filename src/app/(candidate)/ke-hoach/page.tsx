'use client';

import { useEffect } from 'react';
import { Typography, Card, Button, Table, Space, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { usePlanStore } from '@/stores/plan-store';
import type { BusinessPlan } from '@/types/talent-venture';
import PlanStatusBadge from '@/components/business-plan/plan-status-badge';

const { Title, Text } = Typography;

export default function KeHoachPage() {
  const router = useRouter();
  const { plans, fetchMyPlans, isLoading } = usePlanStore();

  useEffect(() => {
    fetchMyPlans();
  }, []);

  const columns: ColumnsType<BusinessPlan> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => (
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          onClick={() => router.push(`/ke-hoach/${record.id}`)}
        >
          <Text strong style={{ color: '#4F46E5', fontSize: 13 }}>{title}</Text>
        </button>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: BusinessPlan['status']) => <PlanStatusBadge status={status} />,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 130,
      render: (d: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {d ? new Date(d).toLocaleDateString('vi-VN') : '—'}
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={record.status === 'DRAFT' ? <EditOutlined /> : <EyeOutlined />}
            size="small"
            onClick={() => router.push(`/ke-hoach/${record.id}`)}
          >
            {record.status === 'DRAFT' ? 'Chỉnh sửa' : 'Xem'}
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Kế hoạch kinh doanh</Title>
          <Text type="secondary">Xây dựng và quản lý kế hoạch kinh doanh của đội</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/ke-hoach/tao-moi')}
        >
          Tạo kế hoạch mới
        </Button>
      </div>

      <Card
        style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
        styles={{ body: { padding: plans.length ? 0 : 24 } }}
      >
        {plans.length === 0 ? (
          <Empty
            description="Chưa có kế hoạch nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/ke-hoach/tao-moi')}>
              Tạo kế hoạch đầu tiên
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={plans}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}
      </Card>

      {/* Tips section */}
      <div style={{ marginTop: 24 }}>
        <Text strong style={{ fontSize: 14, color: '#111', display: 'block', marginBottom: 12 }}>Hướng dẫn viết kế hoạch</Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { title: '14 phần cần điền', desc: 'Kế hoạch gồm 5 nhóm: Tổng quan, Thị trường, Marketing, Vận hành và Tài chính.' },
            { title: 'Auto-save mỗi 30 giây', desc: 'Hệ thống tự lưu nháp. Bạn có thể thoát và quay lại bất cứ lúc nào.' },
            { title: 'AI Kimi hỗ trợ', desc: 'Mỗi phần có nút "Hỏi Kimi" — AI giúp phân tích, gợi ý và viết nội dung.' },
            { title: 'Nộp khi hoàn thành', desc: 'Điền đủ 13 phần bắt buộc → bấm "Nộp kế hoạch". Sau khi nộp không thể chỉnh sửa.' },
          ].map((tip, i) => (
            <div key={i} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
              <Text strong style={{ fontSize: 13, color: '#111', display: 'block', marginBottom: 4 }}>{tip.title}</Text>
              <Text style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{tip.desc}</Text>
            </div>
          ))}
        </div>
      </div>

      {/* 4 evaluation criteria preview */}
      <div style={{ marginTop: 20, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <Text strong style={{ fontSize: 14, color: '#111', display: 'block', marginBottom: 12 }}>Tiêu chí đánh giá</Text>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { name: 'Workflow', weight: '35%' },
            { name: 'Kinh doanh', weight: '30%' },
            { name: 'Marketing Organic', weight: '25%' },
            { name: 'Quảng cáo', weight: '10%' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#5e6ad2' }}>{c.weight}</span>
              <span style={{ fontSize: 12, color: '#666' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
