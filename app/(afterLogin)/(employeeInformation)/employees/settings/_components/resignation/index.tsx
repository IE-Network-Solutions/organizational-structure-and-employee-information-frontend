'use client';

import { Button, Card, Tabs } from 'antd';
import React from 'react';
import TableData from '../table';
import { FaPlus } from 'react-icons/fa';
import { TabsProps } from 'antd/lib';

const Resignation = () => {
  const onChange = () => {};

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span
          className="font-bold"
          id="settings-resignation-tab-requests-label"
          data-cy="settings-resignation-tab-requests-label"
        >
          Requests
        </span>
      ),
      children: (
        <TableData data-cy="settings-resignation-table" />
      ),
    },
    {
      key: '2',
      label: (
        <span
          className="font-bold"
          id="settings-resignation-tab-handover-label"
          data-cy="settings-resignation-tab-handover-label"
        >
          Hand Over Tasks
        </span>
      ),
        children: (
          <TableData data-cy="settings-resignation-table" />
      ),
    },
  ];

  return (
    <Card
      className="border-b-0 py-4 px-4 sm:px-6 lg:px-8"
      id="settings-resignation-card"
      data-cy="settings-resignation-card"
    >
      <div
        className="flex flex-col sm:flex-row justify-between items-center mb-4"
        id="settings-resignation-header"
        data-cy="settings-resignation-header"
      >
        <div
          className="text-black font-bold text-lg mb-2 sm:mb-0"
          id="settings-resignation-title"
          data-cy="settings-resignation-title"
        >
          Resignation
        </div>
        <Button
          className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]"
          id="settings-resignation-request-btn"
          data-cy="settings-resignation-request-btn"
        >
          <FaPlus
            className="text-white"
            id="settings-resignation-request-icon"
            data-cy="settings-resignation-request-icon"
          />
          <span
            id="settings-resignation-request-text"
            data-cy="settings-resignation-request-text"
          >
            Request
          </span>
        </Button>
      </div>
      <div
        className="overflow-x-auto"
        id="settings-resignation-tabs-wrapper"
        data-cy="settings-resignation-tabs-wrapper"
      >
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          className="min-w-[320px]"
          id="settings-resignation-tabs"
          data-cy="settings-resignation-tabs"
        />
      </div>
    </Card>
  );
};

export default Resignation;
