// src\pages\UserProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Avatar, Spin, Alert, Descriptions } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader } from '../../components';
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
export const UserProfilePage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = localStorage.getItem('accessToken'); // Retrieve token from localStorage
                const apiEndpoint = 'http://localhost:8080/api/v1/users/profile';
                const response = await fetch(apiEndpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`, // Include bearer token
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const responseData: ResponseData = await response.json();
                setUserProfile(responseData.data.user);
                console.log(responseData.data.user);
                setLoading(false);
            } catch (e: any) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('An unknown error occurred');
                }
                setLoading(false);
                setUserProfile(null);
            }
        };
        fetchUserProfile();
    }, []);
    if (loading) {
        return <Card><Spin tip="Loading User Profile..." /></Card>;
    }
    if (error) {
        return (
            <Card>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                />
            </Card>
        );
    }
    return (
        <div>
            <PageHeader
                title="User Profile"
                breadcrumbs={[
                    {
                        title: (
                            <>
                                <HomeOutlined />
                                <span>Home</span>
                            </>
                        ),
                        path: '/',
                    },
                    {
                        title: (
                            <>
                                <UserOutlined />
                                <span>User</span>
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
                        title: 'Profile',
                    },
                ]}
            />
            <Card title="User Profile Information">
                {userProfile && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="ID">{userProfile.id}</Descriptions.Item>
                        <Descriptions.Item label="Tên">{userProfile.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>
                        <Descriptions.Item label="Ảnh đại diện">
                            <Avatar src={userProfile.avatar} size={64} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Đăng nhập gần nhất">
                          {userProfile.lastLoginAt}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo tài khoản">
                          {userProfile.createdAt}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật gần nhất">
                          {userProfile.updatedAt}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Card>
        </div>
    );
};
export default UserProfilePage;
