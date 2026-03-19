'use client';

import { Card, Form, Input, Button, Typography, App, Divider } from 'antd';
import { LoginOutlined, KeyOutlined } from '@ant-design/icons';
import { useTeamStore } from '@/stores/team-store';

const { Title, Text } = Typography;

export default function JoinTeamForm() {
  const [form] = Form.useForm();
  const { joinTeam, isLoading } = useTeamStore();
  const { message } = App.useApp();

  const handleSubmit = async (values: { invite_code: string }) => {
    try {
      await joinTeam(values.invite_code.trim().toUpperCase());
      message.success('Tham gia doi nhom thanh cong!');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Ma moi khong hop le hoac doi da day');
    }
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        border: '1px solid #D1FAE5',
        height: '100%',
        boxShadow: '0 2px 8px rgba(5,150,105,0.07)',
      }}
      styles={{ body: { padding: '28px 28px 24px' } }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: '#059669',
            marginBottom: 14,
          }}
        >
          <KeyOutlined />
        </div>
        <Title level={5} style={{ margin: 0, color: '#111827' }}>
          Tham gia doi nhom
        </Title>
        <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: 'block', marginTop: 4 }}>
          Nhap ma moi duoc cung cap boi truong nhom de gia nhap doi.
        </Text>
      </div>

      <Divider style={{ margin: '0 0 20px', borderColor: '#D1FAE5' }} />

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          name="invite_code"
          label={
            <Text strong style={{ fontSize: 13 }}>
              Ma moi
            </Text>
          }
          rules={[
            { required: true, message: 'Vui long nhap ma moi' },
            { min: 6, message: 'Ma moi phai co it nhat 6 ky tu' },
          ]}
        >
          <Input
            placeholder="VD: ABC123"
            size="large"
            prefix={<KeyOutlined style={{ color: '#CBD5E1', marginRight: 4 }} />}
            style={{
              textTransform: 'uppercase',
              letterSpacing: 3,
              fontFamily: '"SF Mono", "Fira Code", monospace',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 16,
            }}
          />
        </Form.Item>

        <Button
          htmlType="submit"
          block
          size="large"
          loading={isLoading}
          icon={<LoginOutlined />}
          style={{
            borderRadius: 10,
            height: 44,
            fontWeight: 600,
            background: '#059669',
            borderColor: '#059669',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
          }}
        >
          Tham gia doi
        </Button>
      </Form>
    </Card>
  );
}
