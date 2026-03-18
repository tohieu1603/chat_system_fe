'use client';

import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Tag, Button, Typography, Progress,
  Timeline, Spin, App, Modal, Descriptions, Space, Steps, List, Avatar, Statistic,
} from 'antd';
import {
  ArrowLeftOutlined, MessageOutlined, FileTextOutlined,
  ReloadOutlined, CheckCircleOutlined, SyncOutlined, ClockCircleOutlined,
  RocketOutlined, TeamOutlined, CalendarOutlined, FundOutlined,
  CheckCircleFilled, ExclamationCircleFilled, StopOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import { useProjectStore } from '@/stores/project-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse, ProjectStatus, TaskItem } from '@/types';

const { Title, Text, Paragraph } = Typography;

const STATUS_CONFIG: Record<ProjectStatus, { color: string; text: string; step: number }> = {
  COLLECTING: { color: 'processing', text: 'Đang thu thập', step: 0 },
  COLLECTED: { color: 'cyan', text: 'Đã thu thập', step: 1 },
  REVIEWING: { color: 'warning', text: 'Đang review', step: 2 },
  APPROVED: { color: 'success', text: 'Đã duyệt', step: 3 },
  IN_PROGRESS: { color: 'purple', text: 'Đang triển khai', step: 3 },
  COMPLETED: { color: 'success', text: 'Hoàn thành', step: 4 },
  ON_HOLD: { color: 'error', text: 'Tạm dừng', step: -1 },
};

const PRIORITY_CONFIG: Record<string, { color: string; text: string }> = {
  LOW: { color: 'default', text: 'Thấp' }, MEDIUM: { color: 'blue', text: 'Trung bình' },
  HIGH: { color: 'orange', text: 'Cao' }, URGENT: { color: 'red', text: 'Khẩn cấp' },
};

const CATEGORY_LABELS: Record<string, string> = {
  COMPANY_INFO: 'Thông tin công ty', DEPARTMENTS: 'Phòng ban', EMPLOYEES: 'Nhân sự',
  WORKFLOWS: 'Quy trình làm việc', SALARY: 'Lương & phúc lợi', SCHEDULING: 'Lịch làm việc',
  FEATURES: 'Tính năng yêu cầu', SPECIAL_REQUIREMENTS: 'Yêu cầu đặc biệt', PRIORITIES: 'Ưu tiên & Timeline',
};

const TASK_STATUS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  TODO: { icon: <ClockCircleOutlined />, color: '#8c8c8c', label: 'Chờ làm' },
  IN_PROGRESS: { icon: <SyncOutlined spin />, color: '#4F46E5', label: 'Đang làm' },
  IN_REVIEW: { icon: <ExclamationCircleFilled />, color: '#fa8c16', label: 'Review' },
  DONE: { icon: <CheckCircleFilled />, color: '#52c41a', label: 'Xong' },
  BLOCKED: { icon: <StopOutlined />, color: '#ff4d4f', label: 'Chặn' },
};

function getCategories(progress: Record<string, any> | undefined): Record<string, any> {
  if (!progress) return {};
  if (progress.categories && typeof progress.categories === 'object') return progress.categories;
  const cats: Record<string, any> = {};
  for (const k of Object.keys(CATEGORY_LABELS)) { if (progress[k]) cats[k] = progress[k]; }
  return cats;
}

