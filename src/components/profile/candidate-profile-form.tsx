'use client';

import { Form, Input, Button, DatePicker, Row, Col, App } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CandidateProfile } from '@/types/talent-venture';
import CvUpload from './cv-upload';

interface CandidateProfileFormProps {
  initialValues?: Partial<CandidateProfile>;
  onSaved?: () => void;
}

const label = (text: string) => <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{text}</span>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </h3>
      {children}
    </div>
  );
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
      message.success('Đã lưu hồ sơ!');
      onSaved?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Lỗi lưu hồ sơ');
    }
  };

  const defaults = initialValues
    ? { ...initialValues, date_of_birth: initialValues.date_of_birth ? dayjs(initialValues.date_of_birth) : undefined }
    : undefined;

  return (
    <Form form={form} layout="vertical" initialValues={defaults} onFinish={handleSubmit} requiredMark={false}>
      <Section title="Thông tin cá nhân">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="full_name" label={label('Họ và tên')} rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="phone" label={label('Số điện thoại')}>
              <Input placeholder="0912345678" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="date_of_birth" label={label('Ngày sinh')}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="address" label={label('Địa chỉ')}>
              <Input placeholder="TP.HCM" />
            </Form.Item>
          </Col>
        </Row>
      </Section>

      <Section title="Học vấn & Kinh nghiệm">
        <Form.Item name="education" label={label('Học vấn')}>
          <Input.TextArea placeholder="VD: ĐH Kinh tế TP.HCM, Quản trị kinh doanh, 2022-2026" rows={2} maxLength={500} showCount />
        </Form.Item>
        <Form.Item name="experience" label={label('Kinh nghiệm')}>
          <Input.TextArea placeholder="Mô tả kinh nghiệm làm việc, thực tập, dự án..." rows={3} maxLength={1000} showCount />
        </Form.Item>
      </Section>

      <Section title="Kỹ năng">
        <Form.Item name="skills" label={label('Kỹ năng chuyên môn & mềm')}>
          <Input.TextArea placeholder="VD: Marketing, Excel, Thiết kế, Lập trình, Quản lý..." rows={2} maxLength={500} showCount />
        </Form.Item>
      </Section>

      <Section title="Động lực">
        <Form.Item name="motivation" label={label('Tại sao bạn muốn tham gia?')} rules={[{ required: true, message: 'Vui lòng chia sẻ động lực' }]}>
          <Input.TextArea placeholder="Chia sẻ lý do và kỳ vọng của bạn với chương trình Talent Venture..." rows={4} maxLength={1000} showCount />
        </Form.Item>
      </Section>

      <Section title="CV">
        <Form.Item name="cv_url">
          <CvUpload />
        </Form.Item>
      </Section>

      <Form.Item style={{ marginBottom: 0, paddingTop: 4 }}>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          style={{
            height: 40,
            paddingInline: 28,
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 8,
          }}
        >
          Lưu hồ sơ
        </Button>
      </Form.Item>
    </Form>
  );
}
