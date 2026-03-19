'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Spin, Avatar, Row, Col, Divider } from 'antd';
import { UserOutlined, IdcardOutlined } from '@ant-design/icons';
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 100,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const initialValues: Partial<CandidateProfile> = {
    full_name: user?.full_name,
    phone: user?.phone,
    ...profile,
  };

  const displayName = user?.full_name ?? user?.email ?? 'Ung vien';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      {/* Profile header card */}
      <Card
        style={{
          borderRadius: 20,
          border: 'none',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          boxShadow: '0 8px 28px rgba(79,70,229,0.25)',
          marginBottom: 24,
          overflow: 'hidden',
          position: 'relative',
        }}
        styles={{ body: { padding: '32px 36px' } }}
      >
        {/* decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <Row align="middle" gutter={[20, 16]}>
          <Col>
            <Avatar
              size={72}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.4)',
                fontSize: 26,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
              icon={!initials ? <UserOutlined /> : undefined}
            >
              {initials || undefined}
            </Avatar>
          </Col>
          <Col>
            <Text
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 12,
                letterSpacing: 0.5,
                display: 'block',
                marginBottom: 4,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Ho so ung vien
            </Text>
            <Title
              level={3}
              style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 22 }}
            >
              {displayName}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block', marginTop: 4 }}>
              {user?.email}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Form card */}
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4F46E5',
              fontSize: 15,
            }}
          >
            <IdcardOutlined />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: '#111827' }}>
              Thong tin ca nhan
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cap nhat ho so de tang co hoi duoc lua chon
            </Text>
          </div>
        </div>
        <Divider style={{ margin: '0 0 24px', borderColor: '#F1F5F9' }} />

        <CandidateProfileForm
          initialValues={initialValues}
          onSaved={() => {}}
        />
      </Card>
    </div>
  );
}
