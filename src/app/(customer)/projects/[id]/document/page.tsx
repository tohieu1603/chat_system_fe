'use client';

import { useEffect, useState } from 'react';
import { Button, Empty, Space, Typography, Spin, App, Card, Descriptions, Tag, List, Divider, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined, ArrowLeftOutlined, FileMarkdownOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';

const { Title, Text, Paragraph } = Typography;

interface DocResponse {
  requirement_json?: Record<string, any> | null;
  requirement_doc_url?: string | null;
}

const SECTION_LABELS: Record<string, string> = {
  COMPANY_INFO: 'Thông tin công ty',
  DEPARTMENTS: 'Cơ cấu tổ chức',
  EMPLOYEES: 'Nhân sự & vị trí',
  WORKFLOWS: 'Quy trình làm việc',
  SALARY: 'Tính lương & chấm công',
  SCHEDULING: 'Lịch làm việc',
  FEATURES: 'Yêu cầu tính năng',
  SPECIAL_REQUIREMENTS: 'Yêu cầu đặc biệt',
  PRIORITIES: 'Ưu tiên & Timeline',
};

function renderValue(val: unknown): React.ReactNode {
  if (val === null || val === undefined) return <Text type="secondary">—</Text>;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Có' : 'Không';
  if (Array.isArray(val)) {
    if (val.length === 0) return <Text type="secondary">—</Text>;
    // Array of objects (departments, components, steps, etc.)
    if (typeof val[0] === 'object') {
      return (
        <List
          size="small"
          dataSource={val}
          renderItem={(item: Record<string, any>, i) => (
            <List.Item key={i} style={{ padding: '8px 0' }}>
              <div>
                {Object.entries(item).map(([k, v]) => (
                  <div key={k}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatLabel(k)}: </Text>
                    <Text>{Array.isArray(v) ? v.join(', ') : String(v)}</Text>
                  </div>
                ))}
              </div>
            </List.Item>
          )}
        />
      );
    }
    // Array of strings
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {val.map((item, i) => <li key={i}>{String(item)}</li>)}
      </ul>
    );
  }
  return String(val);
}

function formatLabel(key: string): string {
  const MAP: Record<string, string> = {
    company_name: 'Tên công ty', industry: 'Ngành nghề', company_size: 'Quy mô',
    business_model: 'Mô hình KD', current_systems: 'Hệ thống hiện tại', pain_points: 'Vấn đề cần giải quyết',
    departments: 'Phòng ban', name: 'Tên', head_count: 'Số người', manager: 'Quản lý',
    responsibilities: 'Trách nhiệm', workflow_name: 'Tên quy trình', description: 'Mô tả',
    steps: 'Các bước', salary_structure: 'Cấu trúc lương', components: 'Thành phần',
    pay_cycle: 'Chu kỳ trả lương', special_rules: 'Quy định đặc biệt',
    shift_types: 'Loại ca', work_schedule: 'Lịch làm việc', deadline_management: 'Quản lý deadline',
    calendar_requirements: 'Yêu cầu lịch', feature_name: 'Tên tính năng', priority: 'Ưu tiên',
    user_stories: 'User Stories', acceptance_criteria: 'Tiêu chí chấp nhận',
    requirement: 'Yêu cầu', category: 'Loại', details: 'Chi tiết', constraints: 'Ràng buộc',
    address: 'Địa chỉ', calculation_method: 'Cách tính', conditions: 'Điều kiện',
    step_order: 'Thứ tự', action: 'Hành động', responsible_department: 'Phòng ban phụ trách',
    tools_used: 'Công cụ sử dụng',
  };
  return MAP[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function SectionCard({ sectionKey, data }: { sectionKey: string; data: Record<string, any> }) {
  const label = SECTION_LABELS[sectionKey] ?? sectionKey;
  const sectionData = data?.data ?? data ?? {};

  return (
    <Card
      title={<><CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} />{label}</>}
      style={{ marginBottom: 16 }}
      size="small"
    >
      <Descriptions column={1} size="small" bordered>
        {Object.entries(sectionData).map(([key, val]) => (
          <Descriptions.Item key={key} label={formatLabel(key)}>
            {renderValue(val)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  );
}

function DocumentInner() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { message } = App.useApp();

  const [doc, setDoc] = useState<DocResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  async function loadDocument() {
    setLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse<DocResponse>>(`/projects/${projectId}/document`);
      setDoc(data.data ?? null);
    } catch {
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDocument(); }, [projectId]);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const { data } = await apiClient.post<ApiResponse<DocResponse>>(`/projects/${projectId}/regenerate-document`);
      setDoc(data.data ?? null);
      message.success('Tài liệu đã được tạo lại!');
    } catch {
      message.error('Không thể tạo lại tài liệu');
    } finally {
      setRegenerating(false);
    }
  }

  function handleDownloadJson() {
    if (!doc?.requirement_json) return;
    const blob = new Blob([JSON.stringify(doc.requirement_json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `requirement-${projectId}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadMd() {
    if (!doc?.requirement_doc_url) return;
    const a = document.createElement('a');
    a.href = doc.requirement_doc_url; a.download = `requirement-${projectId}.md`; a.click();
  }

  const reqJson = doc?.requirement_json;
  const sections = reqJson?.sections ? Object.entries(reqJson.sections) as [string, any][] : [];
  const hasDoc = reqJson && sections.length > 0;

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/projects/${projectId}`)} />
        <Title level={4} style={{ margin: 0 }}>Tài liệu yêu cầu</Title>
      </div>

      {!hasDoc ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <Empty description="Chưa có tài liệu yêu cầu" imageStyle={{ height: 80 }}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRegenerate} loading={regenerating}>
              Tạo tài liệu
            </Button>
          </Empty>
        </div>
      ) : (
        <>
          {/* Header info */}
          <Card style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Dự án">{reqJson?.project_name}</Descriptions.Item>
              <Descriptions.Item label="Mã">{reqJson?.project_code}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{reqJson?.generated_at ? new Date(reqJson.generated_at).toLocaleDateString('vi-VN') : '—'}</Descriptions.Item>
              <Descriptions.Item label="Số mục">{sections.length} / 9</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Summary */}
          {reqJson?.summary && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="Tóm tắt"
              description={reqJson.summary}
            />
          )}

          {/* Actions */}
          <Space style={{ marginBottom: 16 }}>
            <Button icon={<FileMarkdownOutlined />} onClick={handleDownloadMd} disabled={!doc?.requirement_doc_url}>
              Tải MD
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadJson}>
              Tải JSON
            </Button>
            <Button icon={<ReloadOutlined />} loading={regenerating} onClick={handleRegenerate}>
              Tạo lại tài liệu
            </Button>
          </Space>

          <Divider />

          {/* Sections */}
          {sections.map(([key, sectionData]) => (
            <SectionCard key={key} sectionKey={key} data={sectionData} />
          ))}
        </>
      )}
    </>
  );
}

export default function DocumentPage() {
  return <AppLayout><DocumentInner /></AppLayout>;
}
