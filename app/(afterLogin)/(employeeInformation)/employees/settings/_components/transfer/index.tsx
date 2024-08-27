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
      label: <span className="font-bold">Requests</span>,
      children: <TableData />,
    },
    {
      key: '2',
      label: <span className="font-bold">Approval Needs</span>,
      children: <TableData />,
    },
  ];

  return (
    <Card className="border-b-0 py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="text-black font-bold text-lg mb-2 sm:mb-0">
          Transfer
        </div>
        <Button className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]">
          <FaPlus className="text-white" />
          <span>Request</span>
        </Button>
      </div>
      <p className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs sm:text-sm my-4 sm:my-6 text-center">
        <RiErrorWarningFill className="text-yellow-500" />
        <span>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry standard dummy text ever
          since the 1500s.
        </span>
      </p>
      <div className="overflow-x-auto">
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          className="min-w-[320px]"
        />
      </div>
    </Card>
  );
};

export default TransferTab;
