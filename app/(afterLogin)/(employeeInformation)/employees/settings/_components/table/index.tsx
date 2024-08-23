import { Button, Table } from 'antd';
import React from 'react';
import { FaUser } from 'react-icons/fa';
import { MdOutlineModeEditOutline } from 'react-icons/md';
const data: any = [
  {
    key: '1',
    levels: (
      <p className="flex space-x-1 rounded-full">
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
      <Button className="bg-blue">
        <MdOutlineModeEditOutline className="text-white" />
      </Button>
    ),
  },
  {
    key: '2',
    levels: (
      <p className="flex space-x-1 rounded-full">
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" />
        <span>Gim Green</span>
      </p>
    ),
    promotedTo: 42,
    status: (
      <span className="bg-red-200 text-red-600 px-2 py-1 rounded">
        rejected
      </span>
    ),
    action: (
      <Button className="bg-blue">
        <MdOutlineModeEditOutline className="text-white" />
      </Button>
    ),
  },
  {
    key: '3',
    levels: (
      <p className="flex space-x-1 rounded-full">
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" />
        <span>Joy Black</span>
      </p>
    ),
    promotedTo: 32,
    status: (
      <span className="bg-indigo-300 text-blue px-2 py-1 rounded">
        Requested
      </span>
    ),
    action: (
      <Button className="bg-blue">
        <MdOutlineModeEditOutline className="text-white" />
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
      filters: [
        { text: 'Joe', value: 'Joe' },
        { text: 'Jim', value: 'Jim' },
      ],
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
      filters: [
        { text: 'London', value: 'London' },
        { text: 'New York', value: 'New York' },
      ],
      ellipsis: true,
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      filters: [
        { text: 'London', value: 'London' },
        { text: 'New York', value: 'New York' },
      ],
      ellipsis: true,
    },
  ];
  return <Table columns={columns} dataSource={data} />;
};

export default TableData;
