'use client';

import { Layout, Row, Col, Typography, Button, Space } from 'antd';
import Link from 'next/link';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '0 24px' }}>
          <Col xs={24} sm={18} md={14} lg={10} style={{ textAlign: 'center' }}>
            <Title style={{ color: '#1890ff', marginBottom: 16 }}>
              AI Requirements Collector
            </Title>

            <Paragraph style={{ fontSize: 16, color: '#555', marginBottom: 40 }}>
              Nền tảng thu thập yêu cầu phần mềm thông minh, giúp bạn xây dựng sản phẩm
              đúng nhu cầu với sự hỗ trợ của AI.
            </Paragraph>

            <Space size="middle" wrap>
              <Link href="/login">
                <Button type="primary" size="large" style={{ minWidth: 140 }}>
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button size="large" style={{ minWidth: 140 }}>
                  Đăng ký
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
