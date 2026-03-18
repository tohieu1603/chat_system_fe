'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, Drawer, Tag, Typography, message, Spin } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { TaskItem, User } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const COLUMNS: { key: TaskItem['status']; label: string; color: string }[] = [
  { key: 'TODO', label: 'Cần làm', color: '#f0f0f0' },
  { key: 'IN_PROGRESS', label: 'Đang làm', color: '#e6f7ff' },
  { key: 'IN_REVIEW', label: 'Đang review', color: '#fff7e6' },
  { key: 'DONE', label: 'Hoàn thành', color: '#f6ffed' },
];

const PRIORITY_COLOR: Record<string, string> = { LOW: 'default', MEDIUM: 'blue', HIGH: 'orange', URGENT: 'red' };

export default function AdminTasksPage() {
  const router = useRouter();
  const { id: projectId } = useParams() as { id: string };
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    const [tRes, mRes, uRes] = await Promise.all([
      apiClient.get(`/projects/${projectId}/tasks`),
      apiClient.get(`/projects/${projectId}/members`).catch(() => ({ data: { data: [] } })),
      apiClient.get('/users?role=DEV').catch(() => ({ data: { data: [] } })),
    ]);
    const td = tRes.data?.data ?? tRes.data;
    setTasks(Array.isArray(td) ? td : []);
    // Merge project members + all DEV users
    const md = mRes.data?.data ?? mRes.data;
    const memberUsers = (Array.isArray(md) ? md.map((m: any) => m.user).filter(Boolean) : []) as User[];
    const allUsers = uRes.data?.data ?? uRes.data;
    const devUsers = (Array.isArray(allUsers) ? allUsers : allUsers?.users ?? []) as User[];
    // Deduplicate by id
    const seen = new Set<string>();
    const merged: User[] = [];
    [...memberUsers, ...devUsers].forEach(u => { if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); } });
    setMembers(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, [projectId]);

  const handleAdd = async (vals: any) => {
    await apiClient.post(`/projects/${projectId}/tasks`, vals);
    message.success('Tạo task thành công');
    setAddOpen(false);
    form.resetFields();
    load();
  };

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/admin/projects/${projectId}`)} />
          <Title level={4} style={{ margin: 0 }}>Kanban Tasks</Title>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button
              icon={<ThunderboltOutlined />}
              loading={generating}
              onClick={async () => {
                setGenerating(true);
                try {
                  const res = await apiClient.post(`/projects/${projectId}/tasks/generate`);
                  const count = res.data?.data?.length ?? 0;
                  message.success(`AI đã tạo ${count} tasks và giao cho dev`);
                  load();
                } catch (e: any) {
                  message.error(e.response?.data?.message ?? 'Lỗi tạo tasks');
                } finally {
                  setGenerating(false);
                }
              }}
            >
              AI tạo tasks
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>Thêm task</Button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
          {COLUMNS.map((col) => (
            <div key={col.key} style={{ flex: '0 0 260px', background: col.color, borderRadius: 8, padding: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>{col.label} ({tasks.filter((t) => t.status === col.key).length})</Text>
              {tasks.filter((t) => t.status === col.key).map((task) => (
                <Card
                  key={task.id}
                  size="small"
                  style={{ marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => setSelectedTask(task)}
                >
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{task.title}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Tag color={PRIORITY_COLOR[task.priority]} style={{ margin: 0 }}>{task.priority}</Tag>
                    {task.assignee && <Tag style={{ margin: 0 }}>{task.assignee.full_name}</Tag>}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>

        <Modal title="Thêm task mới" open={addOpen} onCancel={() => setAddOpen(false)} onOk={() => form.submit()}>
          <Form form={form} layout="vertical" onFinish={handleAdd}>
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="Mô tả"><TextArea rows={3} /></Form.Item>
            <Form.Item name="priority" label="Ưu tiên" initialValue="MEDIUM">
              <Select><Select.Option value="LOW">Thấp</Select.Option><Select.Option value="MEDIUM">Trung bình</Select.Option><Select.Option value="HIGH">Cao</Select.Option><Select.Option value="URGENT">Khẩn cấp</Select.Option></Select>
            </Form.Item>
            <Form.Item name="assignee_id" label="Giao cho">
              <Select allowClear showSearch optionFilterProp="children">
                {members.map((u) => <Select.Option key={u.id} value={u.id}>{u.full_name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="estimated_hours" label="Giờ ước tính"><Input type="number" /></Form.Item>
            <Form.Item name="due_date" label="Hạn chót"><Input type="date" /></Form.Item>
          </Form>
        </Modal>

        <Drawer
          title={selectedTask?.title}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          width={420}
        >
          {selectedTask && (
            <div>
              <p><Text strong>Mô tả:</Text> {selectedTask.description ?? '—'}</p>
              <p><Text strong>Trạng thái:</Text> {selectedTask.status}</p>
              <p><Text strong>Ưu tiên:</Text> <Tag color={PRIORITY_COLOR[selectedTask.priority]}>{selectedTask.priority}</Tag></p>
              <p><Text strong>Giao cho:</Text> {selectedTask.assignee?.full_name ?? '—'}</p>
              <p><Text strong>Giờ ước tính:</Text> {selectedTask.estimated_hours ?? '—'}</p>
              <p><Text strong>Giờ thực tế:</Text> {selectedTask.actual_hours ?? '—'}</p>
              {selectedTask.due_date && <p><Text strong>Hạn chót:</Text> {new Date(selectedTask.due_date).toLocaleDateString('vi-VN')}</p>}
            </div>
          )}
        </Drawer>
    </AppLayout>
  );
}
