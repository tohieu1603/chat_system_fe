'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Space } from 'antd';
import ScoreSlider from './score-slider';
import WeightedTotalDisplay, { calcWeightedTotal } from './weighted-total-display';
import RecommendationSelect from './recommendation-select';
import type { Evaluation } from '@/types/talent-venture';
import apiClient from '@/lib/api-client';

const { TextArea } = Input;

interface PlanEvaluationFormProps {
  planId: string;
  existing?: Evaluation;
  onSaved?: (evaluation: Evaluation) => void;
}

export default function PlanEvaluationForm({ planId, existing, onSaved }: PlanEvaluationFormProps) {
  const [workflow, setWorkflow] = useState(existing?.workflow_score ?? 5);
  const [business, setBusiness] = useState(existing?.business_score ?? 5);
  const [organic, setOrganic] = useState(existing?.organic_score ?? 5);
  const [ads, setAds] = useState(existing?.ads_score ?? 5);
  const [strengths, setStrengths] = useState(existing?.strengths ?? '');
  const [weaknesses, setWeaknesses] = useState(existing?.weaknesses ?? '');
  const [notes, setNotes] = useState(existing?.improvement_notes ?? '');
  const [recommendation, setRecommendation] = useState<Evaluation['recommendation']>(existing?.recommendation);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!recommendation) {
      message.warning('Vui lòng chọn khuyến nghị');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        plan_id: planId,
        workflow_score: workflow,
        business_score: business,
        organic_score: organic,
        ads_score: ads,
        weighted_total: calcWeightedTotal(workflow, business, organic, ads),
        strengths,
        weaknesses,
        improvement_notes: notes,
        recommendation,
      };
      const res = existing?.id
        ? await apiClient.patch(`/evaluations/${existing.id}`, payload)
        : await apiClient.post('/evaluations', payload);
      const saved = res.data?.data ?? res.data;
      message.success('Đã lưu đánh giá');
      onSaved?.(saved);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Lưu đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <WeightedTotalDisplay workflow={workflow} business={business} organic={organic} ads={ads} />

      <ScoreSlider label="Hệ thống Workflow (35%)" value={workflow} onChange={setWorkflow} />
      <ScoreSlider label="Mô hình kinh doanh (30%)" value={business} onChange={setBusiness} />
      <ScoreSlider label="Khách hàng Organic (25%)" value={organic} onChange={setOrganic} />
      <ScoreSlider label="Quảng cáo trả phí (10%)" value={ads} onChange={setAds} />

      <Form layout="vertical">
        <Form.Item label="Điểm mạnh">
          <TextArea rows={3} value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Điểm mạnh của kế hoạch..." />
        </Form.Item>
        <Form.Item label="Điểm yếu">
          <TextArea rows={3} value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} placeholder="Điểm yếu cần cải thiện..." />
        </Form.Item>
        <Form.Item label="Ghi chú cải thiện">
          <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hướng dẫn cải thiện..." />
        </Form.Item>
        <Form.Item label="Khuyến nghị">
          <RecommendationSelect value={recommendation} onChange={setRecommendation} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={submitting} block>
            Lưu đánh giá
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
