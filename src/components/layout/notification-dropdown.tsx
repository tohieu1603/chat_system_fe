'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Badge, Dropdown, Button, List, Typography, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import apiClient from '@/lib/api-client';
import type { Notification } from '@/types';

const { Text } = Typography;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const load = useCallback(() => {
    apiClient.get('/notifications?limit=10').then((r) => {
      const d = r.data?.data ?? r.data;
      setNotifications(Array.isArray(d) ? d : d?.notifications ?? []);
    }).catch(() => {});
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // WebSocket realtime with auto-reconnect
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const connect = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token || stopped) return;

      ws = new WebSocket(`${WS_URL}/notifications?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'notification' && msg.data) {
            setNotifications((prev) => [msg.data, ...prev].slice(0, 20));
          }
        } catch {}
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!stopped) reconnectTimer = setTimeout(connect, 5000);
      };

      ws.onerror = () => ws?.close();
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      ws?.close();
      wsRef.current = null;
    };
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const handleRead = async (n: Notification) => {
    if (n.is_read) return;
    try {
      await apiClient.put(`/notifications/${n.id}/read`);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
    } catch {}
  };

  const handleReadAll = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
    } catch {}
  };

  const dropdownContent = (
    <div style={{ width: 360, background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Thông báo</Text>
        {unread > 0 && (
          <Button type="link" size="small" onClick={handleReadAll} style={{ padding: 0 }}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      {notifications.length === 0
        ? <div style={{ padding: 24 }}><Empty description="Không có thông báo" /></div>
        : (
          <List
            dataSource={notifications}
            style={{ maxHeight: 380, overflowY: 'auto' }}
            renderItem={(n) => (
              <List.Item
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: n.is_read ? '#fff' : '#f0f7ff',
                  borderBottom: '1px solid #f5f5f5',
                }}
                onClick={() => handleRead(n)}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: 13 }}>{n.title}</Text>
                    {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1890ff', display: 'inline-block', marginTop: 4 }} />}
                  </div>
                  {n.content && <Text type="secondary" style={{ fontSize: 12 }}>{n.content}</Text>}
                  <div><Text type="secondary" style={{ fontSize: 11 }}>{new Date(n.created_at).toLocaleString('vi-VN')}</Text></div>
                </div>
              </List.Item>
            )}
          />
        )
      }
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={(v) => { setOpen(v); if (v) load(); }}
      popupRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unread} size="small">
        <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
      </Badge>
    </Dropdown>
  );
}
