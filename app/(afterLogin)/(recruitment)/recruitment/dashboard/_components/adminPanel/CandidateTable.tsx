'use client';
import React from 'react';
import { Table } from 'antd';

const data = [
  {
    key: '1',
    candidate: 'Mandefro Demse',
    job: 'UI/UX Designer',
    department: 'Software',
    stage: 'Stage 1',
    daysToHire: 0,
  },
  {
    key: '2',
    candidate: 'Samuel Tola',
    job: 'Sales Representative',
    department: 'Sales',
    stage: 'Stage 2',
    daysToHire: 5,
  },
  {
    key: '3',
    candidate: 'Estiphanos Yonas',
    job: 'Software Development Team Lead',
    department: 'Software',
    stage: 'Stage 2',
    daysToHire: 10,
  },
];

const columns = [
  {
    title: 'Candidate',
    dataIndex: 'candidate',
    key: 'candidate',
  },
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
    title: 'Stage',
    dataIndex: 'stage',
    key: 'stage',
  },
  {
    title: 'Days to hire',
    dataIndex: 'daysToHire',
    key: 'daysToHire',
  },
];

export default function CandidateTable() {
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
