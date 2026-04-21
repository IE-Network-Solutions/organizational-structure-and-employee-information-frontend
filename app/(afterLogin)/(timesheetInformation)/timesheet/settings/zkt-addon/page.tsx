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
  useDeleteZktConfig,
  useSaveZktConfig,
  ZktAuthPayload,
} from '@/store/server/features/timesheet/zkt/mutation';
import { useGetZktConfig } from '@/store/server/features/timesheet/zkt/queries';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';

const ZKTAddonPage = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [savedPassword, setSavedPassword] = React.useState('');
  const {
    isZktConfigured,
    setIsZktConfigured,
    setZktSavedData,
    resetZktConfiguration,
  } = useTimesheetSettingsStore();

  const { mutate: authenticateZkt, isLoading: isZktSaving } =
    useAuthenticateZkt();
  const { mutate: saveZktConfig, isLoading: isSavingZktConfig } =
    useSaveZktConfig();
  const { mutate: deleteZktConfig, isLoading: isDeletingZktConfig } =
    useDeleteZktConfig();
  const { data: zktConfigData } = useGetZktConfig();
  const resetZktUiState = React.useCallback(() => {
    setSavedPassword('');
    form.resetFields();
    resetZktConfiguration();
  }, [form, resetZktConfiguration]);

  React.useEffect(() => {
    if (!zktConfigData) {
      resetZktUiState();
      return;
    }

    if (
      (zktConfigData.url || zktConfigData.passUrl || zktConfigData.zkturl) &&
      zktConfigData.username &&
      zktConfigData.password
    ) {
      const savedUrl =
        zktConfigData.url ||
        zktConfigData.passUrl ||
        zktConfigData.zkturl ||
        '';
      setZktSavedData({
        url: savedUrl,
        username: zktConfigData.username,
      });
      setSavedPassword(zktConfigData.password);
      form.setFieldsValue({
        url: savedUrl,
        username: zktConfigData.username,
        password: zktConfigData.password,
      });
      setIsZktConfigured(true);
      return;
    }

    resetZktUiState();
  }, [
    form,
    resetZktUiState,
    setIsZktConfigured,
    setZktSavedData,
    zktConfigData,
  ]);

  const handleFinish = async (values: any) => {
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
              setSavedPassword(values.password);
              form.setFieldsValue({
                url: data?.url || values.url,
                username: data?.username || values.username,
                password: values.password,
              });
              setIsZktConfigured(true);
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

  const handleCancel = () => {
    form.resetFields();
  };

  const handleDelete = () => {
    deleteZktConfig(zktConfigData?.id, {
      onSuccess: () => {
        resetZktUiState();
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to delete ZKT configuration.';
        messageApi.error(errorMessage);
      },
    });
  };

  const isBusy = isZktSaving || isSavingZktConfig || isDeletingZktConfig;

  return (
    <>
      {contextHolder}
      <div
        data-cy="timesheet-settings-zkt-addon-page-tsx-page-div-78"
        className="p-3 rounded-lg sm:w-[754px] mx-auto border border-[#D9D9D9]"
      >
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
            <Image src={ZK_TECO_LOGO_URL} alt="zkt" width={140} height={48} />
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
                  data-cy="timesheet-settings-zkt-addon-url-label"
                  className="text-sm font-medium text-gray-700 pb-2"
                >
                  Enter URL{' '}
                  <span
                    data-cy="timesheet-settings-zkt-addon-url-required"
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
                readOnly={isZktConfigured}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  required={false}
                  label={
                    <span
                      data-cy="timesheet-settings-zkt-addon-username-label"
                      className="text-sm font-medium text-gray-700 pb-2"
                    >
                      Username{' '}
                      <span
                        data-cy="timesheet-settings-zkt-addon-username-required"
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
                  <Input
                    placeholder="Username"
                    className="h-10"
                    readOnly={isZktConfigured}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="password"
                  required={false}
                  label={
                    <span
                      data-cy="timesheet-settings-zkt-addon-password-label"
                      className="text-sm font-medium text-gray-700 pb-2"
                    >
                      Password{' '}
                      <span
                        data-cy="timesheet-settings-zkt-addon-password-required"
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
                  <Input.Password
                    placeholder="..."
                    className="h-10"
                    readOnly={isZktConfigured}
                    value={isZktConfigured ? savedPassword : undefined}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mt-4 mb-0">
              <div
                data-cy="timesheet-settings-zkt-addon-action-buttons"
                className="flex justify-end gap-3"
              >
                {!isZktConfigured && (
                  <Button
                    onClick={handleCancel}
                    className="h-8 border-gray-300 text-gray-700 "
                    disabled={isBusy}
                  >
                    Cancel
                  </Button>
                )}
                {!isZktConfigured ? (
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-8"
                    loading={isBusy}
                  >
                    Link
                  </Button>
                ) : (
                  <Button
                    danger
                    className="h-8"
                    onClick={handleDelete}
                    loading={isDeletingZktConfig}
                    disabled={isZktSaving || isSavingZktConfig}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ZKTAddonPage;
