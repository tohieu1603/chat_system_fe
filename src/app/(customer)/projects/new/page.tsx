'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import { useProjectStore } from '@/stores/project-store';

const { Title } = Typography;
const { TextArea } = Input;

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, isLoading } = useProjectStore();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  async function handleSubmit(values: { project_name: string; description?: string }) {
    try {
      const project = await createProject(values);
      message.success('Tạo dự án thành công!');
      router.push(`/projects/${project.id}/chat`);
    } catch {
      message.error('Tạo dự án thất bại. Vui lòng thử lại.');
    }
  }

  return (
    <AppLayout>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Title level={4} style={{ marginBottom: 24 }}>Tạo dự án mới</Title>
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="project_name"
                label="Tên dự án"
                rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
              >
                <Input placeholder="Nhập tên dự án của bạn" size="large" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả (tùy chọn)">
                <TextArea
                  placeholder="Mô tả ngắn về dự án..."
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button onClick={() => router.back()}>Hủy</Button>
                  <Button type="primary" htmlType="submit" loading={isLoading}>
                    Tạo dự án & bắt đầu chat
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
    </AppLayout>
  );
}
