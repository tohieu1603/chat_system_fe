'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, Typography, Card, message } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { FinanceRecord } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const TYPE_COLOR: Record<string, string> = { QUOTE: 'blue', INVOICE: 'purple', PAYMENT: 'green' };
const TYPE_LABEL: Record<string, string> = { QUOTE: 'Báo giá', INVOICE: 'Hóa đơn', PAYMENT: 'Thanh toán' };
const STATUS_COLOR: Record<string, string> = { PENDING: 'orange', SENT: 'blue', PAID: 'green', OVERDUE: 'red', CANCELLED: 'default' };
const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ xử lý', SENT: 'Đã gửi', PAID: 'Đã thanh toán', OVERDUE: 'Quá hạn', CANCELLED: 'Huỷ' };

export default function FinanceProjectDetailPage() {
  const router = useRouter();
  const { id: projectId } = useParams() as { id: string };
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    apiClient.get(`/projects/${projectId}/finance`).then((r) => {
      const d = r.data?.data ?? r.data;
      setRecords(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const handleAdd = async (vals: any) => {
    try {
      await apiClient.post(`/projects/${projectId}/finance`, vals);
      message.success('Thêm bản ghi thành công');
      setAddOpen(false);
      form.resetFields();
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  const columns: ColumnsType<FinanceRecord> = [
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 110,
      render: (t: string) => <Tag color={TYPE_COLOR[t]}>{TYPE_LABEL[t]}</Tag>,
    },
    {
      title: 'Số tiền', dataIndex: 'amount', key: 'amount', width: 180,
      render: (v: number) => fmt(v),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
    },
    {
      title: 'Hạn thanh toán', dataIndex: 'due_date', key: 'due_date', width: 140,
      render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: 'Ngày thanh toán', dataIndex: 'paid_at', key: 'paid_at', width: 140,
      render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
    },
    { title: 'Ghi chú', dataIndex: 'description', key: 'description', render: (v) => v ?? '—' },
  ];

  return (
    <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/finance/projects')} />
          <Title level={4} style={{ margin: 0 }}>Tài chính dự án</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)} style={{ marginLeft: 'auto' }}>Thêm bản ghi</Button>
        </div>

        <Card>
          <Table dataSource={records} columns={columns} rowKey="id" loading={loading} size="small" pagination={{ pageSize: 20 }} />
        </Card>

        <Modal title="Thêm bản ghi tài chính" open={addOpen} onCancel={() => setAddOpen(false)} onOk={() => form.submit()}>
          <Form form={form} layout="vertical" onFinish={handleAdd}>
            <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
              <Select>{Object.entries(TYPE_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="amount" label="Số tiền (VND)" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" initialValue="PENDING">
              <Select>{Object.entries(STATUS_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="description" label="Ghi chú"><Input /></Form.Item>
            <Form.Item name="due_date" label="Hạn thanh toán"><Input type="date" /></Form.Item>
          </Form>
        </Modal>
    </AppLayout>
  );
}
