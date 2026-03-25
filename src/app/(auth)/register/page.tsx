'use client';

import { useState } from 'react';
import { Form, Input, Button, Steps, Select, Typography, Divider, App } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/auth-layout';
import { useAuthStore } from '@/stores/auth-store';

const { Title, Text } = Typography;

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: '/admin',
  DEV: '/dev',
  CANDIDATE: '/tong-quan',
};

const COMPANY_SIZES = ['1-10', '10-50', '50-100', '100-500', '500+'];

const INDUSTRIES = [
  'Công nghệ thông tin',
  'Thương mại điện tử',
  'Tài chính & Ngân hàng',
  'Y tế & Sức khỏe',
  'Giáo dục',
  'Bất động sản',
  'Sản xuất',
  'Bán lẻ',
  'Logistics & Vận tải',
  'Truyền thông & Quảng cáo',
  'Khác',
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Record<string, string>>({});

  async function handleStep1() {
    try {
      const values = await form.validateFields(['email', 'password', 'confirm_password', 'full_name', 'phone']);
      setStep1Data(values);
      setStep(1);
    } catch {
      // antd handles field errors
    }
  }

  async function handleSubmit() {
    try {
      const step2Values = await form.validateFields(['company_name', 'company_size', 'industry']);
      const { confirm_password, ...rest } = step1Data as any;
      await register({ ...rest, ...step2Values });
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.';
      message.error(msg);
    }
  }

  return (
    <AuthLayout>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        Tạo tài khoản
      </Title>

      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 24 }}
        items={[{ title: 'Thông tin cá nhân' }, { title: 'Thông tin doanh nghiệp' }]}
      />

      <Form form={form} layout="vertical" autoComplete="off">
        {step === 0 && (
          <>
            <Form.Item
              name="full_name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nguyễn Văn A" size="large" />
            </Form.Item>

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
              name="phone"
              label="Số điện thoại"
              rules={[{ pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }]}
            >
              <Input placeholder="0901234567" size="large" />
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

            <Form.Item
              name="confirm_password"
              label="Xác nhận mật khẩu"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Mật khẩu không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" block size="large" onClick={handleStep1}>
                Tiếp theo
              </Button>
            </Form.Item>
          </>
        )}

        {step === 1 && (
          <>
            <Form.Item name="company_name" label="Tên công ty">
              <Input placeholder="Công ty TNHH ABC" size="large" />
            </Form.Item>

            <Form.Item name="company_size" label="Quy mô công ty">
              <Select placeholder="Chọn quy mô" size="large">
                {COMPANY_SIZES.map((s) => (
                  <Select.Option key={s} value={s}>{s} nhân viên</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="industry" label="Lĩnh vực hoạt động">
              <Select placeholder="Chọn lĩnh vực" size="large">
                {INDUSTRIES.map((i) => (
                  <Select.Option key={i} value={i}>{i}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                block
                size="large"
                loading={isLoading}
                onClick={handleSubmit}
              >
                Đăng ký
              </Button>
            </Form.Item>

            <Button block onClick={() => setStep(0)}>
              Quay lại
            </Button>
          </>
        )}
      </Form>

      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">Đã có tài khoản? </Text>
        <Link href="/login">Đăng nhập</Link>
      </div>
    </AuthLayout>
  );
}
