'use client';

import { Form, Input, Button, DatePicker, Row, Col, Typography, App, Divider } from 'antd';
import {
  SaveOutlined,
  UserOutlined,
  BookOutlined,
  ToolOutlined,
  FireOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CandidateProfile } from '@/types/talent-venture';
import CvUpload from './cv-upload';

const { Title, Text } = Typography;

interface CandidateProfileFormProps {
  initialValues?: Partial<CandidateProfile>;
  onSaved?: () => void;
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  color: string;
  bg: string;
}

function SectionHeader({ icon, title, desc, color, bg }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <Text strong style={{ fontSize: 14, color: '#111827' }}>
          {title}
        </Text>
      </div>
      {desc && (
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 40, display: 'block' }}>
          {desc}
        </Text>
      )}
    </div>
  );
}

export default function CandidateProfileForm({
  initialValues,
  onSaved,
}: CandidateProfileFormProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      date_of_birth: values.date_of_birth
        ? values.date_of_birth.format('YYYY-MM-DD')
        : undefined,
    };
    try {
      await apiClient.patch<ApiResponse<CandidateProfile>>('/users/profile/candidate', payload);
      message.success('Da luu ho so thanh cong!');
      onSaved?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Loi luu ho so');
    }
  };

  const defaults = initialValues
    ? {
        ...initialValues,
        date_of_birth: initialValues.date_of_birth
          ? dayjs(initialValues.date_of_birth)
          : undefined,
      }
    : undefined;

  return (
    <Form form={form} layout="vertical" initialValues={defaults} onFinish={handleSubmit} requiredMark={false}>
      {/* Section 1: Personal info */}
      <SectionHeader
        icon={<UserOutlined />}
        title="Thong tin ca nhan"
        desc="Ho ten va thong tin lien he cua ban"
        color="#4F46E5"
        bg="#EEF2FF"
      />

      <Row gutter={[20, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="full_name"
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ho va ten</Text>}
            rules={[{ required: true, message: 'Vui long nhap ho ten' }]}
          >
            <Input
              placeholder="Nguyen Van A"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>So dien thoai</Text>}
          >
            <Input
              placeholder="0912345678"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[20, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="date_of_birth"
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ngay sinh</Text>}
          >
            <DatePicker
              style={{ width: '100%', borderRadius: 10 }}
              size="large"
              format="DD/MM/YYYY"
              placeholder="Chon ngay sinh"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="address"
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Dia chi</Text>}
          >
            <Input placeholder="TP.HCM" size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider style={{ margin: '8px 0 24px', borderColor: '#F1F5F9' }} />

      {/* Section 2: Education */}
      <SectionHeader
        icon={<BookOutlined />}
        title="Hoc van"
        desc="Truong, khoa va nien khoa cua ban"
        color="#059669"
        bg="#ECFDF5"
      />

      <Form.Item
        name="education"
        label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Hoc van</Text>}
      >
        <Input.TextArea
          placeholder="VD: Dai hoc Kinh te TP.HCM, Khoa Quan tri kinh doanh, 2022-2026"
          rows={2}
          maxLength={500}
          showCount
          style={{ borderRadius: 10 }}
        />
      </Form.Item>

      <Form.Item
        name="experience"
        label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Kinh nghiem</Text>}
      >
        <Input.TextArea
          placeholder="Mo ta cac kinh nghiem lam viec, thuc tap, du an da tham gia..."
          rows={3}
          maxLength={1000}
          showCount
          style={{ borderRadius: 10 }}
        />
      </Form.Item>

      <Divider style={{ margin: '8px 0 24px', borderColor: '#F1F5F9' }} />

      {/* Section 3: Skills */}
      <SectionHeader
        icon={<ToolOutlined />}
        title="Ky nang"
        desc="Liet ke cac ky nang chuyen mon va mem cua ban"
        color="#7C3AED"
        bg="#F5F3FF"
      />

      <Form.Item
        name="skills"
        label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Ky nang</Text>}
      >
        <Input.TextArea
          placeholder="VD: Marketing, Excel, Thiet ke, Lap trinh, Quan ly..."
          rows={2}
          maxLength={500}
          showCount
          style={{ borderRadius: 10 }}
        />
      </Form.Item>

      <Divider style={{ margin: '8px 0 24px', borderColor: '#F1F5F9' }} />

      {/* Section 4: Motivation */}
      <SectionHeader
        icon={<FireOutlined />}
        title="Dong luc tham gia"
        desc="Chia se ly do ban muon tham gia chuong trinh"
        color="#F59E0B"
        bg="#FFFBEB"
      />

      <Form.Item
        name="motivation"
        label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Dong luc tham gia chuong trinh</Text>}
        rules={[{ required: true, message: 'Vui long chia se dong luc cua ban' }]}
      >
        <Input.TextArea
          placeholder="Tai sao ban muon tham gia Talent Venture? Ban ky vong gi tu chuong trinh nay?"
          rows={4}
          maxLength={1000}
          showCount
          style={{ borderRadius: 10 }}
        />
      </Form.Item>

      <Divider style={{ margin: '8px 0 24px', borderColor: '#F1F5F9' }} />

      {/* Section 5: CV */}
      <SectionHeader
        icon={<FilePdfOutlined />}
        title="CV (PDF)"
        desc="Tai len CV moi nhat cua ban, toi da 10MB"
        color="#DC2626"
        bg="#FEF2F2"
      />

      <Form.Item name="cv_url">
        <CvUpload />
      </Form.Item>

      <Divider style={{ margin: '8px 0 24px', borderColor: '#F1F5F9' }} />

      {/* Submit */}
      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          size="large"
          style={{
            borderRadius: 12,
            height: 48,
            paddingInline: 36,
            fontWeight: 600,
            fontSize: 15,
            background: '#4F46E5',
            borderColor: '#4F46E5',
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}
        >
          Luu ho so
        </Button>
      </Form.Item>
    </Form>
  );
}
