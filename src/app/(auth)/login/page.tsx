'use client';

import { Form, Input, Button, Typography, Divider, App } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/auth-layout';
import { useAuthStore } from '@/stores/auth-store';

const { Title, Text } = Typography;

const ROLE_REDIRECT: Record<string, string> = {
  CUSTOMER: '/dashboard',
  ADMIN: '/admin',
  DEV: '/dev',
  FINANCE: '/finance',
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, user } = useAuthStore();
  const { message } = App.useApp();

  async function onFinish(values: { email: string; password: string }) {
    try {
      await login(values.email, values.password);
      const currentUser = useAuthStore.getState().user;
      const redirect = currentUser ? (ROLE_REDIRECT[currentUser.role] ?? '/dashboard') : '/dashboard';
      router.push(redirect);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.';
      message.error(msg);
    }
  }

  return (
    <AuthLayout>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        Đăng nhập
      </Title>

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

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
          ]}
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Link href="/forgot-password">
            <Text type="secondary" style={{ fontSize: 13 }}>
              Quên mật khẩu?
            </Text>
          </Link>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isLoading}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">Chưa có tài khoản? </Text>
        <Link href="/register">Đăng ký</Link>
      </div>
    </AuthLayout>
  );
}
