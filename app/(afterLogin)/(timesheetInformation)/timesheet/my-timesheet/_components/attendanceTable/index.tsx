import React from 'react';
import AttendanceTableFilter from './tableFilter/inedx';
import { TableColumnsType } from '@/types/table/table';
import { Button, Table } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { GoLocation } from 'react-icons/go';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';

const AttendanceTable = () => {
  const { setIsShowViewSidebar } = useMyTimesheetStore();

  const columns: TableColumnsType<any> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Clock In',
      dataIndex: 'clockIn',
      key: 'clockIn',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Location-in',
      dataIndex: 'locationIn',
      key: 'locationIn',
      render: (text: string) => (
        <div className="flex items-center justify-between">
          {text} <GoLocation />
        </div>
      ),
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOut',
      key: 'clockOut',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Location-Out',
      dataIndex: 'locationOut',
      key: 'locationOut',
      render: (text: string) => (
        <div className="flex items-center justify-between">
          {text} <GoLocation />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <div className="bg-red-200 text-red-600 px-2 py-1 rounded">
          <div>{text}</div>
          <span>00 hr 1 min</span>
        </div>
      ),
    },
    {
      title: 'Total time',
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Over-time',
      dataIndex: 'overTime',
      key: 'overTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: () => (
        <Button
          className="w-[30px] h-[30px]"
          icon={<IoEyeOutline size={16} />}
          type="primary"
          onClick={() => setIsShowViewSidebar(true)}
        />
      ),
    },
  ];

  const TABLE_DATA: any[] = [
    {
      key: '1',
      date: '01 Mar 2024',
      clockIn: '08:00 AM',
      locationIn: 'Remote',
      clockOut: '05:00 PM',
      locationOut: 'Remote',
      status: 'rejected',
      totalTime: '8h',
      overTime: '1 h 4 min',
      preview: '',
    },
    {
      key: '3',
      date: '01 Mar 2024',
      clockIn: '08:00 AM',
      locationIn: 'Remote',
      clockOut: '05:00 PM',
      locationOut: 'Remote',
      status: 'rejected',
      totalTime: '8h',
      overTime: '1 h 4 min',
      preview: '',
    },
    {
      key: '2',
      date: '01 Mar 2024',
      clockIn: '08:00 AM',
      locationIn: 'Remote',
      clockOut: '05:00 PM',
      locationOut: 'Remote',
      status: 'rejected',
      totalTime: '8h',
      overTime: '1 h 4 min',
      preview: '',
    },
  ];

  return (
    <>
      <AttendanceTableFilter />
      <Table
        className="mt-6"
        columns={columns}
        dataSource={TABLE_DATA}
        pagination={{ position: ['none', 'bottomLeft'] }}
      />
    </>
  );
};

export default AttendanceTable;
