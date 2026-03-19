'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Descriptions, Tag, Typography, Spin, Alert, Button, Divider, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/app-layout';
import AssessmentForm from '@/components/talent-assessment/assessment-form';
import apiClient from '@/lib/api-client';
import type { User } from '@/types';
import type { TalentAssessment, CandidateProfile } from '@/types/talent-venture';

const { Title, Text } = Typography;

interface FullCandidate extends User {
  profile?: CandidateProfile;
}

export default function UngVienDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<FullCandidate | null>(null);
  const [assessment, setAssessment] = useState<TalentAssessment | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiClient.get(`/users/${id}`),
      apiClient.get(`/talent-assessments/user/${id}`).catch(() => null),
    ]).then(([userRes, assessRes]) => {
      setCandidate(userRes.data?.data ?? userRes.data);
      if (assessRes) {
        const a = assessRes.data?.data ?? assessRes.data;
        if (a?.id) setAssessment(a);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: 64 }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  if (!candidate) {
    return (
      <AppLayout>
        <Alert type="error" message="Không tìm thấy ứng viên" />
      </AppLayout>
    );
  }

  const profile = candidate.profile;
  const skills = profile?.skills ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <AppLayout>
      <Title level={4} style={{ marginBottom: 16 }}>Hồ sơ Ứng viên</Title>

      <Card title="Thông tin cá nhân" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Họ tên">
            <strong>{candidate.full_name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{candidate.phone ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Trường đại học">{profile?.education ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Kinh nghiệm" span={2}>{profile?.experience ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Kỹ năng" span={2}>
            {skills.length > 0 ? (
              <Space wrap>
                {skills.map((s) => <Tag key={s} color="blue">{s}</Tag>)}
              </Space>
            ) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Động lực" span={2}>
            {profile?.motivation ?? '—'}
          </Descriptions.Item>
          {profile?.cv_url && (
            <Descriptions.Item label="CV" span={2}>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tải CV
              </Button>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Đánh giá Năng lực">
        <AssessmentForm
          userId={id}
          existing={assessment}
          onSaved={setAssessment}
        />
      </Card>
    </AppLayout>
  );
}
