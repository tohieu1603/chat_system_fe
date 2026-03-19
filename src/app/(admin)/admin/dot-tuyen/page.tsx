'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Button, Row, Col, Statistic, Space, message } from 'antd';
import { PlusOutlined, TeamOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import BatchTable from '@/components/admin-tv/batch-table';
import BatchFormModal from '@/components/admin-tv/batch-form-modal';
import apiClient from '@/lib/api-client';
import type { Batch } from '@/types/talent-venture';

const { Title } = Typography;

type BatchWithStats = Batch & {
  team_count?: number;
  candidate_count?: number;
  plan_count?: number;
};

const STATUS_NEXT: Record<string, Batch['status']> = {
  UPCOMING: 'OPEN',
  OPEN: 'CLOSED',
};

export default function DotTuyenPage() {
  const [batches, setBatches] = useState<BatchWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/batches');
      const data = res.data?.data ?? res.data;
      const list: BatchWithStats[] = Array.isArray(data) ? data : data?.items ?? [];
      // Fetch stats for each batch
      const withStats = await Promise.all(
        list.map(async (b) => {
          try {
            const statsRes = await apiClient.get(`/batches/${b.id}/stats`);
            const stats = statsRes.data?.data ?? statsRes.data;
            return { ...b, ...stats };
          } catch {
            return b;
          }
        }),
      );
      setBatches(withStats);
    } catch {
      message.error('Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/batches/${id}`);
      message.success('Đã xoá đợt tuyển');
      setBatches((prev) => prev.filter((b) => b.id !== id));
    } catch {
      message.error('Xoá thất bại');
    }
  };

  const handleStatusTransition = async (batch: Batch) => {
    const next = STATUS_NEXT[batch.status];
    if (!next) return;
    try {
      const res = await apiClient.patch(`/batches/${batch.id}`, { status: next });
      const updated = res.data?.data ?? res.data;
      setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, ...updated } : b)));
      message.success('Đã cập nhật trạng thái');
    } catch {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleSaved = (saved: Batch) => {
    setBatches((prev) => {
      const exists = prev.find((b) => b.id === saved.id);
      if (exists) return prev.map((b) => (b.id === saved.id ? { ...b, ...saved } : b));
      return [saved, ...prev];
    });
  };

  // Aggregate stats across all batches
  const totalTeams = batches.reduce((s, b) => s + (b.team_count ?? 0), 0);
  const totalCandidates = batches.reduce((s, b) => s + (b.candidate_count ?? 0), 0);
  const totalPlans = batches.reduce((s, b) => s + (b.plan_count ?? 0), 0);

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý Đợt tuyển</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingBatch(null); setModalOpen(true); }}
        >
          Tạo đợt tuyển
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Tổng số đội" value={totalTeams} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Tổng ứng viên" value={totalCandidates} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Kế hoạch đã nộp" value={totalPlans} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card>
        <BatchTable
          data={batches}
          loading={loading}
          onEdit={(b) => { setEditingBatch(b); setModalOpen(true); }}
          onDelete={handleDelete}
          onStatusTransition={handleStatusTransition}
        />
      </Card>

      <BatchFormModal
        open={modalOpen}
        editing={editingBatch}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </AppLayout>
  );
}
