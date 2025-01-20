'use client';
import { Table, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
const { Title } = Typography;

const Pension = () => {
  const dataSource = [
    {
      key: '1',
      name: 'Pension Rule 1',
      employeeContribution: '7 %',
      employerContribution: '11 %',
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Employee Contribution',
      dataIndex: 'employeeContribution',
      key: 'employeeContribution',
    },
    {
      title: 'Employer Contribution',
      dataIndex: 'employerContribution',
      key: 'employerContribution',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Pension</Title>
        <Button
          type="default"
          className="bg-slate-200 border-none text-gray-400"
          icon={<PlusOutlined />}
          style={{ marginBottom: '20px' }}
        >
          Pension Rule
        </Button>
      </div>

      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </div>
  );
};

export default Pension;
