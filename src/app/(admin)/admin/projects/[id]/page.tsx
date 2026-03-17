'use client';

import { useEffect, useState } from 'react';
import { Descriptions, Tag, Button, Card, Select, Space, Typography, Spin, Modal, Form, message } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, CheckSquareOutlined, MessageOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { Project, ProjectStatus, User } from '@/types';

const { Title } = Typography;

const STATUS_COLOR: Record<ProjectStatus, string> = {
  COLLECTING: 'blue', COLLECTED: 'cyan', REVIEWING: 'orange',
  APPROVED: 'green', IN_PROGRESS: 'purple', COMPLETED: 'green', ON_HOLD: 'red',
};
const STATUS_LABEL: Record<ProjectStatus, string> = {
  COLLECTING: 'Đang thu thập', COLLECTED: 'Đã thu thập', REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn thành', ON_HOLD: 'Tạm dừng',
};
const PRIORITY_COLOR: Record<string, string> = { LOW: 'default', MEDIUM: 'blue', HIGH: 'orange', URGENT: 'red' };
const ROLES = ['ADMIN', 'DEV', 'FINANCE'];

interface Member { user_id: string; role: string; user?: User; }

export default function AdminProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [newStatus, setNewStatus] = useState<ProjectStatus | undefined>();
  const [loading, setLoading] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    const [pRes, mRes] = await Promise.all([
      apiClient.get(`/projects/${id}`),
      apiClient.get(`/projects/${id}/members`).catch(() => ({ data: { data: [] } })),
    ]);
    setProject(pRes.data?.data ?? pRes.data);
    const md = mRes.data?.data ?? mRes.data;
    setMembers(Array.isArray(md) ? md : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    apiClient.get('/users?internal=true').then((r) => {
      const d = r.data?.data ?? r.data;
      setTeamUsers(Array.isArray(d) ? d : d?.users ?? []);
    });
  }, []);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    await apiClient.put(`/projects/${id}/status`, { status: newStatus });
    message.success('Cập nhật trạng thái thành công');
    load();
  };

  const handleAddMember = async (vals: { user_id: string; role: string }) => {
    await apiClient.post(`/projects/${id}/members`, vals);
    message.success('Thêm thành viên thành công');
    setAddMemberOpen(false);
    form.resetFields();
    load();
  };

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;
  if (!project) return <AppLayout><p>Không tìm thấy dự án.</p></AppLayout>;

  return (
    <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin/projects')} />
          <Title level={4} style={{ margin: 0 }}>{project.project_name}</Title>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Mã dự án">{project.project_code}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={STATUS_COLOR[project.status]}>{STATUS_LABEL[project.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="Ưu tiên"><Tag color={PRIORITY_COLOR[project.priority]}>{project.priority}</Tag></Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{project.customer?.full_name ?? '—'}</Descriptions.Item>
            {project.estimated_deadline && <Descriptions.Item label="Deadline">{new Date(project.estimated_deadline).toLocaleDateString('vi-VN')}</Descriptions.Item>}
            {project.description && <Descriptions.Item label="Mô tả" span={2}>{project.description}</Descriptions.Item>}
          </Descriptions>
        </Card>

        <Card title="Thay đổi trạng thái" style={{ marginBottom: 16 }}>
          <Space>
            <Select style={{ width: 200 }} placeholder="Chọn trạng thái mới" onChange={(v) => setNewStatus(v as ProjectStatus)}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
            </Select>
            <Button type="primary" onClick={handleStatusChange} disabled={!newStatus}>Cập nhật</Button>
          </Space>
        </Card>

        <Card title="Thành viên dự án" style={{ marginBottom: 16 }} extra={<Button size="small" onClick={() => setAddMemberOpen(true)}>+ Thêm</Button>}>
          {members.map((m) => (
            <Tag key={m.user_id} style={{ marginBottom: 4 }}>{m.user?.full_name ?? m.user_id} — {m.role}</Tag>
          ))}
        </Card>

        <Space>
          <Button icon={<MessageOutlined />} onClick={() => router.push(`/admin/projects/${id}/chat`)}>Xem chat</Button>
          <Button icon={<FileTextOutlined />} onClick={() => router.push(`/admin/projects/${id}/review`)}>Xem xét yêu cầu</Button>
          <Button icon={<CheckSquareOutlined />} onClick={() => router.push(`/admin/projects/${id}/tasks`)}>Tasks</Button>
        </Space>

        <Modal title="Thêm thành viên" open={addMemberOpen} onCancel={() => setAddMemberOpen(false)} onOk={() => form.submit()}>
          <Form form={form} layout="vertical" onFinish={handleAddMember}>
            <Form.Item name="user_id" label="Thành viên" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="children">
                {teamUsers.map((u) => <Select.Option key={u.id} value={u.id}>{u.full_name} ({u.role})</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
              <Select>{ROLES.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}</Select>
            </Form.Item>
          </Form>
        </Modal>
    </AppLayout>
  );
}
