'use client';

import { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import CriteriaSlider from './criteria-slider';
import type { TalentAssessment } from '@/types/talent-venture';
import apiClient from '@/lib/api-client';

const { TextArea } = Input;

interface AssessmentFormProps {
  userId: string;
  existing?: TalentAssessment;
  onSaved?: (assessment: TalentAssessment) => void;
}

const ROLE_OPTIONS = [
  { label: 'Leader', value: 'Leader' },
  { label: 'Marketer', value: 'Marketer' },
  { label: 'Operator', value: 'Operator' },
  { label: 'Analyst', value: 'Analyst' },
  { label: 'Khác', value: 'Other' },
];

export default function AssessmentForm({ userId, existing, onSaved }: AssessmentFormProps) {
  const [businessThinking, setBusinessThinking] = useState(existing?.business_thinking ?? 5);
  const [marketingAbility, setMarketingAbility] = useState(existing?.marketing_ability ?? 5);
  const [proactiveness, setProactiveness] = useState(existing?.proactiveness ?? 5);
  const [teamwork, setTeamwork] = useState(existing?.teamwork ?? 5);
  const [learningSpeed, setLearningSpeed] = useState(existing?.learning_speed ?? 5);
  const [resilience, setResilience] = useState(existing?.resilience ?? 5);
  const [potentialRole, setPotentialRole] = useState(existing?.potential_role ?? undefined);
  const [comments, setComments] = useState(existing?.comments ?? '');
  const [trainingNotes, setTrainingNotes] = useState(existing?.training_notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        user_id: userId,
        business_thinking: businessThinking,
        marketing_ability: marketingAbility,
        proactiveness,
        teamwork,
        learning_speed: learningSpeed,
        resilience,
        potential_role: potentialRole,
        comments,
        training_notes: trainingNotes,
      };
      const res = existing?.id
        ? await apiClient.patch(`/talent-assessments/${existing.id}`, payload)
        : await apiClient.post('/talent-assessments', payload);
      const saved = res.data?.data ?? res.data;
      message.success('Đã lưu đánh giá năng lực');
      onSaved?.(saved);
    } catch {
      message.error('Lưu đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form layout="vertical">
      <CriteriaSlider label="Tư duy kinh doanh" value={businessThinking} onChange={setBusinessThinking} />
      <CriteriaSlider label="Năng lực marketing" value={marketingAbility} onChange={setMarketingAbility} />
      <CriteriaSlider label="Tính chủ động" value={proactiveness} onChange={setProactiveness} />
      <CriteriaSlider label="Làm việc nhóm" value={teamwork} onChange={setTeamwork} />
      <CriteriaSlider label="Tốc độ học hỏi" value={learningSpeed} onChange={setLearningSpeed} />
      <CriteriaSlider label="Khả năng phục hồi" value={resilience} onChange={setResilience} />

      <Form.Item label="Vai trò tiềm năng">
        <Select
          options={ROLE_OPTIONS}
          value={potentialRole}
          onChange={setPotentialRole}
          placeholder="Chọn vai trò phù hợp"
          allowClear
        />
      </Form.Item>
      <Form.Item label="Nhận xét">
        <TextArea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Nhận xét về ứng viên..." />
      </Form.Item>
      <Form.Item label="Ghi chú đào tạo">
        <TextArea rows={3} value={trainingNotes} onChange={(e) => setTrainingNotes(e.target.value)} placeholder="Hướng đào tạo cho ứng viên..." />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSubmit} loading={submitting} block>
          Lưu đánh giá năng lực
        </Button>
      </Form.Item>
    </Form>
  );
}
