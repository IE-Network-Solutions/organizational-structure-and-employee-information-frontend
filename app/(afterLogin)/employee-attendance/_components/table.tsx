'use client';
import React from 'react';
import { Avatar, DatePicker, Table, TableProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { TableRowSelection } from 'antd/es/table/interface';

type ColumnsType<T extends object> = TableProps<T>['columns'];

interface DataTableEmployee {
  img: string;
  name: string;
  email: string;
}

interface TableData {
  key: React.ReactNode;
  employee: DataTableEmployee;
  date: string;
  clockIn: string;
  clockOut: string;
  status: string;
  overTime: string;
  totalTime: string;
  approvalStatus: string;
}

const columns: ColumnsType<TableData> = [
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
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (date: string) => <div>{date}</div>,
  },
  {
    title: 'Clock In',
    dataIndex: 'clockIn',
    key: 'clockIn',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Clock Out',
    dataIndex: 'clockOut',
    key: 'clockOut',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Over-time',
    dataIndex: 'overTime',
    key: 'overTime',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Total time',
    dataIndex: 'totalTime',
    key: 'totalTime',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Approval Status',
    dataIndex: 'approvalStatus',
    key: 'approvalStatus',
    render: (text: string) => <div>{text}</div>,
  },
];

const TABLE_DATA: TableData[] = [
  {
    key: '1',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    date: '08:00',
    clockIn: '08:00 AM',
    clockOut: '08:00 PM',
    status: 'active',
    overTime: '-',
    totalTime: '-',
    approvalStatus: 'Pending',
  },
  {
    key: '2',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    date: '08:00',
    clockIn: '08:00 AM',
    clockOut: '08:00 PM',
    status: 'active',
    overTime: '-',
    totalTime: '-',
    approvalStatus: 'Pending',
  },
  {
    key: '3',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    date: '08:00',
    clockIn: '08:00 AM',
    clockOut: '08:00 PM',
    status: 'active',
    overTime: '-',
    totalTime: '-',
    approvalStatus: 'Pending',
  },
  {
    key: '4',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    date: '08:00',
    clockIn: '08:00 AM',
    clockOut: '08:00 PM',
    status: 'active',
    overTime: '-',
    totalTime: '-',
    approvalStatus: 'Pending',
  },
  {
    key: '5',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    date: '08:00',
    clockIn: '08:00 AM',
    clockOut: '08:00 PM',
    status: 'active',
    overTime: '-',
    totalTime: '-',
    approvalStatus: 'Pending',
  },
  {
    key: '6',
    employee: {
      img: '',
      email: 'tyest@agas.ss',
      name: 'Hanna Baptista',
    },
    date: '08:00',
    clockIn: '08:00 AM',
    clockOut: '08:00 PM',
    status: 'active',
    overTime: '-',
    totalTime: '-',
    approvalStatus: 'Pending',
  },
];

const rowSelection: TableRowSelection<TableData> = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      'selectedRows: ',
      selectedRows,
    );
  },
  onSelect: (record, selected, selectedRows) => {
    console.log({ record, selected, selectedRows });
  },
};

const EmployeeAttendanceTable = () => {
  return (
    <>
      <div className="flex mb-6">
        <DatePicker.RangePicker separator={'-'} format="DD MMM YYYY" />
      </div>
      <Table
        columns={columns}
        dataSource={TABLE_DATA}
        rowSelection={{ ...rowSelection, checkStrictly: false }}
        pagination={{ position: ['none', 'bottomLeft'] }}
      />
    </>
  );
};

export default EmployeeAttendanceTable;
