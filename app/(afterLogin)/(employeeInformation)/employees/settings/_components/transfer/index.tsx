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
      label: <span className="fon-bold">Requests</span>,
      children: <TableData />,
    },
    {
      key: '2',
      label: <span className="fon-bold">Approval Needs</span>,
      children: <TableData />,
    },
  ];
  return (
    <Card className="border-b-0 py-4">
      <div className="flex justify-between mr-4">
        <div className="text-black font-bold text-lg">Transfer</div>
        <Button className="flex space-x-1 px-6 py-6 font-bold bg-[#3636F0] text-white">
          <FaPlus className="text-white font-bold" />
          Request
        </Button>
      </div>
      <p className="flex justify-center items-center gap-2 text-xs my-10">
        <RiErrorWarningFill />
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industrys standard dummy text ever
        since the 1500s
      </p>
      <div className="flex justify-center">
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </div>
    </Card>
  );
};

export default TransferTab;
