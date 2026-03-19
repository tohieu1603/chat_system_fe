'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Tag } from 'antd';
import type { BusinessPlan, Evaluation, Team } from '@/types/talent-venture';
import type { Notification } from '@/types';

const PLAN_SECTIONS: { key: keyof BusinessPlan; label: string; group: string }[] = [
  { key: 'executive_summary', label: 'Tóm tắt', group: 'Tổng quan' },
  { key: 'problem_statement', label: 'Vấn đề', group: 'Tổng quan' },
  { key: 'solution', label: 'Giải pháp', group: 'Tổng quan' },
  { key: 'target_market', label: 'Thị trường', group: 'Thị trường' },
  { key: 'customer_persona', label: 'Khách hàng', group: 'Thị trường' },
  { key: 'competitive_analysis', label: 'Cạnh tranh', group: 'Thị trường' },
  { key: 'organic_marketing', label: 'Marketing', group: 'Marketing' },
  { key: 'paid_advertising', label: 'Quảng cáo', group: 'Marketing' },
  { key: 'operation_workflow', label: 'Vận hành', group: 'Vận hành' },
  { key: 'payment_system', label: 'Thanh toán', group: 'Vận hành' },
  { key: 'tech_requirements', label: 'Kỹ thuật', group: 'Vận hành' },
  { key: 'cost_structure', label: 'Chi phí', group: 'Tài chính' },
  { key: 'revenue_model', label: 'Doanh thu', group: 'Tài chính' },
  { key: 'milestones', label: 'Cột mốc', group: 'Tài chính' },
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

function timeAgo(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const days = Math.floor(h / 24);
  return days === 1 ? 'Hôm qua' : `${days} ngày trước`;
}

export interface DashboardChartsProps {
  plan: BusinessPlan | null;
  team: Team | null;
  evaluation?: Evaluation | null;
  notifications: Notification[];
  aiStats?: { totalConversations: number; totalMessages: number; messagesToday: number };
}

const box: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 6, padding: 20, background: '#fff' };
const h3Style: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 16px' };

function BarTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '6px 10px', fontSize: 12 }}>
      <strong>{label}</strong>: {payload[0].value} từ
    </div>
  );
}

