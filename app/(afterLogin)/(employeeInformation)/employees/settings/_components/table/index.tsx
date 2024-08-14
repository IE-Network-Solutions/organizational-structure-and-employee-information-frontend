import { Button, Table } from 'antd';
import React from 'react';
import { FaUser } from 'react-icons/fa';
import { MdOutlineModeEditOutline } from 'react-icons/md';

const data: any = [
  {
    key: '1',
    levels: (
      <p className="flex items-center space-x-2">
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" />
        <span>John Brown</span>
      </p>
    ),
    promotedTo: 32,
    status: (
      <span className="bg-green-200 text-green-600 px-2 py-1 rounded">
        Approved
      </span>
    ),
    action: (
      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
        <MdOutlineModeEditOutline />
      </Button>
    ),
  },
  {
    key: '2',
    levels: (
      <p className="flex items-center space-x-2">
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" />
        <span>Gim Green</span>
      </p>
    ),
    promotedTo: 42,
    status: (
      <span className="bg-red-200 text-red-600 px-2 py-1 rounded">
        Rejected
      </span>
    ),
    action: (
      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
        <MdOutlineModeEditOutline />
      </Button>
    ),
  },
  {
    key: '3',
    levels: (
      <p className="flex items-center space-x-2">
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" />
        <span>Joy Black</span>
      </p>
    ),
    promotedTo: 32,
    status: (
      <span className="bg-indigo-300 text-blue-600 px-2 py-1 rounded">
        Requested
      </span>
    ),
    action: (
      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
        <MdOutlineModeEditOutline />
      </Button>
    ),
  },
];

const TableData = () => {
  const columns: any = [
    {
      title: 'Levels',
      dataIndex: 'levels',
      key: 'levels',
      ellipsis: true,
    },
    {
      title: 'Promoted to',
      dataIndex: 'promotedTo',
      key: 'promotedTo',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      ellipsis: true,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 600 }}
      />
    </div>
  );

};

export default TableData;
