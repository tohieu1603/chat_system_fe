'use client';

import { useEffect, useState } from 'react';
import { Collapse, Button, Typography, Spin, Card, Tag, Input, Row, Col, Descriptions, App } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';

const { Title, Paragraph, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  COLLECTING: { label: 'Thu thập', color: 'processing' },
  COLLECTED: { label: 'Đã thu thập', color: 'cyan' },
  REVIEWING: { label: 'Đang review', color: 'orange' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  IN_PROGRESS: { label: 'Triển khai', color: 'purple' },
  COMPLETED: { label: 'Hoàn thành', color: 'success' },
};

const FIELD_LABELS: Record<string, string> = {
  company_info: 'Thông tin công ty', departments: 'Phòng ban', employees: 'Nhân sự',
  workflows: 'Quy trình làm việc', salary: 'Lương & Phúc lợi', scheduling: 'Lịch làm việc',
  features: 'Tính năng yêu cầu', special_requirements: 'Yêu cầu đặc biệt', priorities: 'Ưu tiên & Timeline',
  COMPANY_INFO: 'Thông tin công ty', DEPARTMENTS: 'Phòng ban', EMPLOYEES: 'Nhân sự',
  WORKFLOWS: 'Quy trình làm việc', SALARY: 'Lương & Phúc lợi', SCHEDULING: 'Lịch làm việc',
  FEATURES: 'Tính năng yêu cầu', SPECIAL_REQUIREMENTS: 'Yêu cầu đặc biệt', PRIORITIES: 'Ưu tiên & Timeline',
};

function renderValue(val: any, depth = 0): React.ReactNode {
  if (val === null || val === undefined || val === '') return <Text type="secondary">—</Text>;
  if (typeof val === 'boolean') return <Tag color={val ? 'green' : 'default'}>{val ? 'Có' : 'Không'}</Tag>;
  if (typeof val === 'number') return <Text>{val.toLocaleString('vi-VN')}</Text>;
  if (typeof val === 'string') return <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{val}</Paragraph>;
  if (Array.isArray(val)) {
    if (val.length === 0) return <Text type="secondary">Trống</Text>;
    if (typeof val[0] === 'string') return <Paragraph style={{ margin: 0 }}>{val.join(', ')}</Paragraph>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {val.map((item, i) => (
          <Card key={i} size="small" style={{ background: '#FAFBFC', borderRadius: 8 }}>
            {renderValue(item, depth + 1)}
          </Card>
        ))}
      </div>
    );
  }
  if (typeof val === 'object') {
    return (
      <Descriptions column={1} size="small" bordered={depth === 0} style={{ marginTop: depth > 0 ? 0 : 8 }}>
        {Object.entries(val).map(([k, v]) => (
          <Descriptions.Item key={k} label={FIELD_LABELS[k] ?? k.replace(/_/g, ' ')}>
            {renderValue(v, depth + 1)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  }
  return <Text>{String(val)}</Text>;
}

export default function AdminProjectReviewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { message } = App.useApp();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    apiClient.get(`/projects/${id}`).then(r => {
      setProject(r.data?.data ?? r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/projects/${id}/status`, { status: 'APPROVED' });
      message.success('Đã phê duyệt dự án');
      router.push(`/admin/projects/${id}`);
    } catch { message.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/projects/${id}/status`, { status: 'COLLECTING' });
      message.success('Đã yêu cầu bổ sung thông tin');
      router.push(`/admin/projects/${id}`);
    } catch { message.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;
  if (!project) return <AppLayout><Text>Không tìm thấy dự án</Text></AppLayout>;

  const json = project.requirement_json ?? {};
  const sCfg = STATUS_MAP[project.status] ?? { label: project.status, color: 'default' };

  const panels = Object.entries(json).map(([key, val]) => ({
    key,
    label: <Text strong style={{ fontSize: 14 }}>{FIELD_LABELS[key] ?? key.replace(/_/g, ' ').toUpperCase()}</Text>,
    children: renderValue(val),
  }));

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/admin/projects/${id}`)} />
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ margin: 0 }}>{project.project_name}</Title>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Tag color={sCfg.color}>{sCfg.label}</Tag>
            <Text type="secondary">{project.project_code}</Text>
          </div>
        </div>
      </div>

      {/* Project info */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
        <Row gutter={24}>
          <Col span={6}><Text type="secondary">Khách hàng</Text><br /><Text strong>{project.customer?.full_name ?? '—'}</Text></Col>
          <Col span={6}><Text type="secondary">Công ty</Text><br /><Text strong>{project.customer?.company_name ?? '—'}</Text></Col>
          <Col span={6}><Text type="secondary">Ngày tạo</Text><br /><Text strong>{new Date(project.created_at).toLocaleDateString('vi-VN')}</Text></Col>
          <Col span={6}><Text type="secondary">Ưu tiên</Text><br /><Tag color={project.priority === 'HIGH' ? 'red' : project.priority === 'URGENT' ? 'red' : 'blue'}>{project.priority}</Tag></Col>
        </Row>
      </Card>

      {/* Requirement doc */}
      <Card
        title={<><FileTextOutlined style={{ marginRight: 8 }} />Tài liệu yêu cầu</>}
        style={{ marginBottom: 20, borderRadius: 10 }}
      >
        {panels.length > 0 ? (
          <Collapse items={panels} defaultActiveKey={panels.map(p => p.key)} style={{ background: 'transparent' }} />
        ) : (
          <Text type="secondary">Chưa có tài liệu yêu cầu. Dự án cần hoàn tất thu thập trước.</Text>
        )}
      </Card>

      {/* Actions */}
      <Card style={{ borderRadius: 10 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Button type="primary" size="large" icon={<CheckOutlined />} loading={saving} onClick={handleApprove}
            style={{ background: '#10B981' }}>
            Phê duyệt
          </Button>
          {!showReject ? (
            <Button size="large" icon={<CloseOutlined />} onClick={() => setShowReject(true)} danger>
              Từ chối / Yêu cầu bổ sung
            </Button>
          ) : (
            <div style={{ flex: 1 }}>
              <Input.TextArea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Lý do từ chối hoặc yêu cầu bổ sung thêm thông tin..."
                rows={3}
                style={{ marginBottom: 8, borderRadius: 8 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button danger loading={saving} onClick={handleReject}>Xác nhận từ chối</Button>
                <Button onClick={() => setShowReject(false)}>Hủy</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </AppLayout>
  );
}
