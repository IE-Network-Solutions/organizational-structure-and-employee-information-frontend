'use client';

import { Card } from 'antd';
import React from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import TableData from '../table';

const Promotions = () => {
  return (
    <Card className="border-b-0 py-4 px-4 sm:px-6 lg:px-8">
      <div className="text-black font-bold text-lg mb-4">Promotions</div>
      <p className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs sm:text-sm my-4 sm:my-6 text-center">
        <RiErrorWarningFill className="text-yellow-500" />
        <span>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry standard dummy text ever
          since the 1500s.
        </span>
      </p>
      <TableData />
    </Card>
  );
};

export default Promotions;
