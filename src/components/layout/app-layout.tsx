'use client';

import { Layout, Menu, Dropdown, Avatar, Space, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  DownOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import NotificationDropdown from '@/components/layout/notification-dropdown';
import type { MenuProps } from 'antd';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const MENU_BY_ROLE: Record<string, MenuProps['items']> = {
  CUSTOMER: [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/projects', icon: <ProjectOutlined />, label: 'Dự án' },
    { key: '/profile', icon: <UserOutlined />, label: 'Hồ sơ' },
  ],
  ADMIN: [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/customers', icon: <TeamOutlined />, label: 'Khách hàng' },
    { key: '/admin/projects', icon: <ProjectOutlined />, label: 'Dự án' },
    { key: '/admin/team', icon: <UserOutlined />, label: 'Team' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
  ],
  DEV: [
    { key: '/dev', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/dev/tasks', icon: <CheckSquareOutlined />, label: 'Tasks' },
  ],
  FINANCE: [
    { key: '/finance', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/finance/projects', icon: <ProjectOutlined />, label: 'Dự án' },
    { key: '/finance/invoices', icon: <FileTextOutlined />, label: 'Hóa đơn' },
    { key: '/finance/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
  ],
};

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuthStore();

  const menuItems = (user?.role ? MENU_BY_ROLE[user.role] : MENU_BY_ROLE.CUSTOMER) ?? [];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <Sider
          theme="light"
          breakpoint="lg"
          collapsedWidth="0"
          style={{ boxShadow: '2px 0 6px rgba(0,21,41,0.05)' }}
        >
          <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
              AI Req Collector
            </Text>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            style={{ border: 'none' }}
          />
        </Sider>

        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            }}
          >
            <Space size={8}>
              <NotificationDropdown />
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <Button type="text">
                  <Space>
                    <Avatar
                      size="small"
                      src={user?.avatar_url}
                      icon={!user?.avatar_url ? <UserOutlined /> : undefined}
                    />
                    <Text>{user?.full_name ?? user?.email}</Text>
                    <DownOutlined style={{ fontSize: 10 }} />
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </Header>

          <Content style={{ margin: 24, minHeight: 280 }}>{children}</Content>
        </Layout>
    </Layout>
  );
}
