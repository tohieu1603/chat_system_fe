import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdProvider } from '@/components/providers/antd-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Requirements Collector',
  description: 'Thu thập yêu cầu khách hàng bằng AI',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <AntdProvider>{children}</AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
