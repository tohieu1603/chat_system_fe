'use client';

import { App, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

const appTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
