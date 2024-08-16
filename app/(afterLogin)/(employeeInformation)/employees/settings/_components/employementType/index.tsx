'use client';

import { Button, Card, Table } from 'antd';
import React from 'react';
import { FaPlus, FaUser } from 'react-icons/fa';

const EmploymentType = () => {
  const data: any[] = [
    {
      key: '1',
      name: (
        <div className="flex space-x-2 font-semibold">
          <FaUser className="mt-3 text-gray-500" />
          <p className="flex flex-col">
            <span>John Brown</span>
            <span className="text-gray-500 text-xs">
              Employees who are currently under provision
            </span>
          </p>
        </div>
      ),
    },
    {
      key: '2',
      name: (
        <div className="flex space-x-2 font-semibold">
          <FaUser className="mt-3 text-gray-500" />
          <p className="flex flex-col">
            <span>Joe Black</span>
            <span className="text-gray-500 text-xs">
              Interns who are currently under provision
            </span>
          </p>
        </div>
      ),
    },
    {
      key: '3',
      name: (
        <div className="flex space-x-2 font-semibold">
          <FaUser className="mt-3 text-gray-500" />
          <p className="flex flex-col">
            <span>Joe Black</span>
            <span className="text-gray-500 text-xs">
              Employees who are currently under provision
            </span>
          </p>
        </div>
      ),
    },
  ];

  const columns: any = [
    {
      dataIndex: 'name',
      key: 'name',
    },
  ];

  return (
    <>
      <Card className="border-b-0 py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="text-black font-bold text-lg mb-2 sm:mb-0">
            Employment Type
          </div>
          <Button className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]">
            <FaPlus className="text-white" />
            <span>Add New Type</span>
          </Button>
        </div>
      </Card>
      <div className="overflow-x-auto">
        <Table columns={columns} dataSource={data} className="min-w-[320px]" />
      </div>
    </>
  );
};

export default EmploymentType;
