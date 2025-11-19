import { Button, Table } from 'antd';
import React from 'react';
import { FaUser } from 'react-icons/fa';
import { MdOutlineModeEditOutline } from 'react-icons/md';

const data: any = [
  {
    key: '1',
    levels: (
      <p
        className="flex items-center space-x-2"
        id="settings-table-levels-john-brown"
        data-cy="settings-table-levels-john-brown"
      >
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" data-cy="settings-table-levels-icon-john-brown" id="settings-table-levels-icon-john-brown" />
        <span id="settings-table-levels-name-john-brown" data-cy="settings-table-levels-name-john-brown">
          John Brown
        </span>
      </p>
    ),
    promotedTo: 32,
    status: (
      <span
        className="bg-green-200 text-green-600 px-2 py-1 rounded"
        id="settings-table-status-john-brown"
        data-cy="settings-table-status-john-brown"
      >
        Approved
      </span>
    ),
    action: (
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white"
        id="settings-table-action-john-brown"
        data-cy="settings-table-action-john-brown"
      >
        <MdOutlineModeEditOutline id='settings-table-icon-john-brown' data-cy='settings-table-icon-john-brown' />
      </Button>
    ),
  },
  {
    key: '2',
    levels: (
      <p
        className="flex items-center space-x-2"
        id="settings-table-levels-gim-green"
        data-cy="settings-table-levels-gim-green"
      >
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" id='settings-table-levels-icon-gim-green' data-cy="settings-table-levels-icon-gim-green" />
        <span id="settings-table-levels-name-gim-green" data-cy="settings-table-levels-name-gim-green">
          Gim Green
        </span>
      </p>
    ),
    promotedTo: 42,
    status: (
      <span
        className="bg-red-200 text-red-600 px-2 py-1 rounded"
        id="settings-table-status-gim-green"
        data-cy="settings-table-status-gim-green"
      >
        Rejected
      </span>
    ),
    action: (
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white"
        id="settings-table-action-gim-green"
        data-cy="settings-table-action-gim-green"
      >
        <MdOutlineModeEditOutline />
      </Button>
    ),
  },
  {
    key: '3',
    levels: (
      <p
        className="flex items-center space-x-2"
        id="settings-table-levels-joy-black"
        data-cy="settings-table-levels-joy-black"
      >
        <FaUser className="w-5 h-5 p-1 border-black border-2 rounded-full" data-cy="settings-table-levels-icon-joy-black" />
        <span id="settings-table-levels-name-joy-black" data-cy="settings-table-levels-name-joy-black">
          Joy Black
        </span>
      </p>
    ),
    promotedTo: 32,
    status: (
      <span
        className="bg-indigo-300 text-blue-600 px-2 py-1 rounded"
        id="settings-table-status-joy-black"
        data-cy="settings-table-status-joy-black"
      >
        Requested
      </span>
    ),
    action: (
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white"
        id="settings-table-action-joy-black"
        data-cy="settings-table-action-joy-black"
      >
        <MdOutlineModeEditOutline data-cy="settings-table-action-joy-black-icon" />
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
    <div
      className="overflow-x-auto"
      id="settings-table-container"
      data-cy="settings-table-container"
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 600 }}
        id="settings-table"
        data-cy="settings-table"
      />
    </div>
  );
};

export default TableData;
