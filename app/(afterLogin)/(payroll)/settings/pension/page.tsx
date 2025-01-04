'use client';
import { Table, Button, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
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
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <AccessGuard permissions={[Permissions.UpdatePensionRule]}>
            <Button type="primary" icon={<EditOutlined />} />
          </AccessGuard>
          <AccessGuard permissions={[Permissions.DeletePensionRule]}>
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </AccessGuard>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Pension</Title>
        <AccessGuard permissions={[Permissions.CreatePensionRule]}>
          <Button
            type="default"
            className="bg-slate-200 border-none text-gray-400"
            icon={<PlusOutlined />}
            style={{ marginBottom: '20px' }}
          >
            Pension Rule
          </Button>
        </AccessGuard>
      </div>

      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </div>
  );
};

export default Pension;
