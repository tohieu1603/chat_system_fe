'use client';

import { useState } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');

  function handleSend() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
      <Input.TextArea
        value={value}
        placeholder={disabled ? 'AI đang trả lời...' : 'Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)'}
        autoSize={{ minRows: 1, maxRows: 5 }}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, borderRadius: 8, resize: 'none' }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        disabled={disabled}
        style={{ borderRadius: 8, height: 36 }}
      >
        Gửi
      </Button>
    </div>
  );
}
