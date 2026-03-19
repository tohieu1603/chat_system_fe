'use client';

import { Form, Input, Button, DatePicker, Select, Row, Col, Typography, App } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CandidateProfile } from '@/types/talent-venture';
import CvUpload from './cv-upload';

const { Title } = Typography;

interface CandidateProfileFormProps {
  initialValues?: Partial<CandidateProfile>;
  onSaved?: () => void;
}

export default function CandidateProfileForm({ initialValues, onSaved }: CandidateProfileFormProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
    };
    try {
      await apiClient.patch<ApiResponse<CandidateProfile>>('/users/profile/candidate', payload);
      message.success('Đã lưu hồ sơ thành công!');
      onSaved?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Lỗi lưu hồ sơ');
    }
  };

  const defaults = initialValues
    ? {
        ...initialValues,
        date_of_birth: initialValues.date_of_birth ? dayjs(initialValues.date_of_birth) : undefined,
      }
    : undefined;

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={defaults}
      onFinish={handleSubmit}
    >
      <Title level={5} style={{ marginBottom: 16 }}>Thông tin cá nhân</Title>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0912345678" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="date_of_birth" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="TP.HCM" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="education" label="Học vấn">
        <Input.TextArea
          placeholder="VD: Đại học Kinh tế TP.HCM, Khoa Quản trị kinh doanh, 2022–2026"
          rows={2}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item name="experience" label="Kinh nghiệm">
        <Input.TextArea
          placeholder="Mô tả các kinh nghiệm làm việc, thực tập, dự án đã tham gia..."
          rows={3}
          maxLength={1000}
          showCount
        />
      </Form.Item>

      <Form.Item name="skills" label="Kỹ năng">
        <Input.TextArea
          placeholder="VD: Marketing, Excel, Thiết kế, Lập trình, Quản lý..."
          rows={2}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="motivation"
        label="Động lực tham gia chương trình"
        rules={[{ required: true, message: 'Vui lòng chia sẻ động lực của bạn' }]}
      >
        <Input.TextArea
          placeholder="Tại sao bạn muốn tham gia Talent Venture? Bạn kỳ vọng gì từ chương trình này?"
          rows={4}
          maxLength={1000}
          showCount
        />
      </Form.Item>

      <Form.Item name="cv_url" label="CV (PDF)">
        <CvUpload />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
          Lưu hồ sơ
        </Button>
      </Form.Item>
    </Form>
  );
}
