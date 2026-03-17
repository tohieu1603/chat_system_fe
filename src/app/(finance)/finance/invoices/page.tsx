'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Typography, Card, Select, App, Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
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

export default function FinanceInvoicesPage() {
  const { message } = App.useApp();
  const [invoices, setInvoices] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  function loadInvoices() {
    setLoading(true);
    apiClient.get('/finance/records').then((r) => {
      const d = r.data?.data ?? r.data;
      setInvoices(Array.isArray(d) ? d : []);
    }).catch(() => setInvoices([])).finally(() => setLoading(false));
  }

  useEffect(() => { loadInvoices(); }, []);

  const filtered = invoices.filter(inv =>
    (!typeFilter || inv.type === typeFilter) &&
    (!statusFilter || inv.status === statusFilter),
  );

  async function handleCreate(values: any) {
    try {
      await apiClient.post(`/projects/${values.project_id}/finance`, {
        type: values.type,
        amount: values.amount,
        description: values.description,
        due_date: values.due_date?.toISOString(),
      });
      message.success('Tạo thành công');
      setCreateOpen(false);
      form.resetFields();
      loadInvoices();
    } catch {
      message.error('Tạo thất bại');
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await apiClient.put(`/finance/${id}`, { status });
      message.success('Cập nhật thành công');
      loadInvoices();
    } catch {
      message.error('Cập nhật thất bại');
    }
  }

  const columns: ColumnsType<FinanceRecord> = [
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 110,
      render: (t: string) => <Tag color={TYPE_COLOR[t]}>{TYPE_LABEL[t] ?? t}</Tag>,
    },
    {
      title: 'Mô tả', dataIndex: 'description', key: 'description',
      render: (v: string) => v || '—',
    },
    {
      title: 'Số tiền', dataIndex: 'amount', key: 'amount', width: 160,
      render: (v: number) => fmt(v),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] ?? s}</Tag>,
    },
    {
      title: 'Hạn thanh toán', dataIndex: 'due_date', key: 'due_date', width: 130,
      render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
      sorter: (a, b) => new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime(),
    },
    {
      title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: '', key: 'actions', width: 140,
      render: (_, r) => (
        <Space size={4}>
          {r.status === 'PENDING' && <Button size="small" type="link" onClick={() => handleStatusChange(r.id, 'SENT')}>Gửi</Button>}
          {r.status === 'SENT' && <Button size="small" type="link" onClick={() => handleStatusChange(r.id, 'PAID')}>Đã thu</Button>}
          {r.file_url && <Button size="small" type="link" icon={<DownloadOutlined />} href={r.file_url} target="_blank" />}
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý hóa đơn</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>Tạo mới</Button>
      </div>

      <Card style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Space style={{ marginBottom: 16 }}>
          <Select allowClear placeholder="Loại" style={{ width: 140 }} onChange={setTypeFilter}>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
          </Select>
          <Select allowClear placeholder="Trạng thái" style={{ width: 160 }} onChange={setStatusFilter}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
          </Select>
        </Space>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 20 }}
          summary={() => {
            const total = filtered.reduce((s, r) => s + r.amount, 0);
            return total > 0 ? (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}><strong>Tổng cộng</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2}><strong>{fmt(total)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={3} colSpan={4} />
              </Table.Summary.Row>
            ) : null;
          }}
        />
      </Card>

      <Modal title="Tạo hóa đơn / báo giá" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={() => form.submit()} okText="Tạo">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select>{Object.entries(TYPE_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="project_id" label="Mã dự án" rules={[{ required: true }]}>
            <Input placeholder="Nhập project ID" />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền (VND)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="due_date" label="Hạn thanh toán">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
