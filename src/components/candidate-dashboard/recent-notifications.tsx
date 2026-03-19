'use client';

import { Card, List, Typography, Tag, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import type { Notification } from '@/types';

const { Text } = Typography;

interface RecentNotificationsProps {
  notifications: Notification[];
}

function timeAgo(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  const days = Math.floor(h / 24);
  return days === 1 ? 'Hôm qua' : `${days} ngày trước`;
}

export default function RecentNotifications({ notifications }: RecentNotificationsProps) {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BellOutlined />
          <Text strong style={{ fontSize: 14 }}>Thông báo gần đây</Text>
        </div>
      }
      style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      styles={{ body: { padding: notifications.length ? 0 : 16 } }}
    >
      {notifications.length === 0 ? (
        <Empty description="Chưa có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={notifications.slice(0, 6)}
          renderItem={(n) => (
            <List.Item
              style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5f5' }}
              extra={<Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{timeAgo(n.created_at)}</Text>}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 13 }}>{n.title}</Text>
                    {!n.is_read && <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>Mới</Tag>}
                  </div>
                }
                description={n.content && <Text type="secondary" style={{ fontSize: 12 }}>{n.content}</Text>}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
