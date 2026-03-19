'use client';

import { Card, Typography, Button, App, Tooltip } from 'antd';
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('Không thể sao chép');
    }
  };

  return (
    <Card
      style={{ borderRadius: 10, background: '#F8FAFC', border: '1px dashed #CBD5E1' }}
      styles={{ body: { padding: '12px 16px' } }}
    >
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
        MÃ MỜI ĐỘI NHÓM
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          strong
          style={{ fontSize: 22, letterSpacing: 4, fontFamily: 'monospace', color: '#4F46E5' }}
        >
          {code}
        </Text>
        <Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép mã mời'}>
          <Button
            type="text"
            icon={copied ? <CheckOutlined style={{ color: '#059669' }} /> : <CopyOutlined />}
            onClick={handleCopy}
            size="small"
          />
        </Tooltip>
      </div>
      <Text type="secondary" style={{ fontSize: 11 }}>
        Chia sẻ mã này với người bạn muốn mời vào đội
      </Text>
    </Card>
  );
}
