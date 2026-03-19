'use client';

import { Card, Form, Input, Button, Typography, App } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useTeamStore } from '@/stores/team-store';

const { Title, Text } = Typography;

export default function JoinTeamForm() {
  const [form] = Form.useForm();
  const { joinTeam, isLoading } = useTeamStore();
  const { message } = App.useApp();

  const handleSubmit = async (values: { invite_code: string }) => {
    try {
      await joinTeam(values.invite_code.trim().toUpperCase());
      message.success('Tham gia đội nhóm thành công!');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Mã mời không hợp lệ hoặc đội đã đầy');
    }
  };

  return (
    <Card
      style={{ borderRadius: 12, border: '1px solid #E2E8F0', height: '100%' }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#059669', margin: '0 auto 12px' }}>
          <LoginOutlined />
        </div>
        <Title level={5} style={{ margin: 0 }}>Tham gia đội nhóm</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Nhập mã mời từ trưởng nhóm</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="invite_code"
          label="Mã mời"
          rules={[
            { required: true, message: 'Vui lòng nhập mã mời' },
            { min: 6, message: 'Mã mời phải có ít nhất 6 ký tự' },
          ]}
        >
          <Input
            placeholder="VD: ABC123"
            size="large"
            style={{ textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" loading={isLoading} style={{ background: '#059669', borderColor: '#059669' }}>
          Tham gia đội
        </Button>
      </Form>
    </Card>
  );
}
