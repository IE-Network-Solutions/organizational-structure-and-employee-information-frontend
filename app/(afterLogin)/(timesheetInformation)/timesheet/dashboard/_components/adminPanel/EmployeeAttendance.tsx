import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  DatePicker,
  Pagination,
  Avatar,
  Tag,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Option } = Select;

interface Employee {
  key: string;
  name: string;
  avatar: string;
  department: string;
  status: 'ON LEAVE' | 'Active';
  absentDays: number;
  lateDays: number;
}

const employeesData: Employee[] = [
  {
    key: '1',
    name: 'Nahom Samuel',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    department: 'Product Design',
    status: 'ON LEAVE',
    absentDays: 2,
    lateDays: 4,
  },
  {
    key: '2',
    name: 'Robel Bekele',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    department: 'Software Development',
    status: 'ON LEAVE',
    absentDays: 0,
    lateDays: 5,
  },
  {
    key: '3',
    name: 'Alemayehu Taye',
    avatar: 'https://randomuser.me/api/portraits/men/34.jpg',
    department: 'Sales Department',
    status: 'Active',
    absentDays: 0,
    lateDays: 2,
  },
  {
    key: '4',
    name: 'Fasika Alemu',
    avatar: 'https://randomuser.me/api/portraits/women/35.jpg',
    department: 'Software Department',
    status: 'ON LEAVE',
    absentDays: 0,
    lateDays: 5,
  },
  {
    key: '5',
    name: 'Dawit Robel',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    department: 'Sales Department',
    status: 'Active',
    absentDays: 1,
    lateDays: 6,
  },
  {
    key: '6',
    name: 'Leul Samuel',
    avatar: 'https://randomuser.me/api/portraits/men/37.jpg',
    department: 'Sales Department',
    status: 'Active',
    absentDays: 0,
    lateDays: 12,
  },
  {
    key: '7',
    name: 'Solomon Solomon',
    avatar: 'https://randomuser.me/api/portraits/men/38.jpg',
    department: 'Sales Department',
    status: 'ON LEAVE',
    absentDays: 2,
    lateDays: 4,
  },
];

const statusColors = {
  'ON LEAVE': 'bg-red-100 text-red-600',
  Active: 'bg-green-100 text-green-600',
};

export default function EmployeeAttendanceTable() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Set your desired page size

  const filteredData = employeesData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.department.toLowerCase().includes(searchText.toLowerCase());

    const matchesType = filterType ? item.status === filterType : true;
    // Date filter logic can be added here if needed

    return matchesSearch && matchesType;
  });

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name),
      render: (notused: any, record?: Employee) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record?.avatar} />
          <span>{record?.name}</span>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: (a: Employee, b: Employee) =>
        a.department.localeCompare(b.department),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: Employee, b: Employee) => a.status.localeCompare(b.status),
      render: (status: Employee['status']) => (
        <Tag
          className={`uppercase px-3 font-semibold rounded-md border-none ${statusColors[status]}`}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Absentisms',
      dataIndex: 'absentDays',
      key: 'absentDays',
      sorter: (a: Employee, b: Employee) => a.absentDays - b.absentDays,
      render: (days: number) => `${days} days`,
    },
    {
      title: 'Late Arrivals',
      dataIndex: 'lateDays',
      key: 'lateDays',
      sorter: (a: Employee, b: Employee) => a.lateDays - b.lateDays,
      render: (days: number) => `${days} days`,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-6">
        <Input
          placeholder="Search Employee"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          className="flex-1"
          allowClear
        />
        <Select
          placeholder="Type"
          onChange={(val) => setFilterType(val)}
          allowClear
          className="w-40"
        >
          <Option value="Active">Active</Option>
          <Option value="ON LEAVE">ON LEAVE</Option>
        </Select>
        <DatePicker placeholder="Date" className="w-40" />
      </div>
      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        )}
        pagination={false}
        rowKey="key"
        className="ant-table-thead-bg-white"
        onRow={(record) => ({
          onClick: () => {
            router.push(
              `/timesheet/dashboard?employeeAttendance&user=${record.key}`,
            );
          },
          style: { cursor: 'pointer' },
        })}
      />

      {/* Pagination and Result Count */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <Pagination
          current={currentPage}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          className="flex"
        />
        <div>
          {filteredData.length} Result{filteredData.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
