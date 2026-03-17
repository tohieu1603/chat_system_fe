'use client';

import { useState } from 'react';
import { Form, Input, Button, Result, Typography, App } from 'antd';
import Link from 'next/link';
import AuthLayout from '@/components/layout/auth-layout';
import apiClient from '@/lib/api-client';

const { Title } = Typography;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  async function onFinish(values: { email: string }) {
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: values.email });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <Result
          status="success"
          title="Kiểm tra email của bạn"
          subTitle="Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư."
          extra={
            <Link href="/login">
              <Button type="primary">Quay lại đăng nhập</Button>
            </Link>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>
        Quên mật khẩu
      </Title>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
        Nhập email để nhận link đặt lại mật khẩu
      </p>

      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="you@example.com" size="large" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Gửi link đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Link href="/login">Quay lại đăng nhập</Link>
      </div>
    </AuthLayout>
  );
}
