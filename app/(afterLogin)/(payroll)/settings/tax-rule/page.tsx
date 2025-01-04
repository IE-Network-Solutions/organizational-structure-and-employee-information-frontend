'use client';
import React from 'react';
import { Table, Button, Space, Tooltip, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Drawer from './_components/drawer';
import { useGetTaxRule } from '@/store/server/features/payroll/setting/tax-rule/queries';
import { useDeleteTaxRule } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/taxRules/taxRulesStore';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
const { Title } = Typography;

const TaxRules = () => {
  const { openDrawer, setCurrentTaxRule } = useDrawerStore();

  const { data, isLoading } = useGetTaxRule();
  const { mutate: deleteTaxRule } = useDeleteTaxRule();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Range',
      dataIndex: 'range',
      key: 'range',
      render: (notused: any, record: any) => {
        const { minIncome, maxIncome } = record;
        return (
          <span>
            {minIncome} - {maxIncome}
          </span>
        );
      },
    },
    {
      title: 'Tax Rate',
      dataIndex: 'rate',
      key: 'rate',
    },
    {
      title: 'Deduction',
      dataIndex: 'deduction',
      key: 'deduction',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
          <AccessGuard permissions={[Permissions.UpdateTaxRule]}>
            <Tooltip title="Edit">
              <Button
                type="primary"
                className=" border-none rounded-xl"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          </AccessGuard>
          <AccessGuard permissions={[Permissions.DeleteTaxRule]}>
          <DeletePopover onDelete={() => handleDelete(record.id)}>
            <Button
              className="bg-red-600 text-white border-none rounded-xl"
              icon={<DeleteOutlined />}
            />
          </DeletePopover>
          </AccessGuard>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: any) => {
    setCurrentTaxRule(record);
    openDrawer();
  };

  const handleDelete = (record: any) => {
    deleteTaxRule(record);
  };

  const handleAddRule = () => {
    openDrawer();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Tax Rule</Title>
        <AccessGuard permissions={[Permissions.CreateTaxRule]}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRule}>
            Add Tax Rule
          </Button>
        </AccessGuard>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        bordered
        loading={isLoading}
      />
      <Drawer />
    </div>
  );
};

export default TaxRules;
