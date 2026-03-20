'use client';

import { useRouter } from 'next/navigation';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { BusinessPlan, Evaluation, Team } from '@/types/talent-venture';

const PLAN_KEYS: (keyof BusinessPlan)[] = [
  'executive_summary', 'problem_statement', 'solution', 'target_market',
  'customer_persona', 'competitive_analysis', 'organic_marketing', 'paid_advertising',
  'operation_workflow', 'payment_system', 'tech_requirements', 'cost_structure',
  'revenue_model', 'milestones',
];

function isFilled(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function wordCount(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'string') return v.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(v)) return v.length * 10;
  return 0;
}

interface StatCardsProps {
  plan: BusinessPlan | null;
  evaluation: Evaluation | null;
  aiStats: { totalConversations: number; totalMessages: number; messagesToday: number };
  team: Team | null;
}

export default function StatCards({ plan, evaluation, aiStats, team }: StatCardsProps) {
  const router = useRouter();
  const filled = plan ? PLAN_KEYS.filter((k) => isFilled(plan[k])).length : 0;
  const percent = plan ? Math.round((filled / 14) * 100) : 0;
  const evalScore = evaluation?.weighted_total != null ? Number(evaluation.weighted_total).toFixed(1) : null;

  // Sparkline data: word count per section (for plan progress card)
  const planSparkline = PLAN_KEYS.map((k, i) => ({ x: i, v: plan ? wordCount(plan[k]) : 0 }));

  // Sparkline data: eval scores
  const evalSparkline = [
    { x: 0, v: evaluation?.workflow_score ?? 0 },
    { x: 1, v: evaluation?.business_score ?? 0 },
    { x: 2, v: evaluation?.organic_score ?? 0 },
    { x: 3, v: evaluation?.ads_score ?? 0 },
  ];

  // Team sparkline (fake growth)
  const memberCount = team?.members?.length ?? 0;
  const teamSparkline = Array.from({ length: 6 }, (_, i) => ({ x: i, v: Math.min(i + 1, memberCount) }));

  // AI sparkline
  const aiTotal = aiStats.totalMessages;
  const aiSparkline = Array.from({ length: 7 }, (_, i) => ({ x: i, v: Math.round((aiTotal / 7) * (i + 1) * (0.6 + Math.random() * 0.8)) }));

  const cards: {
    label: string;
    value: string;
    desc: string;
    descIcon: string;
    color: string;
    sparkline: { x: number; v: number }[];
    href: string;
  }[] = [
    {
      label: 'Tiến độ kế hoạch',
      value: plan ? `${percent}%` : '—',
      desc: plan ? `${filled} of 14 phần đã hoàn thành` : 'Chưa tạo kế hoạch',
      descIcon: percent === 100 ? '✅' : '📝',
      color: '#10b981',
      sparkline: planSparkline,
      href: '/ke-hoach',
    },
    {
      label: 'Điểm đánh giá',
      value: evalScore ? `${evalScore}/10` : '—',
      desc: evaluation?.recommendation === 'APPROVE' ? 'Đạt yêu cầu' : evaluation?.recommendation === 'REJECT' ? 'Chưa đạt' : 'Đang chờ đánh giá',
      descIcon: evaluation?.recommendation === 'APPROVE' ? '🎯' : '⏳',
      color: '#3b82f6',
      sparkline: evalSparkline,
      href: plan?.id ? `/ke-hoach/${plan.id}` : '/ke-hoach',
    },
    {
      label: 'Thành viên',
      value: team ? `${memberCount}/${team.max_members}` : '—',
      desc: team ? team.name : 'Chưa tham gia đội',
      descIcon: team ? '👥' : '➕',
      color: '#f59e0b',
      sparkline: teamSparkline,
      href: '/doi-nhom',
    },
    {
      label: 'Tin nhắn AI',
      value: aiTotal > 0 ? `${aiTotal}` : '—',
      desc: aiTotal > 0 ? `${aiStats.totalConversations} cuộc, ${aiStats.messagesToday} hôm nay` : 'Chưa sử dụng Kimi AI',
      descIcon: aiTotal > 0 ? '💬' : '🤖',
      color: '#22c55e',
      sparkline: aiSparkline,
      href: '/tro-ly-ai',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
      {cards.map((c) => (
        <div
          key={c.label}
          onClick={() => router.push(c.href)}
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px 0 rgb(0 0 0 / 0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'; }}
        >
          {/* Text content */}
          <div style={{ padding: '20px 24px 12px' }}>
            <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
              {c.value}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
              {c.desc} {c.descIcon}
            </div>
          </div>

          {/* Sparkline chart — Filament style */}
          <div style={{ height: 48, marginTop: -4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={c.sparkline} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={c.color}
                  strokeWidth={1.5}
                  fill={c.color}
                  fillOpacity={0.06}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
