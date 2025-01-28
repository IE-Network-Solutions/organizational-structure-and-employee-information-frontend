'use client';
import { Table, Button, Typography, Input } from 'antd';
import { EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useGetAllPensionRule } from '@/store/server/features/payroll/payroll/queries';
import { useUpdatePensionRule } from '@/store/server/features/payroll/payroll/mutation';
const { Title } = Typography;
type PensionRule = {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null; // Can be null if not deleted
  name: string; // Rule name
  description: string; // Rule description
  employer: string; // Employer identifier
  employee: string; // Employee identifier
  tenantId: string; // Tenant identifier
};

const Pension = () => {
  const { data: pensionRule, isLoading } = useGetAllPensionRule();
  const { mutate: pensionRuleUpdate, isLoading: updatePensionRule } =
    useUpdatePensionRule();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});

  // Format the data for the table

  const isEditing = (record: any) => record.key === editingKey;

  const handleEdit = (record: any) => {
    setEditingKey(record.key);
    setEditedData({ ...record });
  };

  const handleSave = () => {
    pensionRuleUpdate(editedData, {
      onSuccess: () => {
        setEditingKey(null); // Exit editing mode
      },
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (notused: any, record: PensionRule) => {
        return isEditing(record) ? (
          <Input
            value={editedData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        ) : (
          record.name
        );
      },
    },
    {
      title: 'Employee Contribution',
      dataIndex: 'employee',
      key: 'employee',
      render: (notused: any, record: PensionRule) => {
        return isEditing(record) ? (
          <Input
            type="number"
            max={100}
            min={0}
            value={editedData.employee}
            onChange={(e) => handleInputChange('employee', e.target.value)}
          />
        ) : (
          `${record.employee}%`
        );
      },
    },
    {
      title: 'Employer Contribution',
      dataIndex: 'employer',
      key: 'employer',
      render: (notused: any, record: PensionRule) => {
        return isEditing(record) ? (
          <Input
            type="number"
            max={100}
            min={0}
            value={editedData.employer}
            onChange={(e) => handleInputChange('employer', e.target.value)}
          />
        ) : (
          `${record.employer}%`
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (notused: any, record: PensionRule) => {
        const editable = isEditing(record);
        return editable ? (
          <Button
            type="primary"
            loading={updatePensionRule}
            icon={<SaveOutlined />}
            onClick={() => handleSave()}
          >
            Save
          </Button>
        ) : (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        );
      },
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

      <Table
        dataSource={pensionRule ?? []}
        columns={columns}
        pagination={false}
        loading={isLoading}
      />
    </div>
  );
};

export default Pension;
