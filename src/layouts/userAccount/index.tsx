// src\layouts\userAccount\index.tsx
import { AppLayout } from '../app';
import ChangePasswordButton from './changePassword';
import {
  Col,
  ConfigProvider,
  Descriptions,
  DescriptionsProps,
  Image,
  Row,
  Tabs,
  TabsProps,
  theme,
  Typography,
  Spin, // Import Spin
  Alert, // Import Alert
} from 'antd';
import { Card, Loader } from '../../components'; // Import Loader component
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { USER_PROFILE_ITEMS } from '../../constants';
import { useStylesContext } from '../../context';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
const { Link } = Typography;
interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar: string;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
}
interface ResponseData {
    statusCode: number;
    message: string;
    data: {
        user: UserProfile;
    };
}
export const UserAccountLayout: React.FC = () => {
  const {
    token: { borderRadius },
  } = theme.useToken();
  const navigate = useNavigate();
  const stylesContext = useStylesContext();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState<string>(''); // No default tab
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // User profile state
  const onChange = (key: string) => {
    navigate(key);
  };
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const apiEndpoint = 'http://localhost:8080/api/v1/users/profile';
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const responseData: ResponseData = await response.json();
        setUserProfile(responseData.data.user);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        setUserProfile(null);
      }
    };
    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const k =
      TAB_ITEMS.find((d) => location.pathname.includes(d.key))?.key || '';
    setActiveKey(k);
  }, [location]);
  const DESCRIPTION_ITEMS: DescriptionsProps['items'] = [ // Moved DESCRIPTION_ITEMS here to use userProfile
    {
      key: 'full-name',
      label: 'Name',
      children: <Typography.Text>{userProfile?.name}</Typography.Text>, // Use optional chaining
    },
    {
      key: 'email',
      label: 'Email Address',
      children: (
        <Typography.Link href={`mailto:${userProfile?.email}`}> {/* Use optional chaining */}
          {userProfile?.email} 
        </Typography.Link>
      ),
    },
  ];
  const TAB_ITEMS: TabsProps['items'] = USER_PROFILE_ITEMS.map((u) => ({
    key: u.title,
    label: u.title,
  }));
  return (
    <AppLayout>
      <Card
        className="user-profile-card-nav card"
        actions={[
          <ConfigProvider
            theme={{
              components: {
                Tabs: {
                  colorBorderSecondary: 'none',
                },
              },
            }}
          >
            <Tabs
              defaultActiveKey={activeKey}
              activeTabKey={activeKey} // Corrected prop name
              items={TAB_ITEMS}
              onChange={onChange}
              style={{ textTransform: 'capitalize' }}
            />
          </ConfigProvider>,
          <ChangePasswordButton />,
        ]}
      >
        {loading ? (
          <Loader /> // Show Loader while loading
        ) : error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          /> // Show Alert if error
        ) : (
          <Row {...stylesContext?.rowProps}>
            <Col xs={24} sm={8} lg={4}>
              {/* Sử dụng optional chaining để tránh lỗi nếu userProfile hoặc avatar là null */}
              <Image
                src={userProfile?.avatar || "default-avatar.png"} // Thay 'default-avatar.png' bằng placeholder mặc định của bạn
                alt="user profile image"
                height="100%"
                width="100%"
                style={{ borderRadius }}
                fallback="/default-avatar.png"
                preview={false}
              />
            </Col>
            <Col xs={24} sm={16} lg={20}>
              <Descriptions
                title="Information" // Updated title
                items={DESCRIPTION_ITEMS}
                column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              />
            </Col>
          </Row>
        )}
      </Card>
      <div style={{ marginTop: '1.5rem' }}>
        <Outlet />
      </div>
      
    </AppLayout>
    
  );
};
export default UserAccountLayout;