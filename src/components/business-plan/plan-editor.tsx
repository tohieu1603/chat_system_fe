'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Layout, Button, Space, Typography, App, Spin, Alert } from 'antd';
import { SaveOutlined, SendOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { usePlanStore } from '@/stores/plan-store';
import PlanNavigation, { PLAN_SECTIONS } from './plan-navigation';
import PlanSection from './plan-section';
import PlanStatusBadge from './plan-status-badge';
import SubmitConfirmation from './submit-confirmation';
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
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { message } = App.useApp();

  useEffect(() => {
    fetchPlan(planId);
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

  if (isLoading || !currentPlan) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;
  }

  const isLocked = currentPlan.status !== 'DRAFT';
  const currentSectionDef = PLAN_SECTIONS.find(s => s.key === activeSection);
  const hasDirty = Object.keys(dirtyFields).length > 0;

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
              {!isLocked && (
                <>
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
                </>
              )}
            </Space>
          </div>

          {/* Section editor */}
          <Content style={{ padding: '24px', overflowY: 'auto' }}>
            {isLocked && currentPlan.status !== 'DRAFT' && (
              <Alert
                type="info"
                message="Kế hoạch đã được nộp và không thể chỉnh sửa."
                style={{ marginBottom: 16, borderRadius: 8 }}
                showIcon
              />
            )}

            {currentSectionDef && (
              <PlanSection
                section={currentSectionDef}
                plan={currentPlan}
                onChange={handleChange}
                disabled={isLocked}
              />
            )}
          </Content>
        </Layout>
      </Layout>

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
