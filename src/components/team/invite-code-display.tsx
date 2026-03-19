'use client';

import { Typography, Button, App, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

interface InviteCodeDisplayProps {
  code: string;
}

export default function InviteCodeDisplay({ code }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { message } = App.useApp();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      message.success('Đã sao chép mã mời!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      message.error('Không thể sao chép');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Text style={{ fontSize: 13, color: '#888', flexShrink: 0 }}>Mã mời:</Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '6px 14px', flex: 1 }}>
        <Text style={{ fontSize: 16, letterSpacing: 4, fontFamily: 'monospace', color: '#111', fontWeight: 600 }}>{code}</Text>
      </div>
      <Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép mã mời'}>
        <Button
          icon={copied ? <CheckOutlined style={{ color: '#10B981' }} /> : <CopyOutlined />}
          onClick={handleCopy}
          style={{ borderRadius: 4 }}
        />
      </Tooltip>
      <Text style={{ fontSize: 12, color: '#999' }}>Chia sẻ mã này cho bạn bè để tham gia đội</Text>
    </div>
  );
}
