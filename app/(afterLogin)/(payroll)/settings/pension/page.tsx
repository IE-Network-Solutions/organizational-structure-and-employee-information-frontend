'use client';
import { Table, Button, Input } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useGetAllPensionRule } from '@/store/server/features/payroll/payroll/queries';
import { useUpdatePensionRule } from '@/store/server/features/payroll/payroll/mutation';
import { FaPlus } from 'react-icons/fa';

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

interface ColumnType {
  title: string;
  dataIndex: string;
  key: string;
  sorter?: (a: PensionRule, b: PensionRule) => number;
  render?: (notused: any, record: PensionRule) => React.ReactNode;
}

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

  const columns: ColumnType[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),

      render: (notused: any, record: PensionRule) => {
        return isEditing(record) ? (
          <Input
            data-cy={`payroll-pension-name-input-${record.key}`}
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
      sorter: (a, b) => Number(a.employee) - Number(b.employee),
      render: (notused: any, record: PensionRule) => {
        return isEditing(record) ? (
          <Input
            data-cy={`payroll-pension-employee-input-${record.key}`}
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
      sorter: (a, b) => Number(a.employer) - Number(b.employer),

      render: (notused: any, record: PensionRule) => {
        return isEditing(record) ? (
          <Input
            data-cy={`payroll-pension-employer-input-${record.key}`}
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
            data-cy={`payroll-pension-save-click-button-${record.id}`}
            type="primary"
            loading={updatePensionRule}
            icon={<SaveOutlined data-cy={`payroll-pension-save-click-button-${record.id}`}  />}
            onClick={() => handleSave()}
          >
            Save
          </Button>
        ) : (
          <Button
            data-cy={`payroll-pension-edit-click-button-${record.id}`}
            type="link"
            icon={<EditOutlined data-cy={`payroll-pension-edit-click-button-${record.id}`} />}
            onClick={() => handleEdit(record)}
          />
        );
      },
    },
  ];

  return (
    <div
      id="payroll-pension-page-view-container"
      data-cy="payroll-pension-page-view-container"
      className="p-5 rounded-2xl bg-white h-full"
    >
      <div
        id="payroll-pension-header-view-container"
        data-cy="payroll-pension-header-view-container"
        className="flex justify-between items-center mb-4"
      >
        <h1
          id="payroll-pension-title-view-text"
          data-cy="payroll-pension-title-view-text"
          className="text-lg text-bold"
        >
          Pension
        </h1>
        <Button
          id="payroll-pension-add-click-button"
          data-cy="payroll-pension-add-click-button"
          className="h-10 w-10 sm:w-auto"
          type="primary"
          disabled
          icon={<FaPlus data-cy="payroll-pension-add-click-button-icon" />}
        >
          <span
            id="payroll-pension-add-click-button-text"
            data-cy="payroll-pension-add-click-button-text"
            className="hidden lg:inline"
          >
            Pension Rule
          </span>
        </Button>
      </div>
      <div
        id="payroll-pension-table-view-container"
        data-cy="payroll-pension-table-view-container"
        className="flex overflow-x-auto scrollbar-none w-full"
      >
        <div
          id="payroll-pension-table-view-table-container"
          data-cy="payroll-pension-table-view-table-container"
          className="w-full"
        >
          <Table
            id="payroll-pension-table-view-table"
            data-cy="payroll-pension-table-view-table"
            dataSource={pensionRule ?? []}
            columns={columns}
            pagination={false}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Pension;
