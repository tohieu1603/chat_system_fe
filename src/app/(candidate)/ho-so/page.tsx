'use client';

import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CandidateProfile } from '@/types/talent-venture';
import CandidateProfileForm from '@/components/profile/candidate-profile-form';
import styles from './ho-so.module.css';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const initialValues: Partial<CandidateProfile> = {
    full_name: user?.full_name,
    phone: user?.phone,
    ...profile,
  };

  const displayName = user?.full_name ?? user?.email ?? 'Ứng viên';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.avatar}>{initials}</div>
        <div>
          <h1 className={styles.name}>{displayName}</h1>
          <p className={styles.email}>{user?.email}</p>
        </div>
      </div>

      <div className={styles.formWrap}>
        <CandidateProfileForm initialValues={initialValues} onSaved={() => {}} />
      </div>
    </div>
  );
}
