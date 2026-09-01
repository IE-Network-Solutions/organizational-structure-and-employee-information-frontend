'use client';

import React from 'react';
import { Button, Tag, message } from 'antd';
import Logo from '@/components/common/logo';
import Image from 'next/image';
import { ZK_TECO_LOGO_URL } from '@/constants/publicImageUrls';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useDeleteZktConfig } from '@/store/server/features/timesheet/zkt/mutation';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';

const ZktConnectedStatus = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { zktSavedData, resetZktConfiguration } = useTimesheetSettingsStore();
  const { mutate: deleteZktConfig, isLoading: isDeletingZktConfig } =
    useDeleteZktConfig();

  const handleDisconnect = () => {
    deleteZktConfig(undefined, {
      onSuccess: () => {
        resetZktConfiguration();
        messageApi.success('ZKTeco disconnected.');
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

  return (
    <>
      {contextHolder}
      <div
        className="rounded-lg border border-[#D9D9D9] bg-white p-4"
        data-cy="attendance-devices-zkt-connected-status"
      >
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          data-cy="attendance-devices-zkt-connected-row"
        >
          <div
            className="flex flex-wrap items-center gap-2 min-w-0"
            data-cy="attendance-devices-zkt-connected-logos"
          >
            <Logo type="selamnew" width={120} height={40} />
            <InsertLinkOutlinedIcon
              className="text-gray-500"
              data-cy="attendance-devices-zkt-connected-link-icon"
            />
            <Image
              unoptimized
              src={ZK_TECO_LOGO_URL}
              alt="zkt"
              width={120}
              height={40}
            />
            <Tag
              color="success"
              className="!m-0"
              data-cy="attendance-devices-zkt-connected-tag"
            >
              Connected
            </Tag>
          </div>
          <div
            className="flex flex-wrap items-center gap-3 shrink-0"
            data-cy="attendance-devices-zkt-connected-actions"
          >
            {zktSavedData?.url ? (
              <a
                href={zktSavedData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate max-w-[240px]"
                data-cy="attendance-devices-zkt-connected-url"
                title={zktSavedData.url}
              >
                {zktSavedData.url}
              </a>
            ) : null}
            <Button
              danger
              className="h-8"
              onClick={handleDisconnect}
              loading={isDeletingZktConfig}
              data-cy="attendance-devices-zkt-disconnect-button"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ZktConnectedStatus;
