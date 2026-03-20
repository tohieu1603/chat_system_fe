'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Select, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import PlanListTable from '@/components/admin-tv/plan-list-table';
import apiClient from '@/lib/api-client';
import type { BusinessPlan, Batch } from '@/types/talent-venture';

const { Title } = Typography;

interface PlanRow extends BusinessPlan {
  team_name?: string;
  batch_name?: string;
  weighted_total?: number;
}

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Đã nộp', value: 'SUBMITTED' },
  { label: 'Đang xét', value: 'REVIEWING' },
  { label: 'Phê duyệt', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
];

export default function KeHoachPage() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.get('/batches').then((res) => {
      const d = res.data?.data ?? res.data;
      setBatches(Array.isArray(d) ? d : d?.items ?? []);
    }).catch(() => {});
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (batchFilter) params.batch_id = batchFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/business-plans', { params });
      const d = res.data?.data ?? res.data;
      const planList: PlanRow[] = Array.isArray(d) ? d : d?.items ?? [];

      // Fetch evaluations for all plans in parallel
      const withEvals = await Promise.all(
        planList.map(async (p) => {
          try {
            const evalRes = await apiClient.get(`/business-plans/${p.id}/evaluation`);
            const ev = evalRes.data?.data;
            return { ...p, weighted_total: ev?.weighted_total ?? undefined };
          } catch {
            return p;
          }
        }),
      );
      setPlans(withEvals);
    } catch {
      message.error('Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, [batchFilter, statusFilter]);

  const filtered = plans.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const batchOptions = [
    { label: 'Tất cả đợt', value: '' },
    ...batches.map((b) => ({ label: b.name, value: b.id })),
  ];

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 16 }}>Danh sách Kế hoạch Kinh doanh</Title>

      <Card style={{ marginBottom: 12 }}>
        <Row gutter={12}>
          <Col span={8}>
            <Input.Search
              placeholder="Tìm theo tiêu đề..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={8}>
            <Select
              options={batchOptions}
              value={batchFilter}
              onChange={setBatchFilter}
              style={{ width: '100%' }}
              placeholder="Lọc theo đợt tuyển"
            />
          </Col>
          <Col span={8}>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <PlanListTable data={filtered} loading={loading} onRefresh={fetchPlans} />
      </Card>
    </AppLayout>
  );
}
