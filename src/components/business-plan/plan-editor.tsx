'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Layout, Button, Space, Typography, App, Spin, Popconfirm, Tabs } from 'antd';
import { SaveOutlined, SendOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { usePlanStore } from '@/stores/plan-store';
import PlanNavigation, { PLAN_SECTIONS } from './plan-navigation';
import PlanSection from './plan-section';
import PlanStatusBadge from './plan-status-badge';
import SubmitConfirmation from './submit-confirmation';
import EvaluationResults from './evaluation-results';
import AskKimiDrawer from '../ai-kimi/ask-kimi-drawer';
import PlanViewer from '../admin-tv/plan-viewer';
import type { BusinessPlan } from '@/types/talent-venture';

const { Sider, Content } = Layout;
const { Text } = Typography;

const AUTO_SAVE_DELAY = 30_000; // 30 seconds

function timeSince(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'Vừa lưu';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  return `${Math.floor(m / 60)} giờ trước`;
}

interface PlanEditorProps {
  planId: string;
}

export default function PlanEditor({ planId }: PlanEditorProps) {
  const { currentPlan, fetchPlan, updateSection, saveDirtyFields, submitPlan, isSaving, isLoading, lastSavedAt, dirtyFields } = usePlanStore();
  const [activeSection, setActiveSection] = useState<keyof BusinessPlan>('executive_summary');
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [savedLabel, setSavedLabel] = useState('');
  const [kimiOpen, setKimiOpen] = useState(false);
  const [reportDoc, setReportDoc] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    fetchPlan(planId);
    // Fetch report if plan is approved
    apiClient.get('/projects', { params: { limit: 100 } }).then(({ data }) => {
      const raw = data?.data ?? data;
      const list = Array.isArray(raw) ? raw : raw?.items ?? [];
      const match = list.find((p: any) => p.collection_progress?.plan_id === planId && p.requirement_doc_url);
      if (match) setReportDoc(match.requirement_doc_url);
    }).catch(() => {});
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [planId]);

  // Update "X minutes ago" every 30s
  useEffect(() => {
    if (!lastSavedAt) return;
    const update = () => setSavedLabel(timeSince(lastSavedAt));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveDirtyFields();
    }, AUTO_SAVE_DELAY);
  }, [saveDirtyFields]);

  const handleChange = (field: keyof BusinessPlan, value: any) => {
    updateSection(field, value);
    scheduleAutoSave();
  };

  const handleManualSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await saveDirtyFields();
    message.success('Đã lưu thay đổi');
  };

  const handleSubmit = async () => {
    // Save trước khi nộp
    if (Object.keys(dirtyFields).length > 0) {
      await saveDirtyFields();
    }
    setSubmitLoading(true);
    try {
      await submitPlan(planId);
      message.success('Đã nộp kế hoạch thành công!');
      setShowSubmit(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Lỗi khi nộp kế hoạch';
      // Parse "Missing required sections: x, y, z" thành danh sách
      if (typeof msg === 'string' && msg.includes('Missing required sections')) {
        const sections = msg.replace('Missing required sections: ', '').split(', ');
        const labels = sections.map((s: string) => {
          const found = PLAN_SECTIONS.find(ps => ps.key === s);
          return found ? found.label : s;
        });
        message.error(`Còn ${labels.length} phần chưa điền: ${labels.join(', ')}`);
      } else {
        message.error(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/business-plans/${planId}`);
      message.success('Đã xóa kế hoạch');
      router.push('/ke-hoach');
    } catch { message.error('Lỗi xóa kế hoạch'); }
  };

  if (isLoading || !currentPlan) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;
  }

  const isLocked = currentPlan.status !== 'DRAFT';
  const currentSectionDef = PLAN_SECTIONS.find(s => s.key === activeSection);
  const hasDirty = Object.keys(dirtyFields).length > 0;

  // ── READ-ONLY VIEW (submitted/approved/rejected) ──
  if (isLocked) {
    const tabItems = [
      {
        key: 'plan',
        label: 'Nội dung kế hoạch',
        children: <PlanViewer plan={currentPlan} />,
      },
      ...(reportDoc ? [
        {
          key: 'report',
          label: 'Báo cáo AI',
          children: (
            <div className="kimi-md" style={{ lineHeight: 1.8, fontSize: 14 }}>
              <ReactMarkdown>{reportDoc}</ReactMarkdown>
            </div>
          ),
        },
        {
          key: 'markdown',
          label: 'Markdown',
          children: (
            <pre style={{ background: '#f8f9fa', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' as const }}>
              {reportDoc}
            </pre>
          ),
        },
      ] : []),
    ];

    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Text strong style={{ fontSize: 16 }}>{currentPlan.title}</Text>
            <PlanStatusBadge status={currentPlan.status} />
          </Space>
        </div>

        <div style={{ display: 'flex', gap: 0 }}>
          {/* Main content */}
          <div style={{ flex: 1, padding: '0 24px 24px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <Tabs defaultActiveKey="plan" items={tabItems} />
          </div>

          {/* Evaluation sidebar */}
          {(currentPlan.status === 'APPROVED' || currentPlan.status === 'REJECTED' || currentPlan.status === 'REVIEWING') && (
            <div style={{ width: 320, borderLeft: '1px solid #F0F0F0', padding: '20px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', flexShrink: 0 }}>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>Kết quả đánh giá</Text>
              <EvaluationResults planId={planId} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDITABLE VIEW (draft) ──
  return (
    <>
      <Layout style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', minHeight: 600 }}>
        {/* Sidebar navigation */}
        <Sider
          theme="light"
          width={220}
          style={{ background: '#FAFAFA', borderRight: '1px solid #F0F0F0' }}
        >
          <PlanNavigation
            plan={currentPlan}
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
        </Sider>

        {/* Main content area */}
        <Layout style={{ background: '#fff' }}>
          {/* Toolbar */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Text strong style={{ fontSize: 14 }}>{currentPlan.title}</Text>
              <PlanStatusBadge status={currentPlan.status} />
            </Space>
            <Space size={8}>
              {lastSavedAt && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {savedLabel}
                </Text>
              )}
              <Popconfirm title="Xóa kế hoạch này?" onConfirm={handleDelete}>
                <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
              </Popconfirm>
              <Button
                icon={<SaveOutlined />}
                size="small"
                onClick={handleManualSave}
                loading={isSaving}
                disabled={!hasDirty}
              >
                Lưu
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="small"
                onClick={() => setShowSubmit(true)}
              >
                Nộp kế hoạch
              </Button>
            </Space>
          </div>

          {/* Section editor */}
          <Content style={{ padding: '24px', overflowY: 'auto' }}>
            {currentSectionDef && (
              <PlanSection
                section={currentSectionDef}
                plan={currentPlan}
                onChange={handleChange}
                onAskAI={() => setKimiOpen(true)}
              />
            )}
          </Content>
        </Layout>
      </Layout>

      <AskKimiDrawer
        open={kimiOpen}
        onClose={() => setKimiOpen(false)}
        planId={planId}
        sectionName={currentSectionDef?.label ?? ''}
        currentContent={typeof currentPlan[activeSection] === 'string' ? (currentPlan[activeSection] as string) : ''}
      />

      <SubmitConfirmation
        plan={currentPlan}
        open={showSubmit}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmit(false)}
        isLoading={submitLoading}
      />
    </>
  );
}
