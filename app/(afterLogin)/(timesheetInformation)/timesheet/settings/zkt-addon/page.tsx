'use client';
import React from 'react';
import { Form, Input, Button, Avatar, message, Row, Col } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import Logo from '@/components/common/logo';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { IoIosLink } from 'react-icons/io';
import Image from 'next/image';
const ZKTeco = '/image/ZKTeco.png';
import { Trash2 } from 'lucide-react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  useAuthenticateZkt,
  ZktAuthPayload,
} from '@/store/server/features/timesheet/zkt/mutation';
import { setZktPassUrl } from '@/utils/zktToken';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';

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
          // Save passUrl to localStorage
          setZktPassUrl(values.url);
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

  return (
    <>
      {contextHolder}
      <div
        data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-78"
        className="p-3 rounded-lg sm:w-[754px] mx-auto border border-[#D9D9D9]"
      >
        {/* Logos Section */}
        <div
          data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-80"
          className="flex justify-center items-center"
        >
          <div
            data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-81"
            className="flex items-center"
          >
            <Logo type="selamnew" width={140} height={48} />
          </div>
          <InsertLinkOutlinedIcon />
          <div
            data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-85"
            className="flex items-end"
          >
            <Image src={ZKTeco} alt="zkt" width={140} height={48} />
          </div>
        </div>
        <div
          data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-86"
          className="text-center mb-4"
        >
          <p
            data-cy="timesheet-settings-zkt-addon-page-tsx-page-p-87"
            className="text-sm text-black"
          >
            Link ZKTeco time and attendance information with selamnew workspace,
            All you need to do is add the link for your dashboard on ZKT and add
            your username and password and we will handle the rest
          </p>
        </div>
        <div
          data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-89"
          className="bg-white p-4 "
        >
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
                  <span
                    data-cy="timesheet-settings-zkt-addon-page-tsx-page-span-102"
                    className="text-sm font-medium text-gray-700 pb-2"
                  >
                    Enter URL{' '}
                    <span
                      data-cy="timesheet-settings-zkt-addon-page-tsx-page-span-103"
                      className="text-red-500"
                    >
                      *
                    </span>
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
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    required={false}
                    label={
                      <span
                        data-cy="timesheet-settings-zkt-addon-page-tsx-page-span-122"
                        className="text-sm font-medium text-gray-700 pb-2"
                      >
                        Username{' '}
                        <span
                          data-cy="timesheet-settings-zkt-addon-page-tsx-page-span-123"
                          className="text-red-500"
                        >
                          *
                        </span>
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter username!' },
                    ]}
                  >
                    <Input placeholder="Username" className="h-10" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    required={false}
                    label={
                      <span
                        data-cy="timesheet-settings-zkt-addon-page-tsx-page-span-135"
                        className="text-sm font-medium text-gray-700 pb-2"
                      >
                        Password{' '}
                        <span
                          data-cy="timesheet-settings-zkt-addon-page-tsx-page-span-136"
                          className="text-red-500"
                        >
                          *
                        </span>
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter password!' },
                    ]}
                  >
                    <Input.Password placeholder="..." className="h-10" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Buttons */}
              <Form.Item className="mt-4 mb-0">
                <div
                  data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-146"
                  className="flex justify-end gap-3"
                >
                  <Button
                    onClick={handleCancel}
                    className="h-8 border-gray-300 text-gray-700 "
                    disabled={isZktSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-8"
                    loading={isZktSaving}
                  >
                    Link
                  </Button>
                </div>
              </Form.Item>
            </Form>
          ) : (
            /* Configured State */
            <div
              data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-167"
              className="w-full"
            >
              {/* User Card */}
              <div
                data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-169"
                className="flex items-center justify-between"
              >
                <div
                  data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-170"
                  className="flex items-center gap-4"
                >
                  {/* Avatar */}
                  <Avatar
                    size={40}
                    src={null} // You can add zktSavedData?.avatarUrl if you store it
                    className="flex-shrink-0 bg-gray-200"
                  >
                    {zktSavedData?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>

                  {/* Name and Link */}
                  <div
                    data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-181"
                    className="flex-1"
                  >
                    <div
                      data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-182"
                      className="font-bold text-gray-900 text-sm "
                    >
                      {zktSavedData?.username || 'User'}
                    </div>
                    <div
                      data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-185"
                      className="flex items-center gap-1"
                    >
                      <IoIosLink className="text-blue font-bold" size={16} />
                      <a
                        href={zktSavedData?.url || 'https://example.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm font-semibold"
                        data-cy="timesheetinformation-timesheet-settings-zkt-addon-page-tsx-a-250"
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
                  onDelete={() => {
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