export default function DashboardCharts({ plan, team, evaluation, notifications, aiStats }: DashboardChartsProps) {
  const radarData = [
    { subject: 'Workflow', score: evaluation?.workflow_score ?? 0 },
    { subject: 'Kinh doanh', score: evaluation?.business_score ?? 0 },
    { subject: 'Marketing', score: evaluation?.organic_score ?? 0 },
    { subject: 'Quảng cáo', score: evaluation?.ads_score ?? 0 },
  ];
  const hasEval = evaluation != null;

  const barData = PLAN_SECTIONS.map((s) => ({
    name: s.label,
    words: plan ? wordCount(plan[s.key]) : 0,
    filled: plan ? isFilled(plan[s.key]) : false,
  }));

  const activities: { text: string; time: string }[] = [];
  notifications.slice(0, 8).forEach((n) => activities.push({ text: n.title, time: timeAgo(n.created_at) }));
  if (plan?.updated_at) activities.push({ text: `Cập nhật kế hoạch "${plan.title}"`, time: timeAgo(plan.updated_at) });
  if (team?.created_at) activities.push({ text: `Tham gia đội "${team.name}"`, time: timeAgo(team.created_at) });

  const evalCriteria = hasEval ? [
    { label: 'Hệ thống Workflow', weight: '35%', score: evaluation!.workflow_score ?? 0 },
    { label: 'Mô hình kinh doanh', weight: '30%', score: evaluation!.business_score ?? 0 },
    { label: 'Marketing Organic', weight: '25%', score: evaluation!.organic_score ?? 0 },
    { label: 'Quảng cáo trả phí', weight: '10%', score: evaluation!.ads_score ?? 0 },
  ] : [];

  const totalWords = barData.reduce((s, d) => s + d.words, 0);
  const filledCount = barData.filter((d) => d.filled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Row 1: Radar + Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={box}>
          <h3 style={h3Style}>Điểm đánh giá theo tiêu chí</h3>
          {!hasEval ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13 }}>Chưa có đánh giá</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 8, right: 30, bottom: 8, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#666' }} />
                  <Radar dataKey="score" stroke="#5e6ad2" fill="rgba(94,106,210,0.15)" fillOpacity={1} strokeWidth={1.5} dot={{ r: 3, fill: '#5e6ad2', strokeWidth: 0 }} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
              {/* Score breakdown */}
              <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                {evalCriteria.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#888', width: 32, textAlign: 'right', flexShrink: 0 }}>{c.weight}</span>
                    <span style={{ fontSize: 13, color: '#333', flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#5e6ad2' }}>{c.score}</span>
                    <div style={{ width: 60, height: 4, background: '#f0f0f0', borderRadius: 2 }}>
                      <div style={{ width: `${c.score * 10}%`, height: '100%', background: '#5e6ad2', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Điểm tổng</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#5e6ad2' }}>{Number(evaluation!.weighted_total).toFixed(1)}/10</span>
                    {evaluation!.recommendation && (
                      <Tag color={evaluation!.recommendation === 'APPROVE' ? 'green' : evaluation!.recommendation === 'REJECT' ? 'red' : 'orange'} style={{ margin: 0, fontSize: 11, borderRadius: 4 }}>
                        {evaluation!.recommendation === 'APPROVE' ? 'Đạt' : evaluation!.recommendation === 'REJECT' ? 'Không đạt' : 'Cần sửa'}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={box}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...h3Style, margin: 0 }}>Nội dung kế hoạch</h3>
            {plan && <span style={{ fontSize: 12, color: '#888' }}>{filledCount}/14 phần · {totalWords.toLocaleString()} từ</span>}
          </div>
          {!plan ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13 }}>Chưa có kế hoạch</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value: number) => [`${value} từ`, 'Số từ']}
                  labelStyle={{ fontWeight: 600, color: '#111' }}
                />
                <Area type="monotone" dataKey="words" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.08} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Team info + AI Stats + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Team */}
        <div style={box}>
          <h3 style={h3Style}>Đội nhóm</h3>
          {!team ? (
            <span style={{ fontSize: 13, color: '#999' }}>Chưa có đội</span>
          ) : (
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 8 }}>{team.name}</div>
              {team.members?.map((m: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: i > 0 ? '1px solid #f5f5f5' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#666', flexShrink: 0 }}>
                    {(m.user?.full_name || '?')[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, color: '#111' }}>{m.user?.full_name || m.user_id}</span>
                  </div>
                  <Tag style={{ margin: 0, fontSize: 10, borderRadius: 3 }} color={m.role === 'LEADER' ? 'blue' : undefined}>
                    {m.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                  </Tag>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>Mã mời: <code style={{ background: '#f5f5f5', padding: '1px 6px', borderRadius: 3 }}>{team.invite_code}</code></div>
            </div>
          )}
        </div>

        {/* AI Stats */}
        <div style={box}>
          <h3 style={h3Style}>Trợ lý AI Kimi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Cuộc hội thoại</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{aiStats?.totalConversations ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Tổng tin nhắn</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{aiStats?.totalMessages ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Tin nhắn hôm nay</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{aiStats?.messagesToday ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Giới hạn/ngày</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>50</span>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', background: '#f9fafb', borderRadius: 4, fontSize: 12, color: '#888' }}>
            Kimi AI hỗ trợ phân tích thị trường, viết content, lập kế hoạch tài chính.
          </div>
        </div>

        {/* Activity */}
        <div style={box}>
          <h3 style={h3Style}>Hoạt động gần đây</h3>
          {activities.length === 0 ? (
            <span style={{ fontSize: 13, color: '#999' }}>Chưa có hoạt động</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activities.slice(0, 8).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '7px 0', borderBottom: i < activities.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d1d5db', flexShrink: 0, marginTop: 6, display: 'inline-block' }} />
                  <span style={{ fontSize: 13, color: '#333', flex: 1, lineHeight: 1.5 }}>{a.text}</span>
                  <span style={{ fontSize: 11, color: '#bbb', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
