'use client';

import { useEffect, useState } from 'react';
import { Spin, Tag } from 'antd';
import { useAuthStore } from '@/stores/auth-store';
import { useTeamStore } from '@/stores/team-store';
import { usePlanStore } from '@/stores/plan-store';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Notification } from '@/types';
import type { Evaluation } from '@/types/talent-venture';
import StatCards from '@/components/candidate-dashboard/stat-cards';
import DashboardCharts from '@/components/candidate-dashboard/dashboard-charts';

export default function TongQuanPage() {
  const { user } = useAuthStore();
  const { team, fetchMyTeam } = useTeamStore();
  const { plans, fetchMyPlans } = usePlanStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [aiStats, setAiStats] = useState({ totalConversations: 0, totalMessages: 0, messagesToday: 0 });
  const [batch, setBatch] = useState<{ name: string; status: string; application_end?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMyTeam(),
      fetchMyPlans(),
      apiClient
        .get<ApiResponse<Notification[]>>('/notifications?limit=10')
        .then(({ data }) => setNotifications(data.data ?? []))
        .catch(() => {}),
      apiClient
        .get<ApiResponse<{ total_conversations: number; total_messages: number; messages_today: number }>>(
          '/kimi-chat/stats',
        )
        .then(({ data }) => {
          const s = data.data;
          if (s) {
            setAiStats({
              totalConversations: s.total_conversations ?? 0,
              totalMessages: s.total_messages ?? 0,
              messagesToday: s.messages_today ?? 0,
            });
          }
        })
        .catch(() => {}),
      apiClient
        .get('/batches')
        .then(({ data }) => {
          const list = data?.data ?? data;
          const arr = Array.isArray(list) ? list : list?.items ?? [];
          const open = arr.find((b: any) => b.status === 'OPEN');
          if (open) setBatch({ name: open.name, status: open.status, application_end: open.application_end });
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const latestPlan = plans[0] ?? null;

  useEffect(() => {
    if (!latestPlan?.id) return;
    apiClient
      .get<ApiResponse<Evaluation>>(`/business-plans/${latestPlan.id}/evaluation`)
      .then(({ data }) => setEvaluation(data.data ?? null))
      .catch(() => {});
  }, [latestPlan?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  const planStatus = latestPlan?.status;
  const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Bản nháp', color: 'default' },
    SUBMITTED: { label: 'Đã nộp', color: 'blue' },
    REVIEWING: { label: 'Đang chấm', color: 'orange' },
    APPROVED: { label: 'Đã duyệt', color: 'green' },
    REJECTED: { label: 'Từ chối', color: 'red' },
  };

  return (
    <div>
      {/* ── Top bar ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: 0, lineHeight: 1.5 }}>
          Tổng quan
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {batch && (
            <span style={{ fontSize: 12, color: '#888', background: '#f5f5f5', padding: '2px 10px', borderRadius: 4 }}>
              {batch.name}
              {batch.application_end && ` · Hạn: ${new Date(batch.application_end).toLocaleDateString('vi-VN')}`}
            </span>
          )}
          {team && (
            <span style={{ fontSize: 13, color: '#656d76' }}>{team.name}</span>
          )}
          {team && planStatus && statusMap[planStatus] && (
            <Tag
              color={statusMap[planStatus].color}
              style={{ margin: 0, fontSize: 12, borderRadius: 4, lineHeight: '20px' }}
            >
              {statusMap[planStatus].label}
            </Tag>
          )}
        </div>
      </div>

      {/* ── Metrics row ──────────────────────────────── */}
      <StatCards
        plan={latestPlan}
        evaluation={evaluation}
        aiStats={aiStats}
        team={team}
      />

      {/* ── Charts + Activity ────────────────────────── */}
      <DashboardCharts
        plan={latestPlan}
        team={team}
        evaluation={evaluation}
        notifications={notifications}
        aiStats={aiStats}
      />
    </div>
  );
}
