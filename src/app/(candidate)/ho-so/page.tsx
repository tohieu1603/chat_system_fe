'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Spin } from 'antd';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CandidateProfile } from '@/types/talent-venture';
import CandidateProfileForm from '@/components/profile/candidate-profile-form';

const { Title, Text } = Typography;

export default function HoSoPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Partial<CandidateProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ApiResponse<CandidateProfile>>('/users/profile/candidate')
      .then(({ data }) => setProfile(data.data ?? {}))
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const initialValues: Partial<CandidateProfile> = {
    full_name: user?.full_name,
    phone: user?.phone,
    ...profile,
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Hồ sơ ứng viên</Title>
        <Text type="secondary">Cập nhật thông tin cá nhân và CV của bạn</Text>
      </div>

      <Card
        style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
        styles={{ body: { padding: 28 } }}
      >
        <CandidateProfileForm
          initialValues={initialValues}
          onSaved={() => {}}
        />
      </Card>
    </div>
  );
}
