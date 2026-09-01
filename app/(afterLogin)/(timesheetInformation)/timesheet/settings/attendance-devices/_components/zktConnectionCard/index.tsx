'use client';

import React from 'react';
import { Form, Input, Button, message, Row, Col } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import Logo from '@/components/common/logo';
import Image from 'next/image';
import { ZK_TECO_LOGO_URL } from '@/constants/publicImageUrls';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  useAuthenticateZkt,
  useSaveZktConfig,
  ZktAuthPayload,
} from '@/store/server/features/timesheet/zkt/mutation';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';

const ZktConnectionCard = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { setIsZktConfigured, setZktSavedData } = useTimesheetSettingsStore();

  const { mutate: authenticateZkt, isLoading: isZktSaving } =
    useAuthenticateZkt();
  const { mutate: saveZktConfig, isLoading: isSavingZktConfig } =
    useSaveZktConfig();

  const handleFinish = (values: ZktAuthPayload) => {
    const payload: ZktAuthPayload = {
      url: values.url,
      username: values.username,
      password: values.password,
    };

    authenticateZkt(payload, {
      onSuccess: (data) => {
        saveZktConfig(
          {
            url: data?.url || values.url,
            username: data?.username || values.username,
            password: values.password,
            zktToken: data?.token,
          },
          {
            onSuccess: () => {
              setZktSavedData({
                url: data?.url || values.url,
                username: data?.username || values.username,
              });
              setIsZktConfigured(true);
              messageApi.success('ZKTeco linked successfully.');
            },
            onError: (error: any) => {
              const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Unable to save ZKT configuration.';
              messageApi.error(errorMessage);
            },
          },
        );
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

  const isBusy = isZktSaving || isSavingZktConfig;

  return (
    <>
      {contextHolder}
      <div
        className="p-3 rounded-lg sm:w-[754px] mx-auto border border-[#D9D9D9]"
        data-cy="attendance-devices-zkt-connection-card"
      >
        <div
          className="flex justify-center items-center gap-2"
          data-cy="attendance-devices-zkt-connection-logos"
        >
          <div
            className="flex items-center"
            data-cy="attendance-devices-zkt-connection-selamnew-logo"
          >
            <Logo type="selamnew" width={140} height={48} />
          </div>
          <InsertLinkOutlinedIcon data-cy="attendance-devices-zkt-connection-link-icon" />
          <div
            className="flex items-end"
            data-cy="attendance-devices-zkt-connection-zkt-logo"
          >
            <Image
              unoptimized
              src={ZK_TECO_LOGO_URL}
              alt="zkt"
              width={140}
              height={48}
            />
          </div>
        </div>
        <div
          className="text-center mb-4 mt-3"
          data-cy="attendance-devices-zkt-connection-copy"
        >
          <p
            className="mb-0 text-sm text-black"
            data-cy="attendance-devices-zkt-connection-description"
          >
            Link ZKTeco time and attendance information with selamnew workspace,
            All you need to do is add the link for your dashboard on ZKT and add
            your username and password and we will handle the rest
          </p>
        </div>
        <div
          className="bg-white p-4"
          data-cy="attendance-devices-zkt-connection-form-wrap"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="w-full"
            data-cy="attendance-devices-zkt-connection-form"
          >
            <Form.Item
              name="url"
              required={false}
              label={
                <span
                  className="text-sm font-medium text-gray-700 pb-2"
                  data-cy="attendance-devices-zkt-url-label"
                >
                  Enter URL{' '}
                  <span
                    className="text-red-500"
                    data-cy="attendance-devices-zkt-url-required"
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
                data-cy="attendance-devices-zkt-url-input"
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  required={false}
                  label={
                    <span
                      className="text-sm font-medium text-gray-700 pb-2"
                      data-cy="attendance-devices-zkt-username-label"
                    >
                      Username{' '}
                      <span
                        className="text-red-500"
                        data-cy="attendance-devices-zkt-username-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Please enter username!' },
                  ]}
                >
                  <Input
                    placeholder="Username"
                    className="h-10"
                    data-cy="attendance-devices-zkt-username-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="password"
                  required={false}
                  label={
                    <span
                      className="text-sm font-medium text-gray-700 pb-2"
                      data-cy="attendance-devices-zkt-password-label"
                    >
                      Password{' '}
                      <span
                        className="text-red-500"
                        data-cy="attendance-devices-zkt-password-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Please enter password!' },
                  ]}
                >
                  <Input.Password
                    placeholder="..."
                    className="h-10"
                    data-cy="attendance-devices-zkt-password-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mt-4 mb-0">
              <div
                className="flex justify-end gap-3"
                data-cy="attendance-devices-zkt-connection-actions"
              >
                <Button
                  onClick={() => form.resetFields()}
                  className="h-8 border-gray-300 text-gray-700"
                  disabled={isBusy}
                  data-cy="attendance-devices-zkt-cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="h-8"
                  loading={isBusy}
                  data-cy="attendance-devices-zkt-link-button"
                >
                  Link
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ZktConnectionCard;
