import React from 'react';
import LeaveManagementTableFilter from './tableFilter';
import { Avatar, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { UserOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { TbFileDownload } from 'react-icons/tb';

interface DataTableEmployee {
  img: string;
  name: string;
  email: string;
}

const columns: TableColumnsType<any> = [
  {
    title: 'Employee Name',
    dataIndex: 'employee',
    key: 'employee',
    render: (employee: DataTableEmployee) => (
      <div className="flex items-center gap-1.5">
        <Avatar size={24} icon={<UserOutlined />} />
        <div className="flex-1">
          <div className="text-xs text-gray-900">{employee.name}</div>
          <div className="text-[10px] leading-4	text-gray-600">
            {employee.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'from',
    dataIndex: 'from',
    key: 'from',
    render: (date: string) => <div>{date}</div>,
  },
  {
    title: 'to',
    dataIndex: 'to',
    key: 'to',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'total',
    dataIndex: 'total',
    key: 'total',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'type',
    dataIndex: 'type',
    key: 'type',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Attachment',
    dataIndex: 'attachment',
    key: 'attachment',
    render: (text: string) => (
      <div className="flex justify-between align-middle">
        <div>{text}</div>
        <TbFileDownload size={14} />
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (text: string) => <StatusBadge>{text}</StatusBadge>,
  },
];

const TABLE_DATA = [
  {
    key: '1',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    from: '08:00 AM',
    to: '08:00 PM',
    total: '3 Days',
    type: 'Engagement',
    attachment: 'File.pdf',
    status: 'PENDING',
  },
  {
    key: '2',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    from: '08:00 AM',
    to: '08:00 PM',
    total: '3 Days',
    type: 'Engagement',
    attachment: 'File.pdf',
    status: 'PENDING',
  },
  {
    key: '3',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    from: '08:00 AM',
    to: '08:00 PM',
    total: '3 Days',
    type: 'Engagement',
    attachment: 'File.pdf',
    status: 'PENDING',
  },
  {
    key: '4',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    from: '08:00 AM',
    to: '08:00 PM',
    total: '3 Days',
    type: 'Engagement',
    attachment: 'File.pdf',
    status: 'PENDING',
  },
];

const LeaveManagementTable = () => {
  return (
    <div className="mt-6">
      <LeaveManagementTableFilter />

      <Table
        className="mt-6"
        columns={columns}
        dataSource={TABLE_DATA}
        rowSelection={{ checkStrictly: false }}
        pagination={{ position: ['none', 'bottomLeft'] }}
      />
    </div>
  );
};

export default LeaveManagementTable;