function catStatus(val: any) {
  if (!val || val.status === 'not_started') return { icon: <ClockCircleOutlined style={{ color: '#CBD5E1' }} />, label: 'Chưa thu thập', done: false };
  const hasData = val.fields_collected?.length > 0;
  if (val.status === 'completed' || val.status === 'done' || hasData)
    return { icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, label: 'Đã thu thập', done: true };
  if (val.status === 'in_progress')
    return { icon: <SyncOutlined spin style={{ color: '#fa8c16' }} />, label: 'Đang thu thập', done: false };
  return { icon: <ClockCircleOutlined style={{ color: '#CBD5E1' }} />, label: 'Chưa thu thập', done: false };
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { currentProject, isLoading, fetchProject } = useProjectStore();
  const { message } = App.useApp();
  const [regenLoading, setRegenLoading] = useState(false);
  const [modalCat, setModalCat] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => { fetchProject(id); }, [id, fetchProject]);
  useEffect(() => {
    apiClient.get<ApiResponse<TaskItem[]>>(`/projects/${id}/tasks?limit=100`)
      .then(({ data }) => setTasks(data.data ?? []))
      .catch(() => {});
  }, [id]);

  const p = currentProject;
  const progress = p?.collection_progress;
  const cats = getCategories(progress);
  const hasDocument = !!p?.requirement_doc_url || !!p?.requirement_json;
  const cfg = p ? STATUS_CONFIG[p.status] : null;
  const pri = p ? (PRIORITY_CONFIG[p.priority] ?? { color: 'default', text: p.priority }) : null;

  const categoryKeys = Object.keys(CATEGORY_LABELS);
  const collectedCount = categoryKeys.filter(k => catStatus(cats[k]).done).length;
  const overallProgress = typeof progress?.overall_progress === 'number'
    ? Math.round(progress.overall_progress)
    : collectedCount > 0 ? Math.round((collectedCount / categoryKeys.length) * 100)
    : ['COLLECTED', 'COMPLETED', 'APPROVED', 'IN_PROGRESS'].includes(p?.status ?? '') ? 100 : 0;

  const taskDone = tasks.filter(t => t.status === 'DONE').length;
  const taskPct = tasks.length > 0 ? Math.round((taskDone / tasks.length) * 100) : 0;

  async function handleRegen() {
    setRegenLoading(true);
    try {
      await apiClient.post(`/projects/${id}/regenerate-document`);
      message.success('Đang tạo lại tài liệu...');
      fetchProject(id);
    } catch { message.error('Không thể tạo lại tài liệu'); }
    finally { setRegenLoading(false); }
  }

  if (isLoading && !p) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;
  if (!p) return <AppLayout><Text>Không tìm thấy dự án.</Text></AppLayout>;

  const modalCatData = modalCat ? cats[modalCat] : null;

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/projects')} />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ margin: 0 }}>{p.project_name}</Title>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Tag color={cfg?.color}>{cfg?.text}</Tag>
            <Text type="secondary">#{p.project_code}</Text>
            <Tag color={pri?.color}>{pri?.text}</Tag>
          </div>
        </div>
        {p.status === 'COLLECTING' ? (
          <Button type="primary" icon={<MessageOutlined />} size="large" onClick={() => router.push(`/projects/${id}/chat`)}>Chat với AI</Button>
        ) : (
          <Space>
            <Button icon={<FileTextOutlined />} disabled={!hasDocument} onClick={() => router.push(`/projects/${id}/document`)}>Xem tài liệu</Button>
            <Button icon={<MessageOutlined />} onClick={() => router.push(`/projects/${id}/chat`)}>Chat</Button>
          </Space>
        )}
      </div>

      {/* Status Steps */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Steps
          current={cfg?.step ?? 0}
          size="small"
          items={[
            { title: 'Thu thập', icon: <MessageOutlined /> },
            { title: 'Hoàn tất', icon: <CheckCircleOutlined /> },
            { title: 'Tạo tài liệu', icon: <FileTextOutlined /> },
            { title: 'Triển khai', icon: <RocketOutlined /> },
            { title: 'Hoàn thành', icon: <CheckCircleFilled /> },
          ]}
        />
      </Card>

      {/* Status banner */}
      {['IN_PROGRESS', 'COMPLETED'].includes(p.status) && (
        <Card style={{ marginBottom: 16, background: p.status === 'COMPLETED' ? '#f6ffed' : '#EEF2FF', border: 'none', borderRadius: 12 }}>
          <Text strong style={{ fontSize: 16 }}>
            {p.status === 'IN_PROGRESS' ? '🚀 Dự án đang được triển khai' : '🎉 Dự án đã hoàn thành'}
          </Text>
          <br />
          <Text type="secondary">
            {p.status === 'IN_PROGRESS' ? `Đội dev đang thực hiện ${tasks.length} tasks. ${taskDone} đã hoàn thành.` : 'Tất cả tasks đã hoàn thành.'}
          </Text>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {/* Left column */}
        <Col xs={24} lg={16}>
          {/* Quick stats */}
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
                <Statistic title="Thu thập" value={`${collectedCount}/9`} valueStyle={{ fontSize: 18, color: '#4F46E5' }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
                <Statistic title="Tổng tasks" value={tasks.length} valueStyle={{ fontSize: 18 }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
                <Statistic title="Tasks xong" value={taskDone} valueStyle={{ fontSize: 18, color: '#10B981' }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
                <Statistic title="Tiến độ" value={`${taskPct}%`} valueStyle={{ fontSize: 18, color: taskPct >= 100 ? '#10B981' : '#4F46E5' }} />
              </Card>
            </Col>
          </Row>

          {/* Task list */}
          {tasks.length > 0 && (
            <Card title={<Text strong>Danh sách tasks ({tasks.length})</Text>} style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
              <List
                dataSource={tasks}
                renderItem={(task) => {
                  const ts = TASK_STATUS[task.status];
                  return (
                    <List.Item style={{ padding: '10px 20px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                        <span style={{ color: ts?.color, fontSize: 14 }}>{ts?.icon}</span>
                        <div style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13 }}>{task.title}</Text>
                          {task.description && <div><Text type="secondary" style={{ fontSize: 11 }}>{task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}</Text></div>}
                        </div>
                        {task.task_type && <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{task.task_type}</Tag>}
                        <Tag color={ts?.color} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{ts?.label}</Tag>
                        {task.estimated_hours && <Text type="secondary" style={{ fontSize: 11 }}>{task.estimated_hours}h</Text>}
                      </div>
                    </List.Item>
                  );
                }}
              />
              <div style={{ padding: '12px 20px', background: '#FAFBFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tiến độ triển khai</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{taskDone}/{tasks.length}</Text>
                </div>
                <Progress percent={taskPct} strokeColor={taskPct >= 100 ? '#10B981' : '#4F46E5'} />
              </div>
            </Card>
          )}

          {/* Categories */}
          <Card title="Thu thập thông tin" style={{ borderRadius: 12 }}>
            <Row gutter={[10, 10]}>
              {categoryKeys.map(k => {
                const { icon, label, done } = catStatus(cats[k]);
                return (
                  <Col xs={12} sm={8} key={k}>
                    <div
                      onClick={() => setModalCat(k)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                        borderRadius: 8, cursor: 'pointer', border: '1px solid #E2E8F0',
                        background: done ? '#F0FDF4' : 'transparent', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#4F46E5'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                    >
                      {icon}
                      <div>
                        <Text style={{ fontSize: 12, fontWeight: 500, display: 'block' }}>{CATEGORY_LABELS[k]}</Text>
                        <Text type="secondary" style={{ fontSize: 10 }}>{label}</Text>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>

        {/* Right column */}
        <Col xs={24} lg={8}>
          {/* Progress circle */}
          <Card style={{ marginBottom: 16, borderRadius: 12, textAlign: 'center' }}>
            <Progress type="circle" percent={overallProgress} size={100} strokeWidth={8}
              strokeColor={overallProgress >= 100 ? '#10B981' : '#4F46E5'}
              format={pct => <span style={{ fontSize: 20, fontWeight: 600 }}>{pct}%</span>}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Thu thập: {collectedCount}/9</Text>
            </div>
          </Card>

          {/* Project info */}
          <Card title="Thông tin" style={{ marginBottom: 16, borderRadius: 12 }} size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <CalendarOutlined />, label: 'Ngày tạo', value: new Date(p.created_at).toLocaleDateString('vi-VN') },
                { icon: <CalendarOutlined />, label: 'Cập nhật', value: new Date(p.updated_at).toLocaleDateString('vi-VN') },
                ...(p.customer ? [{ icon: <TeamOutlined />, label: 'Khách hàng', value: p.customer.full_name }] : []),
                ...(p.estimated_budget ? [{ icon: <FundOutlined />, label: 'Budget', value: new Intl.NumberFormat('vi-VN').format(p.estimated_budget) + '₫' }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.icon} {item.label}</Text>
                  <Text strong style={{ fontSize: 12 }}>{item.value}</Text>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card title="Thao tác" style={{ borderRadius: 12 }} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {p.status === 'COLLECTING' && (
                <Button type="primary" icon={<MessageOutlined />} block onClick={() => router.push(`/projects/${id}/chat`)}>Chat với AI</Button>
              )}
              <Button icon={<MessageOutlined />} block onClick={() => router.push(`/projects/${id}/chat`)}>
                {p.status === 'COLLECTING' ? 'Tiếp tục chat' : 'Xem lại chat'}
              </Button>
              <Button icon={<FileTextOutlined />} block disabled={!hasDocument} onClick={() => router.push(`/projects/${id}/document`)}>
                Xem tài liệu yêu cầu
              </Button>
              <Button icon={<ReloadOutlined />} block loading={regenLoading} onClick={handleRegen}>
                Tạo lại tài liệu
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Category Modal */}
      <Modal title={modalCat ? CATEGORY_LABELS[modalCat] : ''} open={!!modalCat} onCancel={() => setModalCat(null)}
        footer={<Button onClick={() => setModalCat(null)}>Đóng</Button>}>
        {modalCatData ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', borderRadius: 8,
              background: modalCatData.fields_collected?.length > 0 ? '#f6ffed' : '#fff7e6' }}>
              {modalCatData.fields_collected?.length > 0
                ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                : <ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              <Text strong>{modalCatData.fields_collected?.length > 0 ? 'Đã thu thập' : 'Chưa thu thập'}</Text>
            </div>
            {modalCatData.fields_collected?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Thông tin đã có:</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {modalCatData.fields_collected.map((f: string) => (
                    <Tag key={f} color="green">{f.replace(/_/g, ' ')}</Tag>
                  ))}
                </div>
              </div>
            )}
            {modalCatData.last_updated && (
              <Text type="secondary" style={{ fontSize: 12 }}>Cập nhật: {new Date(modalCatData.last_updated).toLocaleString('vi-VN')}</Text>
            )}
          </div>
        ) : <Text type="secondary">Chưa có dữ liệu.</Text>}
      </Modal>
    </AppLayout>
  );
}
