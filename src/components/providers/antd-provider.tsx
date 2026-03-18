'use client';

import { App, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

const appTheme = {
  token: {
    colorPrimary: '#4F46E5',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    borderRadius: 10,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#F8FAFC',
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',
    controlHeight: 38,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
  },
  components: {
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      primaryShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
    },
    Menu: {
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 42,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#F8FAFC',
      headerColor: '#64748B',
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Progress: {
      circleTextFontSize: '0.85em',
    },
    Modal: {
      borderRadiusLG: 16,
    },
  },
  algorithm: theme.defaultAlgorithm,
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={appTheme} locale={viVN}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
