'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import { ProjectOutlined, CheckCircleOutlined, TeamOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { ProjectStatus } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const STATUS_COLOR: Record<ProjectStatus, string> = {
  COLLECTING: 'blue', COLLECTED: 'cyan', REVIEWING: 'orange',
  APPROVED: 'green', IN_PROGRESS: 'purple', COMPLETED: 'green', ON_HOLD: 'red',
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  COLLECTING: 'Đang thu thập', COLLECTED: 'Đã thu thập', REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn thành', ON_HOLD: 'Tạm dừng',
};

interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_customers: number;
  projects_by_status: Record<string, number>;
}

interface RecentProject {
  id: string;
  project_code: string;
  project_name: string;
  status: ProjectStatus;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/dashboard/recent-activity'),
        ]);
        setStats(statsRes.data?.data ?? statsRes.data);
        const act = recentRes.data?.data ?? recentRes.data;
        setRecent(Array.isArray(act) ? act : act?.projects ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns: ColumnsType<RecentProject> = [
    { title: 'Mã dự án', dataIndex: 'project_code', key: 'project_code', width: 120 },
    { title: 'Tên dự án', dataIndex: 'project_name', key: 'project_name' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 160,
      render: (s: ProjectStatus) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', width: 130,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
  ];

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
        <Title level={4}>Dashboard Quản trị</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Tổng dự án" value={stats?.total_projects ?? 0} prefix={<ProjectOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Dự án đang hoạt động" value={stats?.active_projects ?? 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Tổng khách hàng" value={stats?.total_customers ?? 0} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
        </Row>

        {stats?.projects_by_status && (
          <Card title="Thống kê theo trạng thái" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(stats.projects_by_status).map(([s, count]) => (
                <Tag key={s} color={STATUS_COLOR[s as ProjectStatus]}>
                  {STATUS_LABEL[s as ProjectStatus] ?? s}: {count}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        <Card title="Dự án gần đây">
          <Table dataSource={recent} columns={columns} rowKey="id" pagination={false} size="small" />
        </Card>
    </AppLayout>
  );
}
