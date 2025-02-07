import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Table } from 'antd';
import { PageHeader } from '../../components';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface ParticipationData {
  eventId: string;
  registeredCount: number;
  checkInCount: number;
  checkOutCount: number;
}

interface ParticipationStatsResponse {
  statusCode: number;
  message: string;
  data: ParticipationData;
}

const columns = [
  {
    title: 'Event ID',
    dataIndex: 'eventId',
    key: 'eventId',
  },
  {
    title: 'Registered Count',
    dataIndex: 'registeredCount',
    key: 'registeredCount',
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

export const ParticipationStats: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<ParticipationData | null>(null);

  useEffect(() => {
    const fetchParticipationStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error("⚠️ Access Token không tồn tại! Vui lòng đăng nhập lại.");
        }

        // 1️⃣ Lấy userId từ API profile
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

        // 2️⃣ Gọi API lấy dữ liệu Participation Stats theo userId
        const apiEndpoint = `http://localhost:8080/api/v1/reports/${userId}/participation-stats`;

        const statsResponse = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.message || `HTTP error! status: ${statsResponse.status}`);
        }

        const statsData: ParticipationStatsResponse = await statsResponse.json();
        setStatsData(statsData.data); // Lưu ý: API trả về mảng

      } catch (e: any) {
        console.error("🚨 Lỗi khi tải thống kê tham gia:", e);
        setError(e.message);
        setStatsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipationStats();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Participation Stats | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="Participation Statistics"
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
            title: 'Participation Stats',
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
        <Table
            dataSource={statsData ? [statsData] : []}
          columns={columns}
          pagination={false}
          rowKey="eventId"
          loading={loading} // ✅ Hiển thị Spinner khi đang tải dữ liệu
        />
      </Card>
    </div>
  );
};

export default ParticipationStats;
