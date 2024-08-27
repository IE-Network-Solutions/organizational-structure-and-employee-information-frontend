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
      label: <span className="font-bold">Requests</span>,
      children: <TableData />,
    },
    {
      key: '2',
      label: <span className="font-bold">Hand Over Tasks</span>,
      children: <TableData />,
    },
  ];

  return (
    <Card className="border-b-0 py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="text-black font-bold text-lg mb-2 sm:mb-0">
          Resignation
        </div>
        <Button className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]">
          <FaPlus className="text-white" />
          <span>Request</span>
        </Button>
      </div>
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

export default Resignation;
