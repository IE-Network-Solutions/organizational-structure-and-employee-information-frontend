'use client';
import React from 'react';
import { Form, Input, Button, Avatar, message } from 'antd';
import { GlobalOutlined, DeleteOutlined } from '@ant-design/icons';
import Logo from '@/components/common/logo';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { IoIosLink } from 'react-icons/io';
import Image from 'next/image';
import ZKTeco from '@/public/image/ZKTeco.png';
import { Trash2 } from 'lucide-react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  useAuthenticateZkt,
  ZktAuthPayload,
} from '@/store/server/features/timesheet/zkt/mutation';

const ZKTAddonPage = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    isZktConfigured,
    zktSavedData,
    setIsZktConfigured,
    setZktSavedData,
    resetZktConfiguration,
  } = useTimesheetSettingsStore();

  const { mutate: authenticateZkt, isLoading: isZktSaving } =
    useAuthenticateZkt();

  const handleFinish = async (values: any) => {
    const payload: ZktAuthPayload = {
      url: values.url,
      username: values.username,
      password: values.password,
    };

    authenticateZkt(payload, {
      onSuccess: (data) => {
        if (typeof window !== 'undefined' && data?.token) {
          // Save plain token to localStorage (no encryption needed)
          window.localStorage.setItem('zktAuthToken', data.token);
        }

        setZktSavedData({
          url: values.url,
          username: values.username,
        });
        setIsZktConfigured(true);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to save ZKT credentials.';
        messageApi.error(errorMessage);
      },
    });
  };

  const handleCancel = () => {
    form.resetFields();
  };

  const handleDelete = () => {
    resetZktConfiguration();
    form.resetFields();
    // You can add API call here to delete the configuration
  };

  const handleEdit = () => {
    setIsZktConfigured(false);
  };

  return (
    <>
      {contextHolder}
      <div className="p-5 rounded-2xl bg-white">
        {/* Logos Section */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <Logo type="selamnew" width={140} height={48} />
          </div>
          <IoIosLink size={32} className="-ml-4 flex items-end" />
          <div className="flex items-end">
            <Image src={ZKTeco} alt="zkt" width={140} height={48} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 ">
          {!isZktConfigured ? (
            /* Form Section */
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              className="w-full"
            >
              <Form.Item
                name="url"
                required={false}
                label={
                  <span className="text-sm font-medium text-gray-700 pb-2">
                    Enter URL <span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Please enter URL!' },
                  { type: 'url', message: 'Please enter a valid URL!' },
                ]}
              >
                <Input
                  placeholder="https://example.com"
                  suffix={<GlobalOutlined className="text-gray-400" />}
                  className="h-10"
                />
              </Form.Item>

              <Form.Item
                name="username"
                required={false}
                label={
                  <span className="text-sm font-medium text-gray-700 pb-2">
                    Enter Username <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true, message: 'Please enter username!' }]}
              >
                <Input placeholder="Username" className="h-10" />
              </Form.Item>

              <Form.Item
                name="password"
                required={false}
                label={
                  <span className="text-sm font-medium text-gray-700 pb-2">
                    Enter Password <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true, message: 'Please enter password!' }]}
              >
                <Input.Password placeholder="..." className="h-10" />
              </Form.Item>

              {/* Buttons */}
              <Form.Item className="mt-6 mb-0">
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleCancel}
                    className="h-10 px-6 border-gray-300 text-gray-700 hover:border-gray-400"
                    disabled={isZktSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-10 px-6"
                    loading={isZktSaving}
                  >
                    Save
                  </Button>
                </div>
              </Form.Item>
            </Form>
          ) : (
            /* Configured State */
            <div className="w-full">
              {/* User Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar
                    size={40}
                    src={null} // You can add zktSavedData?.avatarUrl if you store it
                    className="flex-shrink-0 bg-gray-200"
                  >
                    {zktSavedData?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>

                  {/* Name and Link */}
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm ">
                      {zktSavedData?.username || 'User'}
                    </div>
                    <div className="flex items-center gap-1">
                      <IoIosLink className="text-blue font-bold" size={16} />
                      <a
                        href={zktSavedData?.url || 'https://example.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm font-semibold"
                      >
                        {zktSavedData?.url || 'https://example.com'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <DeletePopover
                  titleText="Are you sure you want to delete"
                  onCancel={() => {
                    // Popover will close automatically
                  }}
                  onDelete={(e) => {
                    handleDelete();
                  }}
                >
                  <Button
                    type="default"
                    className="p-2 transition-colors border-none shadow-none"
                  >
                    <Trash2
                      size={20}
                      strokeWidth={1.25}
                      className="text-gray-700"
                    />
                  </Button>
                </DeletePopover>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ZKTAddonPage;
