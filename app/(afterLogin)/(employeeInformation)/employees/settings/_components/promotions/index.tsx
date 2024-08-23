// 'use client';
import { Card } from 'antd';
import React from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import TableData from '../table';

const Promotions = () => {
  return (
    <Card className="border-b-0 py-4">
      <div className="text-black font-bold text-lg">Promotions</div>
      <p className="flex justify-center items-center gap-2 text-xs my-10">
        <RiErrorWarningFill />
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industrys standard dummy text ever
        since the 1500s
      </p>
      <TableData />
    </Card>
  );
};

export default Promotions;
