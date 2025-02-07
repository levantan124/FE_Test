import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Spin,
  Alert,
  Upload,
  message,
} from 'antd';
import { Card } from '../../components';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
type FieldType = {
  name?: string;
  email?: string;
  id?: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
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
export const UserProfileDetailsPage: React.FC = () => {
  const [form] = Form.useForm<FieldType>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Lưu ảnh mới
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
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const responseData: ResponseData = await response.json();
        setUserProfile(responseData.data.user);
        form.setFieldsValue({
          id: responseData.data.user.id,
          name: responseData.data.user.name,
          email: responseData.data.user.email,
          avatar: responseData.data.user.avatar,
          lastLoginAt: dayjs(responseData.data.user.lastLoginAt).format('DD/MM/YYYY HH:mm:ss'),
          createdAt: dayjs(responseData.data.user.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: dayjs(responseData.data.user.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        });
      } catch (e: any) {
        setError(e.message);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [form]);
  // // Hàm upload ảnh lên server
  // const uploadAvatar = async (file: File) => {
  //   const formData = new FormData();
  //   formData.append('avatar', file);
  //   try {
  //     const response = await fetch('http://localhost:8080/api/v1/users/profile', {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.message || 'Upload failed');
  //     return data.imageUrl; // Trả về URL ảnh đã upload
  //   } catch (error: any) {
  //     message.error(error.message);
  //     return null;
  //   }
  // };
  const onFinish = async (values: FieldType) => {
    setLoading(true);
    try {
      let newAvatarUrl = userProfile?.avatar || ""; // Avatar hiện tại
      let isAvatarChanged = false;
  
      // Nếu có ảnh mới, upload lên API `/users/upload/avatar`
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
  
        const uploadResponse = await fetch("http://localhost:8080/api/v1/users/upload/avatar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData, // Gửi ảnh lên server
        });
  
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Upload ảnh thất bại!");
        }
  
        newAvatarUrl = uploadData.imageUrl; // Nhận URL ảnh từ server
        isAvatarChanged = true;
      }
  
      // Kiểm tra có thay đổi thông tin không
      const isNameChanged = values.name !== userProfile?.name;
  
      if (!isNameChanged && !isAvatarChanged) {
        message.info("Không có thay đổi nào để cập nhật.");
        setLoading(false);
        return;
      }
  
      // Chuẩn bị dữ liệu gửi lên server
      const requestBody: { name?: string } = {};
      if (isNameChanged) requestBody.name = values.name;
  
      // Gửi request PATCH để cập nhật profile
      const response = await fetch("http://localhost:8080/api/v1/users/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật thất bại");
      }
  
      message.success("Cập nhật profile thành công!");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý khi chọn ảnh
  const handleAvatarChange = ({ file }: { file: File }) => {
    setAvatarFile(file);
    form.setFieldsValue({ avatar: URL.createObjectURL(file) });
  };
  return (
    <Card title="Account Details">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Form
        name="user-profile-details-form"
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="on"
        requiredMark={false}
      >
        <Row gutter={[16, 0]}>
          <Col sm={24} lg={24}>
            <Form.Item<FieldType> label="User ID" name="id">
              <Input readOnly />
            </Form.Item>
          </Col>
          <Col sm={24} lg={12}>
            <Form.Item<FieldType>
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col sm={24} lg={12}>
            <Form.Item<FieldType>
              label="Email"
              name="email"
              rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
            >
              <Input readOnly />
            </Form.Item>
          </Col>
          <Col sm={24} lg={12}>
            <Form.Item<FieldType> label="Avatar" name="avatar">
              <Upload showUploadList={false} beforeUpload={() => false} onChange={handleAvatarChange}>
                <Button icon={<UploadOutlined />}>Choose Image</Button>
              </Upload>
              {form.getFieldValue('avatar') && (
                <img
                  src={form.getFieldValue('avatar')}
                  alt="Avatar"
                  style={{ marginTop: 10, width: 100, height: 100, borderRadius: '50%' }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            Save changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
export default UserProfileDetailsPage;