'use client';

import { Card, Form, Input, Button, Typography, App } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useTeamStore } from '@/stores/team-store';

const { Title, Text } = Typography;

export default function CreateTeamForm() {
  const [form] = Form.useForm();
  const { createTeam, isLoading } = useTeamStore();
  const { message } = App.useApp();

  const handleSubmit = async (values: { name: string; description?: string }) => {
    try {
      await createTeam(values);
      message.success('Tạo đội nhóm thành công!');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Không thể tạo đội nhóm');
    }
  };

  return (
    <Card
      style={{ borderRadius: 12, border: '1px solid #E2E8F0', height: '100%' }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#4F46E5', margin: '0 auto 12px' }}>
          <TeamOutlined />
        </div>
        <Title level={5} style={{ margin: 0 }}>Tạo đội nhóm mới</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Bạn sẽ trở thành trưởng nhóm</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên đội"
          rules={[
            { required: true, message: 'Vui lòng nhập tên đội' },
            { min: 3, message: 'Tên đội phải có ít nhất 3 ký tự' },
            { max: 50, message: 'Tên đội tối đa 50 ký tự' },
          ]}
        >
          <Input placeholder="VD: Nhóm Khởi nghiệp A" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả (tùy chọn)">
          <Input.TextArea
            placeholder="Mô tả ngắn về đội nhóm của bạn..."
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
          Tạo đội nhóm
        </Button>
      </Form>
    </Card>
  );
}
