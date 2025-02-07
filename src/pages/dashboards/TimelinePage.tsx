import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Table } from 'antd';
import { PageHeader } from '../../components';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface TimelineData {
  timeSlot: string;
  checkInCount: number;
  checkOutCount: number;
}

interface ReportTimelineResponse {
  statusCode: number;
  message: string;
  data: {
    timeline: TimelineData[];
  };
}

const columns = [
  {
    title: 'Time Slot',
    dataIndex: 'timeSlot',
    key: 'timeSlot',
  },
  {
    title: 'Check-in Count',
    dataIndex: 'checkInCount',
    key: 'checkInCount',
  },
  {
    title: 'Check-out Count',
    dataIndex: 'checkOutCount',
    key: 'checkOutCount',
  },
];

export const TimelinePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);

  useEffect(() => {
    const fetchUserIdAndTimeline = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error("⚠️ Access Token không tồn tại! Vui lòng đăng nhập lại.");
        }

        // 1️⃣ Lấy thông tin người dùng từ API
        const userProfileResponse = await fetch('http://localhost:8080/api/v1/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userProfileResponse.ok) {
          throw new Error("❌ Không thể lấy thông tin người dùng.");
        }

        const userProfileData = await userProfileResponse.json();
        const userId = userProfileData.data.user.id;

        // 2️⃣ Gọi API lấy dữ liệu báo cáo theo userId
        const apiEndpoint = `http://localhost:8080/api/v1/reports/${userId}/timeline`;

        const timelineResponse = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!timelineResponse.ok) {
          const errorData = await timelineResponse.json();
          throw new Error(errorData.message || `HTTP error! status: ${timelineResponse.status}`);
        }

        const reportData: ReportTimelineResponse = await timelineResponse.json();

        setTimelineData(reportData.data.timeline);
      } catch (e: any) {
        console.error("🚨 Error fetching timeline report:", e);
        setError(e.message);
        setTimelineData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserIdAndTimeline();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Timeline Report | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="Timeline Report Dashboard"
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
                <span>Dashboards</span>
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
            title: 'Timeline Report',
          },
        ]}
      />
      <Card>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {loading ? (
          <Spin tip="Loading timeline report..." />
        ) : (
          <Table dataSource={timelineData} columns={columns} pagination={false} rowKey="timeSlot" />
        )}
      </Card>
    </div>
  );
};
