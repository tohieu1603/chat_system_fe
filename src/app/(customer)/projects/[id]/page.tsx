'use client';

import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Tag, Button, Typography, Progress,
  Timeline, Spin, App, Modal, Descriptions, Space,
} from 'antd';
import {
  ArrowLeftOutlined, MessageOutlined, FileTextOutlined,
  ReloadOutlined, CheckCircleOutlined, SyncOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import { useProjectStore } from '@/stores/project-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse, ProjectStatus, TaskItem } from '@/types';

const { Title, Text, Paragraph } = Typography;

const STATUS_CONFIG: Record<ProjectStatus, { color: string; text: string }> = {
  COLLECTING: { color: 'processing', text: 'Đang thu thập' },
  COLLECTED: { color: 'cyan', text: 'Đã thu thập' },
  REVIEWING: { color: 'warning', text: 'Đang review' },
  APPROVED: { color: 'success', text: 'Đã duyệt' },
  IN_PROGRESS: { color: 'purple', text: 'Đang triển khai' },
  COMPLETED: { color: 'success', text: 'Hoàn thành' },
  ON_HOLD: { color: 'error', text: 'Tạm dừng' },
};

const PRIORITY_CONFIG: Record<string, { color: string; text: string }> = {
  LOW: { color: 'default', text: 'Thấp' },
  MEDIUM: { color: 'blue', text: 'Trung bình' },
  HIGH: { color: 'orange', text: 'Cao' },
  URGENT: { color: 'red', text: 'Khẩn cấp' },
};

const CATEGORY_LABELS: Record<string, string> = {
  COMPANY_INFO: 'Thông tin công ty',
  DEPARTMENTS: 'Phòng ban',
  EMPLOYEES: 'Nhân sự',
  WORKFLOWS: 'Quy trình làm việc',
  SALARY: 'Lương & phúc lợi',
  SCHEDULING: 'Lịch làm việc',
  FEATURES: 'Tính năng yêu cầu',
  SPECIAL_REQUIREMENTS: 'Yêu cầu đặc biệt',
  PRIORITIES: 'Ưu tiên & Timeline',
};

/** Normalize: progress data can be at root or under .categories */
function getCategories(progress: Record<string, any> | undefined): Record<string, any> {
  if (!progress) return {};
  if (progress.categories && typeof progress.categories === 'object') return progress.categories;
  // Filter only known category keys at root level
  const cats: Record<string, any> = {};
  for (const k of Object.keys(CATEGORY_LABELS)) {
    if (progress[k]) cats[k] = progress[k];
  }
  return cats;
}

function catStatus(val: any) {
  if (!val || val.status === 'not_started' || val.status === 'pending')
    return { icon: <ClockCircleOutlined style={{ color: '#bfbfbf' }} />, label: 'Chưa thu thập' };
  // in_progress with fields_collected = đã thu thập (backend marks as in_progress even when done)
  const hasData = val.fields_collected?.length > 0;
  if (val.status === 'completed' || val.status === 'done' || hasData)
    return { icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, label: 'Đã thu thập' };
  if (val.status === 'collecting' || val.status === 'in_progress')
    return { icon: <SyncOutlined spin style={{ color: '#fa8c16' }} />, label: 'Đang thu thập' };
  return { icon: <ClockCircleOutlined style={{ color: '#bfbfbf' }} />, label: 'Chưa thu thập' };
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { currentProject, isLoading, fetchProject } = useProjectStore();
  const { message } = App.useApp();
  const [regenLoading, setRegenLoading] = useState(false);
  const [modalCat, setModalCat] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => { fetchProject(id); }, [id, fetchProject]);

  // Fetch tasks for implementation progress
  useEffect(() => {
    apiClient.get<ApiResponse<TaskItem[]>>(`/projects/${id}/tasks`)
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
  const collectedCount = categoryKeys.filter(k => {
    const v = cats[k];
    return v && v.status !== 'not_started' && v.status !== 'pending' && (v.status === 'completed' || v.status === 'done' || v.fields_collected?.length > 0);
  }).length;

  // Use overall_progress if available, else calculate from collected categories, else infer from status
  const overallProgress = typeof progress?.overall_progress === 'number'
    ? Math.round(progress.overall_progress)
    : collectedCount > 0
      ? Math.round((collectedCount / categoryKeys.length) * 100)
      : ['COLLECTED', 'COMPLETED', 'APPROVED'].includes(p?.status ?? '') ? 100 : 0;

  async function handleRegen() {
    setRegenLoading(true);
    try {
      await apiClient.post(`/projects/${id}/regenerate-document`);
      message.success('Đang tạo lại tài liệu...');
      fetchProject(id);
    } catch { message.error('Không thể tạo lại tài liệu'); }
    finally { setRegenLoading(false); }
  }

  const timelineItems = [
    { label: 'Tạo dự án', dot: <CheckCircleOutlined style={{ color: '#1677ff' }} />, date: p?.created_at },
    p?.status !== 'COLLECTING' ? { label: 'Bắt đầu thu thập', dot: <CheckCircleOutlined style={{ color: '#fa8c16' }} />, date: p?.created_at } : null,
    ['COLLECTED', 'REVIEWING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(p?.status ?? '') ? { label: 'Thu thập hoàn tất', dot: <CheckCircleOutlined style={{ color: '#52c41a' }} /> } : null,
    hasDocument ? { label: 'Tài liệu được tạo', dot: <CheckCircleOutlined style={{ color: '#722ed1' }} /> } : null,
    p?.status === 'COMPLETED' ? { label: 'Dự án hoàn thành', dot: <CheckCircleOutlined style={{ color: '#52c41a' }} /> } : null,
  ].filter(Boolean) as { label: string; dot: React.ReactNode; date?: string }[];

  if (isLoading && !p) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;
  if (!p) return <AppLayout><Text>Không tìm thấy dự án.</Text></AppLayout>;

  const modalCatData = modalCat ? cats[modalCat] : null;

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/projects')} />
        <Title level={3} style={{ margin: 0, flex: 1 }}>{p.project_name}</Title>
        <Tag color={cfg?.color} style={{ fontSize: 13, padding: '4px 10px' }}>{cfg?.text}</Tag>
        <Tag style={{ fontSize: 12 }}>#{p.project_code}</Tag>
      </div>

      {/* Info Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={14}>
          <Card title="Thông tin dự án" style={{ height: '100%' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên dự án">{p.project_name}</Descriptions.Item>
              {p.description && <Descriptions.Item label="Mô tả"><Paragraph style={{ margin: 0 }} ellipsis={{ rows: 2, expandable: true }}>{p.description}</Paragraph></Descriptions.Item>}
              <Descriptions.Item label="Ưu tiên"><Tag color={pri?.color}>{pri?.text}</Tag></Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{new Date(p.created_at).toLocaleDateString('vi-VN')}</Descriptions.Item>
              {p.customer && <Descriptions.Item label="Khách hàng">{p.customer.full_name}</Descriptions.Item>}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="Tiến độ" style={{ height: '100%', textAlign: 'center' }} bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '8px 0' }}>
              <Progress
                type="dashboard"
                percent={overallProgress}
                strokeColor={overallProgress >= 100 ? '#52c41a' : '#1677ff'}
                gapDegree={0}
                size={110}
                format={(pct) => <span style={{ fontSize: 20, fontWeight: 600 }}>{pct}%</span>}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">{collectedCount}/{categoryKeys.length} danh mục đã thu thập</Text>
              <div style={{ marginTop: 4 }}><Tag color={cfg?.color}>{cfg?.text}</Tag></div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Status banner for approved/in_progress/completed */}
      {['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(p.status) && (
        <Card style={{ marginBottom: 16, background: p.status === 'COMPLETED' ? '#f6ffed' : p.status === 'APPROVED' ? '#e6f4ff' : '#f9f0ff', border: 'none' }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Text strong style={{ fontSize: 15, display: 'block' }}>
                {p.status === 'APPROVED' && '✅ Dự án đã được phê duyệt'}
                {p.status === 'IN_PROGRESS' && '🚀 Dự án đang được triển khai'}
                {p.status === 'COMPLETED' && '🎉 Dự án đã hoàn thành'}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {p.status === 'APPROVED' && 'Tài liệu yêu cầu đã được duyệt. Đội dev sẽ bắt đầu triển khai.'}
                {p.status === 'IN_PROGRESS' && 'Đội dev đang triển khai theo tài liệu yêu cầu đã duyệt.'}
                {p.status === 'COMPLETED' && 'Dự án đã hoàn tất. Bạn có thể xem lại tài liệu bất cứ lúc nào.'}
              </Text>
            </Col>
            {p.estimated_deadline && (
              <Col>
                <Text type="secondary" style={{ fontSize: 12 }}>Deadline: </Text>
                <Tag>{new Date(p.estimated_deadline).toLocaleDateString('vi-VN')}</Tag>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Implementation progress - show when project has tasks or is in later stages */}
      {['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(p.status) && (
        <Card title="Tiến độ triển khai" style={{ marginBottom: 16 }}>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text type="secondary">Chưa có task nào được tạo cho dự án này.</Text>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Admin sẽ tạo task và assign cho đội dev sau khi phê duyệt.</Text>
              </div>
            </div>
          ) : (
            <>
              {/* Task summary stats */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const).map(status => {
                  const count = tasks.filter(t => t.status === status).length;
                  const labels: Record<string, { text: string; color: string }> = {
                    TODO: { text: 'Chờ làm', color: '#8c8c8c' },
                    IN_PROGRESS: { text: 'Đang làm', color: '#1677ff' },
                    IN_REVIEW: { text: 'Đang review', color: '#fa8c16' },
                    DONE: { text: 'Hoàn thành', color: '#52c41a' },
                  };
                  const cfg = labels[status];
                  return (
                    <Col xs={6} key={status}>
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ fontSize: 22, fontWeight: 700, color: cfg.color, display: 'block' }}>{count}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{cfg.text}</Text>
                      </div>
                    </Col>
                  );
                })}
              </Row>
              {/* Overall task progress */}
              {(() => {
                const doneCount = tasks.filter(t => t.status === 'DONE').length;
                const taskPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tổng tiến độ</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{doneCount}/{tasks.length} tasks</Text>
                    </div>
                    <Progress percent={taskPct} strokeColor={taskPct >= 100 ? '#52c41a' : '#1677ff'} />
                  </div>
                );
              })()}
            </>
          )}
        </Card>
      )}

      {/* Budget info if available */}
      {(p.estimated_budget || p.actual_budget) && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={24}>
            {p.estimated_budget != null && (
              <Col xs={12}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ngân sách dự kiến</Text>
                <Text strong style={{ fontSize: 16 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.estimated_budget)}</Text>
              </Col>
            )}
            {p.actual_budget != null && (
              <Col xs={12}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ngân sách thực tế</Text>
                <Text strong style={{ fontSize: 16 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.actual_budget)}</Text>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Categories - show for all statuses that have progress data */}
      {Object.keys(cats).length > 0 && (
        <Card title="Tiến độ thu thập thông tin" style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]}>
            {categoryKeys.map((k) => {
              const { icon, label } = catStatus(cats[k]);
              return (
                <Col xs={12} sm={8} key={k}>
                  <Card
                    hoverable size="small"
                    styles={{ body: { padding: '10px 12px' } }}
                    onClick={() => setModalCat(k)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Space>
                      {icon}
                      <div>
                        <Text style={{ fontSize: 12, fontWeight: 500, display: 'block' }}>{CATEGORY_LABELS[k]}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* Actions */}
      <Card title="Thao tác" style={{ marginBottom: 16 }}>
        <Space wrap>
          {p.status === 'COLLECTING' && (
            <Button type="primary" icon={<MessageOutlined />} size="large" onClick={() => router.push(`/projects/${id}/chat`)}>Chat với AI</Button>
          )}
          {p.status !== 'COLLECTING' && (
            <Button icon={<MessageOutlined />} size="large" onClick={() => router.push(`/projects/${id}/chat`)}>Xem lại chat</Button>
          )}
          <Button icon={<FileTextOutlined />} size="large" type={hasDocument ? 'primary' : 'default'} disabled={!hasDocument} onClick={() => router.push(`/projects/${id}/document`)}>Xem tài liệu</Button>
          <Button icon={<ReloadOutlined />} size="large" loading={regenLoading} onClick={handleRegen}>Tạo lại tài liệu</Button>
        </Space>
      </Card>

      {/* Timeline */}
      <Card title="Lịch sử dự án">
        <Timeline items={timelineItems.map(({ label, dot, date }) => ({
          dot,
          children: <span>{label}{date ? <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>— {new Date(date).toLocaleDateString('vi-VN')}</Text> : null}</span>,
        }))} />
      </Card>

      {/* Category Modal */}
      <Modal
        title={modalCat ? CATEGORY_LABELS[modalCat] : ''}
        open={!!modalCat}
        onCancel={() => setModalCat(null)}
        footer={<Button onClick={() => setModalCat(null)}>Đóng</Button>}
      >
        {modalCatData ? (
          <div>
            {/* Status banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
              padding: '10px 14px', borderRadius: 8,
              background: modalCatData.fields_collected?.length > 0 ? '#f6ffed' : '#fff7e6',
            }}>
              {modalCatData.fields_collected?.length > 0
                ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                : <ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              <Text strong>{modalCatData.fields_collected?.length > 0 ? 'Đã thu thập' : 'Chưa thu thập'}</Text>
            </div>

            {/* Collected fields as tags */}
            {modalCatData.fields_collected?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Thông tin đã có:</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {modalCatData.fields_collected.map((f: string) => {
                    const LABELS: Record<string, string> = {
                      company_name: 'Tên công ty', industry: 'Ngành nghề', company_size: 'Quy mô',
                      current_systems: 'Hệ thống hiện tại', pain_points: 'Khó khăn',
                      departments: 'Phòng ban', workflow_name: 'Tên quy trình', description: 'Mô tả',
                      steps: 'Các bước', salary_structure: 'Cấu trúc lương', components: 'Thành phần',
                      pay_cycle: 'Chu kỳ lương', special_rules: 'Quy định đặc biệt',
                      work_schedule: 'Lịch làm việc', shift_types: 'Loại ca',
                      deadline_management: 'Quản lý deadline', calendar_requirements: 'Yêu cầu lịch',
                      feature_name: 'Tên tính năng', priority: 'Ưu tiên', user_stories: 'User Stories',
                      acceptance_criteria: 'Tiêu chí', requirement: 'Yêu cầu', category: 'Loại',
                      details: 'Chi tiết', constraints: 'Ràng buộc',
                    };
                    return <Tag key={f} color="green">{LABELS[f] ?? f.replace(/_/g, ' ')}</Tag>;
                  })}
                </div>
              </div>
            )}

            {/* Missing fields */}
            {modalCatData.fields_missing?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Còn thiếu:</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {modalCatData.fields_missing.map((f: string) => (
                    <Tag key={f} color="orange">{f.replace(/_/g, ' ')}</Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Last updated */}
            {modalCatData.last_updated && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cập nhật: {new Date(modalCatData.last_updated).toLocaleString('vi-VN')}
              </Text>
            )}
          </div>
        ) : <Text type="secondary">Chưa có dữ liệu cho danh mục này.</Text>}
      </Modal>
    </AppLayout>
  );
}
