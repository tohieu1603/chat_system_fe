'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { Batch } from '@/types/talent-venture';
import apiClient from '@/lib/api-client';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface BatchFormModalProps {
  open: boolean;
  editing?: Batch | null;
  onClose: () => void;
  onSaved: (batch: Batch) => void;
}

export default function BatchFormModal({ open, editing, onClose, onSaved }: BatchFormModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          name: editing.name,
          description: editing.description,
          max_teams: editing.max_teams,
          date_range: editing.application_start && editing.application_end
            ? [dayjs(editing.application_start), dayjs(editing.application_end)]
            : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: Partial<Batch> = {
        name: values.name,
        description: values.description,
        max_teams: values.max_teams,
        application_start: values.date_range?.[0]?.toISOString(),
        application_end: values.date_range?.[1]?.toISOString(),
      };
      const res = editing?.id
        ? await apiClient.patch(`/batches/${editing.id}`, payload)
        : await apiClient.post('/batches', payload);
      const saved = res.data?.data ?? res.data;
      message.success(editing ? 'Đã cập nhật đợt tuyển' : 'Đã tạo đợt tuyển');
      onSaved(saved);
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error(err?.response?.data?.message ?? 'Lưu thất bại');
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Chỉnh sửa đợt tuyển' : 'Tạo đợt tuyển mới'}
      onOk={handleOk}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Tên đợt tuyển" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
          <Input placeholder="VD: Đợt tuyển Q1 2026" />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Mô tả về đợt tuyển..." />
        </Form.Item>
        <Form.Item name="date_range" label="Thời gian đăng ký">
          <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="max_teams" label="Số đội tối đa">
          <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="VD: 20" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
