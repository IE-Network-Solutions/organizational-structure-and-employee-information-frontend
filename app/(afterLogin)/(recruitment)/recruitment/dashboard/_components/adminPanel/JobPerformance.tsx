'use client';
import React from 'react';
import { Table } from 'antd';

const data = [
  {
    key: '1',
    recruiter: 'Mandefro Demse',
    job: 'UI/UX Designer',
    department: 'Software',
    stage: 'Stage 1',
    num: 0,
    openDate: '6/9/2025',
    closeDate: '10/9/2025',
  },
  {
    key: '2',
    recruiter: 'Samuel Tola',
    job: 'Sales Representative',
    department: 'Sales',
    stage: 'Stage 2',
    num: 5,
    openDate: '6/9/2025',
    closeDate: '10/9/2025',
  },
  {
    key: '3',
    recruiter: 'Estiphanos Yonas',
    job: 'Software Development Team Lead',
    department: 'Software',
    stage: 'Stage 2',
    num: 10,
    openDate: '6/9/2025',
    closeDate: '10/9/2025',
  },
];

const columns = [
  {
    title: 'Job',
    dataIndex: 'job',
    key: 'job',
  },

  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
  },
  {
    title: 'Recruiter',
    dataIndex: 'recruiter',
    key: 'recruiter',
  },
  {
    title: 'Number of Employee',
    dataIndex: 'num',
    key: 'num',
  },
  {
    title: 'Open Date',
    dataIndex: 'openDate',
    key: 'openDate',
  },
  {
    title: 'Close Date',
    dataIndex: 'closeDate',
    key: 'closeDate',
  },
];

export default function JobPerformance() {
  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: 3,
          showSizeChanger: false,
        }}
        bordered={false}
      />
    </div>
  );
}
