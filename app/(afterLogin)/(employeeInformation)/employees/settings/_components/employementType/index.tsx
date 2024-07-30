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
      key: '2',
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
      <Card className="border-b-0 py-4">
        <div className="flex justify-between mr-4">
          <div className="text-black font-bold text-lg">Employment Type</div>
          <Button className="flex space-x-1 px-6 py-6 font-bold bg-[#3636F0] text-white">
            <FaPlus className="text-white font-bold" />
            Add New Type
          </Button>
        </div>
      </Card>
      <Table columns={columns} dataSource={data} />
    </>
  );
};

export default EmploymentType;
