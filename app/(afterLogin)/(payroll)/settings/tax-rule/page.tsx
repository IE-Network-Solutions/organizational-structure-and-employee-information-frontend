'use client';
import React from 'react';
import { Table, Button, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Drawer from './_components/drawer';
import { useGetTaxRule } from '@/store/server/features/payroll/setting/tax-rule/queries';
import { useDeleteTaxRule } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/taxRules/taxRulesStore';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { FaPlus } from 'react-icons/fa';

interface TaxRule {
  id: string;
  key: string;
  name: string;
  range: string;
  minIncome: number;
  maxIncome: number;
  rate: number;
  deduction: number;
}

const TaxRules = () => {
  const { openDrawer, setCurrentTaxRule } = useDrawerStore();

  const { data, isLoading } = useGetTaxRule();
  const { mutate: deleteTaxRule } = useDeleteTaxRule();

  const columns: Array<{
    title: string;
    dataIndex?: keyof TaxRule;
    key: string;
    sorter?: (a: TaxRule, b: TaxRule) => number;
    render?: (text: any, record: TaxRule) => React.ReactNode;
  }> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Range',
      key: 'range',
      sorter: (a, b) => a.minIncome - b.minIncome,

      render: (notused: any, record: TaxRule) => {
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
      sorter: (a, b) => a.rate - b.rate,
    },
    {
      title: 'Deduction',
      dataIndex: 'deduction',
      key: 'deduction',
      sorter: (a, b) => a.deduction - b.deduction,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="primary"
              className=" border-none rounded-xl"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <DeletePopover onDelete={() => handleDelete(record.id)}>
            <Button
              className="bg-red-600 text-white border-none rounded-xl"
              icon={<DeleteOutlined />}
            />
          </DeletePopover>
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
    <div className="p-5 rounded-2xl bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg text-bold">Tax Rule</h1>
        <Button
          type="primary"
          className="h-10 w-10 sm:w-auto bg-[#3636f0]"
          icon={<FaPlus />}
          onClick={handleAddRule}
        >
          <span className="hidden sm:inline">Add Tax Rule</span>
        </Button>
      </div>
      <div className="flex overflow-x-auto scrollbar-none w-full">
        <div className="w-full">
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            bordered={false}
            loading={isLoading}
          />
        </div>
      </div>
      <Drawer />
    </div>
  );
};

export default TaxRules;
