'use client';

import { Button, Card, Tabs } from 'antd';
import React from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import TableData from '../table';
import { FaPlus } from 'react-icons/fa';
import { TabsProps } from 'antd/lib';

const TransferTab = () => {
  const onChange = () => {};

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span
          className="font-bold"
          id="settings-transfer-tab-requests-label"
          data-cy="settings-transfer-tab-requests-label"
        >
          Requests
        </span>
      ),
      children: <TableData data-cy="settings-transfer-table-requests" />,
    },
    {
      key: '2',
      label: (
        <span
          className="font-bold"
          id="settings-transfer-tab-approval-label"
          data-cy="settings-transfer-tab-approval-label"
        >
          Approval Needs
        </span>
      ),
      children: <TableData data-cy="settings-transfer-table-approval" />,
    },
  ];

  return (
    <Card
      className="border-b-0 py-4 px-4 sm:px-6 lg:px-8"
      id="settings-transfer-card"
      data-cy="settings-transfer-card"
    >
      <div
        className="flex flex-col sm:flex-row justify-between items-center mb-4"
        id="settings-transfer-header"
        data-cy="settings-transfer-header"
      >
        <div
          className="text-black font-bold text-lg mb-2 sm:mb-0"
          id="settings-transfer-title"
          data-cy="settings-transfer-title"
        >
          Transfer
        </div>
        <Button
          className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]"
          id="settings-transfer-request-btn"
          data-cy="settings-transfer-request-btn"
        >
          <FaPlus
            className="text-white"
            id="settings-transfer-request-icon"
            data-cy="settings-transfer-request-icon"
          />
          <span
            id="settings-transfer-request-text"
            data-cy="settings-transfer-request-text"
          >
            Request
          </span>
        </Button>
      </div>
      <p
        className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs sm:text-sm my-4 sm:my-6 text-center"
        id="settings-transfer-description"
        data-cy="settings-transfer-description"
      >
        <RiErrorWarningFill
          className="text-yellow-500"
          id="settings-transfer-icon"
          data-cy="settings-transfer-icon"
        />
        <span id="settings-transfer-text" data-cy="settings-transfer-text">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry standard dummy text ever
          since the 1500s.
        </span>
      </p>
      <div
        className="overflow-x-auto"
        id="settings-transfer-tabs-wrapper"
        data-cy="settings-transfer-tabs-wrapper"
      >
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          className="min-w-[320px]"
          id="settings-transfer-tabs"
          data-cy="settings-transfer-tabs"
        />
      </div>
    </Card>
  );
};

export default TransferTab;
