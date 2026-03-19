'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Row, Col, Card, Typography, Spin, Alert, Divider } from 'antd';
import AppLayout from '@/components/layout/app-layout';
import PlanViewer from '@/components/admin-tv/plan-viewer';
import PlanEvaluationForm from '@/components/evaluation/plan-evaluation-form';
import ConvertToProjectBtn from '@/components/admin-tv/convert-to-project-btn';
import apiClient from '@/lib/api-client';
import type { BusinessPlan, Evaluation } from '@/types/talent-venture';

const { Title, Text } = Typography;

export default function DanhGiaPage() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [converted, setConverted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiClient.get(`/business-plans/${id}`),
      apiClient.get(`/business-plans/${id}/evaluation`).catch(() => null),
    ]).then(([planRes, evalRes]) => {
      setPlan(planRes.data?.data ?? planRes.data);
      if (evalRes) {
        const ev = evalRes.data?.data ?? evalRes.data;
        if (ev?.id) setEvaluation(ev);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleEvalSaved = (saved: Evaluation) => {
    setEvaluation(saved);
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: 64 }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  if (!plan) {
    return (
      <AppLayout>
        <Alert type="error" message="Không tìm thấy kế hoạch" />
      </AppLayout>
    );
  }

  const isApproved = evaluation?.recommendation === 'APPROVE';

  return (
    <AppLayout>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Đánh giá Kế hoạch Kinh doanh</Title>
        <Text type="secondary">{plan.title}</Text>
      </div>

      <Row gutter={16}>
        <Col span={14}>
          <Card
            title="Nội dung Kế hoạch"
            style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <PlanViewer plan={plan} />
          </Card>
        </Col>

        <Col span={10}>
          <Card
            title="Form Đánh giá"
            style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <PlanEvaluationForm
              planId={id}
              existing={evaluation}
              onSaved={handleEvalSaved}
            />

            {isApproved && !converted && (
              <>
                <Divider />
                <div style={{ textAlign: 'center' }}>
                  <ConvertToProjectBtn
                    planId={id}
                    onConverted={() => setConverted(true)}
                  />
                </div>
              </>
            )}

            {converted && (
              <Alert
                type="success"
                message="Đã chuyển thành Dự án thành công!"
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
