'use client';

import { useEffect, useState } from 'react';
import { Button, Empty, Space, Typography, Spin, App, Card, Descriptions, Tag, List, Divider, Alert } from 'antd';
import { DownloadOutlined, ArrowLeftOutlined, FileMarkdownOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';

const { Title, Text } = Typography;

interface DocResponse {
  requirement_json?: Record<string, any> | null;
  requirement_doc_url?: string | null;
}

const SECTION_LABELS: Record<string, string> = {
  COMPANY_INFO: 'Thông tin công ty', DEPARTMENTS: 'Cơ cấu tổ chức', EMPLOYEES: 'Nhân sự & vị trí',
  WORKFLOWS: 'Quy trình làm việc', SALARY: 'Tính lương & chấm công', SCHEDULING: 'Lịch làm việc',
  FEATURES: 'Yêu cầu tính năng', SPECIAL_REQUIREMENTS: 'Yêu cầu đặc biệt', PRIORITIES: 'Ưu tiên & Timeline',
};

function formatLabel(key: string): string {
  const MAP: Record<string, string> = {
    company_name: 'Tên công ty', industry: 'Ngành nghề', company_size: 'Quy mô',
    business_model: 'Mô hình KD', current_systems: 'Hệ thống hiện tại', pain_points: 'Vấn đề cần giải quyết',
    departments: 'Phòng ban', name: 'Tên', head_count: 'Số người', manager: 'Quản lý',
    responsibilities: 'Trách nhiệm', workflow_name: 'Tên quy trình', description: 'Mô tả',
    steps: 'Các bước', salary_structure: 'Cấu trúc lương', components: 'Thành phần',
    feature_name: 'Tên tính năng', priority: 'Ưu tiên', user_stories: 'User Stories',
    requirement: 'Yêu cầu', category: 'Loại', details: 'Chi tiết', constraints: 'Ràng buộc',
    address: 'Địa chỉ', action: 'Hành động', responsible_department: 'Phòng ban phụ trách',
  };
  return MAP[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function renderValue(val: unknown): React.ReactNode {
  if (val === null || val === undefined) return <Text type="secondary">—</Text>;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Có' : 'Không';
  if (Array.isArray(val)) {
    if (val.length === 0) return <Text type="secondary">—</Text>;
    if (typeof val[0] === 'object') {
      return (
        <List size="small" dataSource={val} renderItem={(item: Record<string, any>, i) => (
          <List.Item key={i} style={{ padding: '8px 0' }}>
            <div>{Object.entries(item).map(([k, v]) => (
              <div key={k}><Text type="secondary" style={{ fontSize: 12 }}>{formatLabel(k)}: </Text><Text>{Array.isArray(v) ? v.join(', ') : String(v)}</Text></div>
            ))}</div>
          </List.Item>
        )} />
      );
    }
    return <ul style={{ margin: 0, paddingLeft: 20 }}>{val.map((item, i) => <li key={i}>{String(item)}</li>)}</ul>;
  }
  return String(val);
}

export default function DevDocumentPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { message } = App.useApp();
  const [doc, setDoc] = useState<DocResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ApiResponse<DocResponse>>(`/projects/${id}/document`)
      .then(({ data }) => setDoc(data.data ?? null))
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [id]);

  const reqJson = doc?.requirement_json;
  // Handle both { sections: {...} } and flat { KEY: {...} } structures
  const sectionsObj = reqJson?.sections ?? reqJson ?? {};
  const sections = Object.entries(sectionsObj).filter(([k]) =>
    !['project_name', 'project_code', 'generated_at', 'summary', 'overall_progress', 'is_complete', 'completed_at', 'categories'].includes(k)
  ) as [string, any][];
  const hasDoc = reqJson && sections.length > 0;

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} />
        <Title level={4} style={{ margin: 0 }}>Tài liệu yêu cầu</Title>
        <Tag color="blue" style={{ marginLeft: 'auto' }}>Chỉ xem</Tag>
      </div>

      {!hasDoc ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <Empty description="Chưa có tài liệu yêu cầu cho dự án này" />
        </div>
      ) : (
        <>
          <Card style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Dự án">{reqJson?.project_name}</Descriptions.Item>
              <Descriptions.Item label="Mã">{reqJson?.project_code}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{reqJson?.generated_at ? new Date(reqJson.generated_at).toLocaleDateString('vi-VN') : '—'}</Descriptions.Item>
              <Descriptions.Item label="Số mục">{sections.length} / 9</Descriptions.Item>
            </Descriptions>
          </Card>

          {reqJson?.summary && (
            <Alert type="info" showIcon style={{ marginBottom: 16 }} message="Tóm tắt" description={reqJson.summary} />
          )}

          <Space style={{ marginBottom: 16 }}>
            <Button icon={<FileMarkdownOutlined />} disabled={!doc?.requirement_doc_url}
              onClick={() => { const a = document.createElement('a'); a.href = doc!.requirement_doc_url!; a.download = `requirement-${id}.md`; a.click(); }}>
              Tải MD
            </Button>
            <Button icon={<DownloadOutlined />} disabled={!reqJson}
              onClick={() => {
                const blob = new Blob([JSON.stringify(reqJson, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob); const a = document.createElement('a');
                a.href = url; a.download = `requirement-${id}.json`; a.click(); URL.revokeObjectURL(url);
              }}>
              Tải JSON
            </Button>
          </Space>

          <Divider />

          {sections.map(([key, sectionData]) => {
            const data = sectionData?.data ?? sectionData ?? {};
            return (
              <Card key={key} title={<><CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} />{SECTION_LABELS[key] ?? key}</>}
                style={{ marginBottom: 16 }} size="small">
                <Descriptions column={1} size="small" bordered>
                  {Object.entries(data).map(([k, val]) => (
                    <Descriptions.Item key={k} label={formatLabel(k)}>{renderValue(val)}</Descriptions.Item>
                  ))}
                </Descriptions>
              </Card>
            );
          })}
        </>
      )}
    </AppLayout>
  );
}
