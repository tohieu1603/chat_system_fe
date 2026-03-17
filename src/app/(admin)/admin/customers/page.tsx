'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Input, Typography, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { User } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.get('/users?role=CUSTOMER').then((res) => {
      const d = res.data?.data ?? res.data;
      setCustomers(Array.isArray(d) ? d : d?.users ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<User> = [
    { title: 'Họ tên', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Công ty', dataIndex: 'company_name', key: 'company_name', render: (v) => v ?? '—' },
    {
      title: 'Trạng thái', dataIndex: 'is_active', key: 'is_active', width: 110,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Hoạt động' : 'Khoá'}</Tag>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', width: 130,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <AppLayout>
        <Title level={4}>Danh sách khách hàng</Title>
        <Card>
          <Input
            placeholder="Tìm theo tên hoặc email..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 16, maxWidth: 320 }}
          />
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            pagination={{ pageSize: 20 }}
          />
        </Card>
    </AppLayout>
  );
}
