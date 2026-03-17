'use client';

import { useState, Suspense } from 'react';
import { Form, Input, Button, Result, Typography, App } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/layout/auth-layout';
import apiClient from '@/lib/api-client';

const { Title } = Typography;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  async function onFinish(values: { new_password: string; confirm_password: string }) {
    if (!token) {
      message.error('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        new_password: values.new_password,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đặt lại mật khẩu thất bại.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Result
        status="success"
        title="Mật khẩu đã được đặt lại"
        subTitle="Bạn có thể đăng nhập với mật khẩu mới."
        extra={
          <Link href="/login">
            <Button type="primary">Đăng nhập ngay</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        Đặt lại mật khẩu
      </Title>

      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="new_password"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
          ]}
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label="Xác nhận mật khẩu mới"
          dependencies={['new_password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) return Promise.resolve();
                return Promise.reject(new Error('Mật khẩu không khớp'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Link href="/login">Quay lại đăng nhập</Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
