'use client';

import { Layout, Row, Col, Card } from 'antd';
import { Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content>
          <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '24px 0' }}>
            <Col xs={22} sm={18} md={12} lg={8} xl={6} style={{ maxWidth: 400 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                  AI Requirements Collector
                </Title>
              </div>
              <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {children}
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
  );
}
