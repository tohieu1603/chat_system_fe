'use client';

import { use } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PlanEditor from '@/components/business-plan/plan-editor';

interface PlanEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function PlanEditorPage({ params }: PlanEditorPageProps) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push('/ke-hoach')}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Danh sách kế hoạch
      </Button>

      <PlanEditor planId={id} />
    </div>
  );
}
