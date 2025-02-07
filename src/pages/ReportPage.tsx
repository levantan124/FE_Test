// src\pages\ReportPage.tsx
import React from 'react';
import { Card, Typography } from 'antd';
import { PageHeader } from '../components';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;

export const ReportPage: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Report | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="Report Dashboard"
        breadcrumbs={[
          {
            title: (
              <>
                <HomeOutlined />
                <span>home</span>
              </>
            ),
            path: '/',
          },
          {
            title: (
              <>
                <PieChartOutlined />
                <span>dashboards</span>
              </>
            ),
            menu: {
              items: DASHBOARD_ITEMS.map((d) => ({
                key: d.title,
                title: <Link to={d.path}>{d.title}</Link>,
              })),
            },
          },
          {
            title: 'report',
          },
        ]}
      />
      <Card>
        <Title level={3}>
          Welcome to Report Page
        </Title>
        <Typography.Paragraph>
          This is a blank report page. You can add your report content here.
        </Typography.Paragraph>
      </Card>
    </div>
  );
};
