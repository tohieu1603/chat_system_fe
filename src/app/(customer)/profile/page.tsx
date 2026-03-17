'use client';

import { useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, Space, App, Avatar, Tag, Divider, Row, Col, Descriptions } from 'antd';
import {
  EditOutlined, SaveOutlined, CloseOutlined, MailOutlined,
  PhoneOutlined, BankOutlined, TeamOutlined, TagOutlined, LockOutlined,
  CalendarOutlined, SafetyCertificateOutlined, KeyOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse, User } from '@/types';

const { Title, Text } = Typography;

const SIZES = ['1-10', '10-50', '50-100', '100-500', '500+'];
const INDUSTRIES = [
  'Công nghệ thông tin', 'Thương mại điện tử', 'Tài chính & Ngân hàng',
  'Y tế & Sức khỏe', 'Giáo dục', 'Bất động sản', 'Sản xuất',
  'Bán lẻ', 'Logistics & Vận tải', 'Xây dựng', 'Thực phẩm', 'Khác',
];

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  CUSTOMER: { label: 'Khách hàng', color: 'blue' },
  ADMIN: { label: 'Quản trị viên', color: 'red' },
  DEV: { label: 'Lập trình viên', color: 'purple' },
  FINANCE: { label: 'Tài chính', color: 'green' },
};

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [form] = Form.useForm();
  const [pwForm] = Form.useForm();
  const { message } = App.useApp();

  function startEdit() {
    form.setFieldsValue({
      full_name: user?.full_name, phone: user?.phone,
      company_name: user?.company_name, company_size: user?.company_size, industry: user?.industry,
    });
    setEditing(true);
  }

  async function onSave(values: Partial<User>) {
    setLoading(true);
    try {
      await apiClient.put<ApiResponse<User>>('/users/me', values);
      await fetchMe();
      setEditing(false);
      message.success('Đã cập nhật hồ sơ');
    } catch {
      message.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function onChangePw(values: { current_password: string; new_password: string }) {
    setLoading(true);
    try {
      await apiClient.put('/users/me/password', values);
      setChangingPw(false);
      pwForm.resetFields();
      message.success('Đã đổi mật khẩu');
    } catch {
      message.error('Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  }

  const initials = (user?.full_name ?? 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const role = ROLE_LABEL[user?.role ?? ''] ?? { label: user?.role, color: 'default' };
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const lastLogin = user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const cardStyle = { borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };

  return (
    <AppLayout>
      <Title level={4} style={{ margin: '0 0 20px' }}>Hồ sơ cá nhân</Title>

      <Row gutter={[16, 16]}>
        {/* ── Left: Profile Card ── */}
        <Col xs={24} lg={14}>
          <Card bodyStyle={{ padding: 0 }} style={cardStyle}>
            {/* Banner + Avatar */}
            <div style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 50%, #69b1ff 100%)',
              height: 100, borderRadius: '10px 10px 0 0', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', bottom: -32, left: 24,
                display: 'flex', alignItems: 'flex-end', gap: 16,
              }}>
                <Avatar
                  size={64}
                  style={{
                    background: '#fff', color: '#1677ff', fontSize: 22, fontWeight: 700,
                    border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                  src={user?.avatar_url}
                >
                  {!user?.avatar_url && initials}
                </Avatar>
              </div>
              {!editing && (
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', border: 'none' }}
                  onClick={startEdit}
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>

            {/* Name + Role */}
            <div style={{ padding: '44px 24px 0' }}>
              <Text strong style={{ fontSize: 20, display: 'block' }}>{user?.full_name}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 16 }}>
                <Tag color={role.color} style={{ borderRadius: 4, margin: 0 }}>{role.label}</Tag>
                {user?.company_name && <Text type="secondary" style={{ fontSize: 13 }}>{user.company_name}</Text>}
              </div>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Info or Edit Form */}
            {!editing ? (
              <div style={{ padding: '16px 24px 20px' }}>
                <Descriptions
                  column={{ xs: 1, sm: 2 }}
                  size="small"
                  labelStyle={{ color: '#8c8c8c', fontSize: 12, paddingBottom: 2 }}
                  contentStyle={{ fontSize: 14, paddingBottom: 16 }}
                >
                  <Descriptions.Item label={<><MailOutlined style={{ marginRight: 6 }} />Email</>}>
                    {user?.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 6 }} />Điện thoại</>}>
                    {user?.phone || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><BankOutlined style={{ marginRight: 6 }} />Công ty</>}>
                    {user?.company_name || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><TeamOutlined style={{ marginRight: 6 }} />Quy mô</>}>
                    {user?.company_size ? `${user.company_size} nhân viên` : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><TagOutlined style={{ marginRight: 6 }} />Lĩnh vực</>} span={2}>
                    {user?.industry || '—'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <div style={{ padding: '20px 24px' }}>
                <Form form={form} layout="vertical" onFinish={onSave} requiredMark={false}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
                        <Input placeholder="Nhập họ tên" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="phone" label="Số điện thoại">
                        <Input placeholder="Nhập SĐT" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="company_name" label="Tên công ty">
                        <Input placeholder="Tên công ty" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="company_size" label="Quy mô">
                        <Select placeholder="Chọn quy mô">
                          {SIZES.map(s => <Select.Option key={s} value={s}>{s} nhân viên</Select.Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="industry" label="Lĩnh vực">
                        <Select placeholder="Chọn lĩnh vực">
                          {INDUSTRIES.map(i => <Select.Option key={i} value={i}>{i}</Select.Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Lưu thay đổi</Button>
                    <Button onClick={() => setEditing(false)}>Hủy</Button>
                  </div>
                </Form>
              </div>
            )}
          </Card>
        </Col>

        {/* ── Right Column ── */}
        <Col xs={24} lg={10}>
          {/* Account Info */}
          <Card style={{ ...cardStyle, marginBottom: 16 }} bodyStyle={{ padding: '20px 24px' }}>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>
              <SafetyCertificateOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              Thông tin tài khoản
            </Text>
            {[
              { icon: <MailOutlined />, label: 'Email đăng nhập', value: user?.email },
              { icon: <CalendarOutlined />, label: 'Ngày tham gia', value: joinDate },
              { icon: <ClockCircleOutlined />, label: 'Đăng nhập gần nhất', value: lastLogin },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c', fontSize: 14, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.2 }}>{item.label}</Text>
                  <Text style={{ fontSize: 13 }}>{item.value || '—'}</Text>
                </div>
              </div>
            ))}
          </Card>

          {/* Security */}
          <Card style={cardStyle} bodyStyle={{ padding: '20px 24px' }}>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>
              <KeyOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
              Bảo mật
            </Text>

            {!changingPw ? (
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: '#fafafa', borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LockOutlined style={{ color: '#8c8c8c' }} />
                  <div>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>Mật khẩu</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>••••••••</Text>
                  </div>
                </div>
                <Button size="small" onClick={() => setChangingPw(true)}>Đổi mật khẩu</Button>
              </div>
            ) : (
              <Form form={pwForm} layout="vertical" onFinish={onChangePw} requiredMark={false} style={{ marginTop: 4 }}>
                <Form.Item name="current_password" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Bắt buộc' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>
                <Form.Item name="new_password" label="Mật khẩu mới" rules={[{ required: true, min: 8, message: 'Tối thiểu 8 ký tự' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 8 ký tự" />
                </Form.Item>
                <Form.Item name="confirm" label="Xác nhận mật khẩu" dependencies={['new_password']}
                  rules={[{ required: true, message: 'Bắt buộc' }, ({ getFieldValue }) => ({
                    validator(_, v) { return !v || getFieldValue('new_password') === v ? Promise.resolve() : Promise.reject('Không khớp'); }
                  })]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="primary" htmlType="submit" loading={loading}>Đổi mật khẩu</Button>
                  <Button onClick={() => { setChangingPw(false); pwForm.resetFields(); }}>Hủy</Button>
                </div>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
