'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, Space, Typography, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { User } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const ROLE_COLOR: Record<string, string> = { ADMIN: 'red', DEV: 'blue' };
const INTERNAL_ROLES = ['ADMIN', 'DEV'];

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    apiClient.get('/users').then((r) => {
      const d = r.data?.data ?? r.data;
      const all = Array.isArray(d) ? d : d?.users ?? [];
      setUsers(all.filter((u: User) => u.role !== 'CANDIDATE'));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (vals: any) => {
    try {
      await apiClient.post('/users', vals);
      message.success('Tạo người dùng thành công');
      setAddOpen(false);
      form.resetFields();
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await apiClient.patch(`/users/${user.id}`, { is_active: !user.is_active });
      message.success('Cập nhật thành công');
      load();
    } catch {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns: ColumnsType<User> = [
    { title: 'Họ tên', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò', dataIndex: 'role', key: 'role', width: 110,
      render: (r: string) => <Tag color={ROLE_COLOR[r] ?? 'default'}>{r}</Tag>,
    },
    {
      title: 'Hoạt động', dataIndex: 'is_active', key: 'is_active', width: 100,
      render: (v: boolean, record) => (
        <Switch checked={v} size="small" onChange={() => handleToggleActive(record)} />
      ),
    },
    {
      title: 'Thao tác', key: 'action', width: 80,
      render: (_, record) => (
        <Button size="small" danger={record.is_active} onClick={() => handleToggleActive(record)}>
          {record.is_active ? 'Khoá' : 'Mở khoá'}
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Quản lý team</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>Thêm người dùng</Button>
        </div>

        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} size="small" pagination={{ pageSize: 20 }} />

        <Modal title="Thêm người dùng" open={addOpen} onCancel={() => setAddOpen(false)} onOk={() => form.submit()}>
          <Form form={form} layout="vertical" onFinish={handleAdd}>
            <Form.Item name="full_name" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
              <Select>{INTERNAL_ROLES.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="phone" label="Điện thoại"><Input /></Form.Item>
          </Form>
        </Modal>
    </AppLayout>
  );
}
