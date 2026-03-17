'use client';

import { useEffect, useState } from 'react';
import { Collapse, Button, Space, Typography, Spin, Card, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import apiClient from '@/lib/api-client';

const { Title, Paragraph, Text } = Typography;

interface RequirementDoc {
  requirement_json?: Record<string, any>;
  project_name?: string;
}

function renderValue(val: any): React.ReactNode {
  if (val === null || val === undefined) return <Text type="secondary">—</Text>;
  if (typeof val === 'object' && !Array.isArray(val)) {
    return (
      <div style={{ paddingLeft: 16 }}>
        {Object.entries(val).map(([k, v]) => (
          <div key={k}><Text strong>{k}:</Text> {renderValue(v)}</div>
        ))}
      </div>
    );
  }
  if (Array.isArray(val)) return <Paragraph>{val.map(String).join(', ')}</Paragraph>;
  return <Text>{String(val)}</Text>;
}

export default function AdminProjectReviewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [doc, setDoc] = useState<RequirementDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get(`/projects/${id}/document`).then((r) => {
      setDoc(r.data?.data ?? r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (status: 'APPROVED' | 'COLLECTING') => {
    setSaving(true);
    try {
      await apiClient.put(`/projects/${id}/status`, { status });
      message.success(status === 'APPROVED' ? 'Đã phê duyệt dự án' : 'Đã yêu cầu bổ sung thông tin');
      router.push(`/admin/projects/${id}`);
    } catch {
      message.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div></AppLayout>;

  const json = doc?.requirement_json ?? {};
  const panels = Object.entries(json).map(([key, val]) => ({
    key,
    label: <Text strong>{key.replace(/_/g, ' ').toUpperCase()}</Text>,
    children: renderValue(val),
  }));

  return (
    <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/admin/projects/${id}`)} />
          <Title level={4} style={{ margin: 0 }}>Xem xét tài liệu yêu cầu</Title>
        </div>

        <Card style={{ marginBottom: 24 }}>
          {panels.length > 0
            ? <Collapse items={panels} defaultActiveKey={panels.map((p) => p.key)} />
            : <Text type="secondary">Chưa có tài liệu yêu cầu</Text>
          }
        </Card>

        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={saving}
            onClick={() => handleAction('APPROVED')}
          >
            Phê duyệt
          </Button>
          <Button
            icon={<EditOutlined />}
            loading={saving}
            onClick={() => handleAction('COLLECTING')}
          >
            Yêu cầu bổ sung
          </Button>
        </Space>
    </AppLayout>
  );
}
