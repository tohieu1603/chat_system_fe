'use client';

import { useEffect, useState } from 'react';
import { Tag } from 'antd';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { Evaluation } from '@/types/talent-venture';

const CRITERIA = [
  { key: 'workflow_score', label: 'Hệ thống Workflow', weight: '35%' },
  { key: 'business_score', label: 'Mô hình kinh doanh', weight: '30%' },
  { key: 'organic_score', label: 'Marketing Organic', weight: '25%' },
  { key: 'ads_score', label: 'Quảng cáo trả phí', weight: '10%' },
];

export default function EvaluationResults({ planId }: { planId: string }) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ApiResponse<Evaluation>>(`/business-plans/${planId}/evaluation`)
      .then(({ data }) => setEvaluation(data.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading || !evaluation) return null;

  const total = Number(evaluation.weighted_total ?? 0);
  const rec = evaluation.recommendation;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Kết quả đánh giá</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{total.toFixed(1)}<span style={{ fontSize: 13, fontWeight: 400, color: '#888' }}>/10</span></span>
          {rec && (
            <Tag color={rec === 'APPROVE' ? 'green' : rec === 'REJECT' ? 'red' : 'orange'} style={{ margin: 0, fontSize: 12, borderRadius: 4 }}>
              {rec === 'APPROVE' ? 'Đạt' : rec === 'REJECT' ? 'Không đạt' : 'Cần sửa'}
            </Tag>
          )}
        </div>
      </div>

      {/* Scores */}
      {CRITERIA.map((c) => {
        const score = (evaluation as any)[c.key] ?? 0;
        return (
          <div key={c.key} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f5f5f5', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#999', width: 30, flexShrink: 0 }}>{c.weight}</span>
            <span style={{ fontSize: 13, color: '#333', flex: 1 }}>{c.label}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111', width: 24, textAlign: 'right' }}>{score}</span>
            <div style={{ width: 80, height: 4, background: '#f0f0f0', borderRadius: 2, flexShrink: 0 }}>
              <div style={{ width: `${score * 10}%`, height: '100%', background: '#111', borderRadius: 2 }} />
            </div>
          </div>
        );
      })}

      {/* Feedback */}
      {(evaluation.strengths || evaluation.weaknesses || evaluation.improvement_notes) && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          {evaluation.strengths && (
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 2 }}>Điểm mạnh</span>
              <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{evaluation.strengths}</p>
            </div>
          )}
          {evaluation.weaknesses && (
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 2 }}>Điểm yếu</span>
              <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{evaluation.weaknesses}</p>
            </div>
          )}
          {evaluation.improvement_notes && (
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 2 }}>Khuyến nghị</span>
              <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{evaluation.improvement_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
