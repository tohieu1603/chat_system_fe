'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Select, message } from 'antd';
import AppLayout from '@/components/layout/app-layout';
import CandidateListTable from '@/components/admin-tv/candidate-list-table';
import apiClient from '@/lib/api-client';
import type { User } from '@/types';
import type { Batch } from '@/types/talent-venture';

const { Title } = Typography;

interface CandidateRow extends User {
  university?: string;
  team_name?: string;
  plan_status?: string;
  assessment_avg?: number;
}

const HAS_TEAM_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Có đội', value: 'true' },
  { label: 'Chưa có đội', value: 'false' },
];

const HAS_ASSESSMENT_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Đã đánh giá', value: 'true' },
  { label: 'Chưa đánh giá', value: 'false' },
];

export default function UngVienPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState('');
  const [hasTeam, setHasTeam] = useState('');
  const [hasAssessment, setHasAssessment] = useState('');

  useEffect(() => {
    apiClient.get('/batches').then((res) => {
      const d = res.data?.data ?? res.data;
      setBatches(Array.isArray(d) ? d : d?.items ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { role: 'CANDIDATE' };
    if (batchFilter) params.batch_id = batchFilter;
    if (hasTeam) params.has_team = hasTeam;
    if (hasAssessment) params.has_assessment = hasAssessment;
    apiClient.get('/users', { params }).then((res) => {
      const d = res.data?.data ?? res.data;
      setCandidates(Array.isArray(d) ? d : d?.users ?? []);
    }).catch(() => {
      message.error('Tải dữ liệu thất bại');
    }).finally(() => setLoading(false));
  }, [batchFilter, hasTeam, hasAssessment]);

  const batchOptions = [
    { label: 'Tất cả đợt', value: '' },
    ...batches.map((b) => ({ label: b.name, value: b.id })),
  ];

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 16 }}>Danh sách Ứng viên</Title>

      <Card style={{ marginBottom: 12 }}>
        <Row gutter={12}>
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
              options={HAS_TEAM_OPTIONS}
              value={hasTeam}
              onChange={setHasTeam}
              style={{ width: '100%' }}
              placeholder="Lọc theo đội nhóm"
            />
          </Col>
          <Col span={8}>
            <Select
              options={HAS_ASSESSMENT_OPTIONS}
              value={hasAssessment}
              onChange={setHasAssessment}
              style={{ width: '100%' }}
              placeholder="Lọc theo đánh giá"
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <CandidateListTable data={candidates} loading={loading} />
      </Card>
    </AppLayout>
  );
}
