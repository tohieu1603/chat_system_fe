'use client';

import { Card, Form, Input, Button, Typography, App, Divider } from 'antd';
import { TeamOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTeamStore } from '@/stores/team-store';

const { Title, Text } = Typography;

export default function CreateTeamForm() {
  const [form] = Form.useForm();
  const { createTeam, isLoading } = useTeamStore();
  const { message } = App.useApp();

  const handleSubmit = async (values: { name: string; description?: string }) => {
    try {
      await createTeam(values);
      message.success('Tao doi nhom thanh cong!');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Khong the tao doi nhom');
    }
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        border: '1px solid #E0E7FF',
        height: '100%',
        boxShadow: '0 2px 8px rgba(79,70,229,0.07)',
      }}
      styles={{ body: { padding: '28px 28px 24px' } }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: '#EEF2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: '#4F46E5',
            marginBottom: 14,
          }}
        >
          <TeamOutlined />
        </div>
        <Title level={5} style={{ margin: 0, color: '#111827' }}>
          Tao doi nhom moi
        </Title>
        <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: 'block', marginTop: 4 }}>
          Ban se tro thanh truong nhom va co the moi toi 4 thanh vien khac.
        </Text>
      </div>

      <Divider style={{ margin: '0 0 20px', borderColor: '#EEF2FF' }} />

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label={
            <Text strong style={{ fontSize: 13 }}>
              Ten doi
            </Text>
          }
          rules={[
            { required: true, message: 'Vui long nhap ten doi' },
            { min: 3, message: 'Ten doi phai co it nhat 3 ky tu' },
            { max: 50, message: 'Ten doi toi da 50 ky tu' },
          ]}
        >
          <Input
            placeholder="VD: Nhom Khoi nghiep A"
            size="large"
            style={{ borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <Text strong style={{ fontSize: 13 }}>
              Mo ta (tuy chon)
            </Text>
          }
        >
          <Input.TextArea
            placeholder="Mo ta ngan ve doi nhom cua ban..."
            rows={3}
            maxLength={200}
            showCount
            style={{ borderRadius: 10 }}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={isLoading}
          icon={<PlusCircleOutlined />}
          style={{
            borderRadius: 10,
            height: 44,
            fontWeight: 600,
            background: '#4F46E5',
            borderColor: '#4F46E5',
            boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
          }}
        >
          Tao doi nhom
        </Button>
      </Form>
    </Card>
  );
}
