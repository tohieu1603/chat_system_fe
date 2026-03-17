'use client';

import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Tag, Button, Input, Typography, Progress,
  Empty, Segmented, Space, Spin,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import { useProjectStore } from '@/stores/project-store';
import type { Project, ProjectStatus } from '@/types';

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

const FILTER_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Đang thu thập', value: 'COLLECTING' },
  { label: 'Đã thu thập', value: 'COLLECTED' },
  { label: 'Đang review', value: 'REVIEWING' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Đang triển khai', value: 'IN_PROGRESS' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Tạm dừng', value: 'ON_HOLD' },
];

function getProgress(project: Project): number {
  const p = project.collection_progress;
  if (typeof p?.overall_progress === 'number') return Math.round(p.overall_progress);
  return project.status === 'COMPLETED' ? 100 : project.status === 'COLLECTED' ? 100 : 0;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoading, fetchProjects } = useProjectStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter((p) => {
    const matchSearch = p.project_name.toLowerCase().includes(search.toLowerCase()) ||
      p.project_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Dự án của tôi</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/projects/new')}>
          Tạo dự án mới
        </Button>
      </div>

      {/* Search + Filter */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }} size={12}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          placeholder="Tìm kiếm theo tên hoặc mã dự án..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
        <Segmented
          options={FILTER_OPTIONS}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as string)}
        />
      </Space>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 64 }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty description={projects.length === 0 ? 'Bạn chưa có dự án nào' : 'Không có dự án nào phù hợp'} style={{ padding: '48px 0' }}>
          {projects.length === 0 && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/projects/new')}>
              Tạo dự án đầu tiên
            </Button>
          )}
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status];
            const pri = PRIORITY_CONFIG[p.priority] ?? { color: 'default', text: p.priority };
            const prog = getProgress(p);
            return (
              <Col key={p.id} xs={24} sm={12} xl={8}>
                <Card
                  hoverable
                  style={{ height: '100%', cursor: 'pointer' }}
                  styles={{ body: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 } }}
                  onClick={() => router.push(`/projects/${p.id}`)}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <Text strong style={{ fontSize: 15, lineHeight: 1.4, flex: 1 }}>{p.project_name}</Text>
                    <Tag style={{ margin: 0, flexShrink: 0, fontSize: 11 }}>#{p.project_code}</Tag>
                  </div>

                  {/* Status */}
                  <Tag color={cfg.color} style={{ display: 'inline-block', width: 'fit-content' }}>{cfg.text}</Tag>

                  {/* Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tiến độ</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{prog}%</Text>
                    </div>
                    <Progress percent={prog} size="small" showInfo={false} />
                  </div>

                  {/* Description */}
                  {p.description && (
                    <Paragraph type="secondary" style={{ fontSize: 13, margin: 0 }} ellipsis={{ rows: 2 }}>
                      {p.description}
                    </Paragraph>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(p.created_at).toLocaleDateString('vi-VN')}
                    </Text>
                    <Tag color={pri.color} style={{ margin: 0, fontSize: 11 }}>{pri.text}</Tag>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </AppLayout>
  );
}
