'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Row, Col, Card, Typography, Spin, Alert, Divider, Tabs } from 'antd';
import ReactMarkdown from 'react-markdown';
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
  const [projectDoc, setProjectDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiClient.get(`/business-plans/${id}`),
      apiClient.get(`/business-plans/${id}/evaluation`).catch(() => null),
    ]).then(async ([planRes, evalRes]) => {
      const p = planRes.data?.data ?? planRes.data;
      setPlan(p);
      if (evalRes) {
        const ev = evalRes.data?.data ?? evalRes.data;
        if (ev?.id) setEvaluation(ev);
      }
      if (p?.status === 'APPROVED') {
        try {
          const projRes = await apiClient.get('/projects', { params: { limit: 100 } });
          const raw = projRes.data?.data ?? projRes.data;
          const list = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
          const match = list.find((proj: any) => proj.project_name === p.title && proj.requirement_doc_url);
          if (match) {
            setProjectDoc(match.requirement_doc_url);
            setConverted(true);
          }
        } catch {}
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
            style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}
            styles={{ body: { padding: '0 20px 16px' } }}
          >
            <Tabs
              defaultActiveKey="plan"
              items={[
                {
                  key: 'plan',
                  label: 'Nội dung Kế hoạch',
                  children: <PlanViewer plan={plan} />,
                },
                ...(projectDoc ? [
                  {
                    key: 'report',
                    label: 'Báo cáo Dự án',
                    children: (
                      <div className="kimi-md" style={{ lineHeight: 1.8, fontSize: 14 }}>
                        <ReactMarkdown>{projectDoc}</ReactMarkdown>
                      </div>
                    ),
                  },
                  {
                    key: 'markdown',
                    label: 'Markdown',
                    children: (
                      <pre style={{ background: '#f8f9fa', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                        {projectDoc}
                      </pre>
                    ),
                  },
                ] : []),
              ]}
            />
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
                    onConverted={(project: any) => {
                      setConverted(true);
                      if (project?.requirement_doc_url) setProjectDoc(project.requirement_doc_url);
                    }}
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
