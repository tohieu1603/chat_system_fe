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
  CalendarOutlined,
  SolutionOutlined,
  UserAddOutlined,
  InfoCircleOutlined,
  RobotOutlined,
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
  ADMIN: [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/customers', icon: <TeamOutlined />, label: 'Khách hàng' },
    { key: '/admin/projects', icon: <ProjectOutlined />, label: 'Dự án' },
    { key: '/admin/tasks', icon: <CheckSquareOutlined />, label: 'Tất cả Tasks' },
    { key: '/admin/team', icon: <UserOutlined />, label: 'Team' },
    { key: '/finance/invoices', icon: <FileTextOutlined />, label: 'Hóa đơn' },
    { key: '/finance/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    { type: 'divider' },
    { key: '/admin/dot-tuyen', icon: <CalendarOutlined />, label: 'Đợt tuyển' },
    { key: '/admin/ke-hoach', icon: <SolutionOutlined />, label: 'Kế hoạch KD' },
    { key: '/admin/ung-vien', icon: <UserAddOutlined />, label: 'Ứng viên' },
  ],
  DEV: [
    { key: '/dev', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/dev/tasks', icon: <CheckSquareOutlined />, label: 'Tasks' },
  ],
  CANDIDATE: [
    { key: '/tong-quan', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/gioi-thieu', icon: <InfoCircleOutlined />, label: 'Giới thiệu' },
    { key: '/doi-nhom', icon: <TeamOutlined />, label: 'Đội nhóm' },
    { key: '/ho-so', icon: <UserOutlined />, label: 'Hồ sơ' },
    { key: '/ke-hoach', icon: <FileTextOutlined />, label: 'Kế hoạch' },
    { key: '/tro-ly-ai', icon: <RobotOutlined />, label: 'Trợ lý AI' },
  ],
};

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuthStore();

  const menuItems = (user?.role ? MENU_BY_ROLE[user.role] : MENU_BY_ROLE.CANDIDATE) ?? [];

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
          width={220}
          style={{ background: '#fff', borderRight: '1px solid #E2E8F0' }}
        >
          <div style={{ padding: '20px 16px', textAlign: 'center' }}>
            <Text strong style={{ color: '#4F46E5', fontSize: 15, letterSpacing: '-0.02em' }}>
              Flow Corp
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
              borderBottom: '1px solid #E2E8F0',
              height: 56,
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

          <Content style={{ margin: 24, minHeight: 280, background: '#F8FAFC' }}>{children}</Content>
        </Layout>
    </Layout>
  );
}
