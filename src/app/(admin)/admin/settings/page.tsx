'use client';

import { useState } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Typography, Divider, Row, Col, App, Space } from 'antd';
import { SaveOutlined, SettingOutlined, RobotOutlined, BellOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';

const { Title, Text } = Typography;

const cardStyle = { borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 16 };

export default function AdminSettingsPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function onSave() {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      // TODO: call apiClient.put('/settings', values) when backend ready
      console.log('Settings:', values);
      message.success('Đã lưu cài đặt');
    } catch {
      message.error('Lưu thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Cài đặt hệ thống</Title>
        <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSave}>Lưu thay đổi</Button>
      </div>

      <Form form={form} layout="vertical" initialValues={{
        ai_model: 'kimi-k2.5',
        max_tokens: 8000,
        temperature: 0.7,
        max_messages_per_minute: 20,
        auto_generate_doc: true,
        email_notifications: true,
        login_rate_limit: 5,
        api_rate_limit: 100,
      }}>
        <Row gutter={[16, 0]}>
          <Col xs={24} lg={12}>
            {/* AI Settings */}
            <Card
              title={<><RobotOutlined style={{ marginRight: 8, color: '#1677ff' }} />Cấu hình AI</>}
              style={cardStyle}
            >
              <Form.Item name="ai_model" label="Model AI">
                <Input disabled />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="max_tokens" label="Max tokens">
                    <InputNumber min={1000} max={32000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="temperature" label="Temperature">
                    <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="max_messages_per_minute" label="Giới hạn tin nhắn/phút">
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="auto_generate_doc" label="Tự động tạo tài liệu khi đủ thông tin" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            {/* Security */}
            <Card
              title={<><SafetyCertificateOutlined style={{ marginRight: 8, color: '#fa8c16' }} />Bảo mật</>}
              style={cardStyle}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="login_rate_limit" label="Giới hạn đăng nhập/phút">
                    <InputNumber min={1} max={20} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="api_rate_limit" label="Giới hạn API/phút">
                    <InputNumber min={10} max={500} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            {/* Notifications */}
            <Card
              title={<><BellOutlined style={{ marginRight: 8, color: '#52c41a' }} />Thông báo</>}
              style={cardStyle}
            >
              <Form.Item name="email_notifications" label="Gửi email khi có dự án mới" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="notify_on_collection_complete" label="Thông báo khi thu thập hoàn tất" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              <Form.Item name="notify_on_status_change" label="Thông báo khi đổi trạng thái dự án" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Card>

            {/* General */}
            <Card
              title={<><SettingOutlined style={{ marginRight: 8, color: '#722ed1' }} />Chung</>}
              style={cardStyle}
            >
              <Form.Item name="app_name" label="Tên hệ thống" initialValue="AI Req Collector">
                <Input />
              </Form.Item>
              <Form.Item name="support_email" label="Email hỗ trợ" initialValue="">
                <Input placeholder="support@company.com" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </AppLayout>
  );
}
