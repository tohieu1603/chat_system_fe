'use client';


import { Typography, Card, Form, Input, Button, App } from 'antd';
import { FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/stores/plan-store';

const { Title, Text } = Typography;

export default function TaoMoiKeHoachPage() {
  const router = useRouter();
  const { createPlan, isLoading } = usePlanStore();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { title: string }) => {
    try {
      const plan = await createPlan(values.title);
      message.success('Tạo kế hoạch thành công!');
      router.push(`/ke-hoach/${plan.id}`);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Lỗi tạo kế hoạch');
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Quay lại
      </Button>

      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Tạo kế hoạch kinh doanh mới</Title>
        <Text type="secondary">Đặt tiêu đề và bắt đầu soạn thảo kế hoạch</Text>
      </div>

      <Card
        style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
        styles={{ body: { padding: 28 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#4F46E5', margin: '0 auto 12px' }}>
            <FileTextOutlined />
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề kế hoạch"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
              { max: 100, message: 'Tiêu đề tối đa 100 ký tự' },
            ]}
          >
            <Input
              placeholder="VD: Kế hoạch kinh doanh — Ứng dụng giao đồ ăn nhanh"
              size="large"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={isLoading} icon={<FileTextOutlined />}>
            Tạo và bắt đầu soạn thảo
          </Button>
        </Form>
      </Card>
    </div>
  );
}
