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
          <span
            id={`payroll-tax-rule-range-view-text-${record.id}`}
            data-cy={`payroll-tax-rule-range-view-text-${record.id}`}
          >
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
        <Space
          id={`payroll-tax-rule-actions-view-space-${record.id}`}
          data-cy={`payroll-tax-rule-actions-view-space-${record.id}`}
          size="middle"
        >
          <Tooltip data-cy={`payroll-tax-rule-edit-click-button-tooltip-${record.id}`} title="Edit">
            <Button
              id={`payroll-tax-rule-edit-click-button-${record.id}`}
              data-cy={`payroll-tax-rule-edit-click-button-${record.id}`}
              type="primary"
              className=" border-none rounded-xl"
              icon={<EditOutlined data-cy={`payroll-tax-rule-edit-click-button-icon-${record.id}`} />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

            <DeletePopover data-cy={`payroll-tax-rule-delete-popover-view-component-${record.id}`} onDelete={() => handleDelete(record.id)}>
              <Button
                id={`payroll-tax-rule-delete-click-button-${record.id}`}
                data-cy={`payroll-tax-rule-delete-click-button-${record.id}`}
                className="bg-red-600 text-white border-none rounded-xl"
                icon={<DeleteOutlined data-cy={`payroll-tax-rule-delete-click-button-icon-${record.id}`} />}
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
    <div
      id="payroll-tax-rule-page-view-container"
      data-cy="payroll-tax-rule-page-view-container"
      className="p-5 rounded-2xl bg-white"
    >
      <div
        id="payroll-tax-rule-header-view-container"
        data-cy="payroll-tax-rule-header-view-container"
        className="flex justify-between items-center mb-4"
      >
        <h1
          id="payroll-tax-rule-title-view-text"
          data-cy="payroll-tax-rule-title-view-text"
          className="text-lg text-bold"
        >
          Tax Rule
        </h1>
        <Button
          id="payroll-tax-rule-add-click-button"
          data-cy="payroll-tax-rule-add-click-button"
          type="primary"
          className="h-10 w-10 sm:w-auto bg-[#3636f0]"
          icon={<FaPlus data-cy="payroll-tax-rule-add-click-button-icon" />}
          onClick={handleAddRule}
        >
          <span id="payroll-tax-rule-add-click-button-text" data-cy="payroll-tax-rule-add-click-button-text" className="hidden sm:inline">Add Tax Rule</span>
        </Button>
      </div>
      <div
        id="payroll-tax-rule-table-wrapper-view-container"
        data-cy="payroll-tax-rule-table-wrapper-view-container"
        className="flex overflow-x-auto scrollbar-none w-full"
      >
        <div
          id="payroll-tax-rule-table-inner-view-container"
          data-cy="payroll-tax-rule-table-inner-view-container"
          className="w-full"
        >
          <Table
            id="payroll-tax-rule-table-view-table"
            data-cy="payroll-tax-rule-table-view-table"
            dataSource={data}
            columns={columns}
            pagination={false}
            bordered={false}
            loading={isLoading}
          />
        </div>
      </div>
        <Drawer data-cy="payroll-tax-rule-drawer-view-component" />
    </div>
  );
};

export default TaxRules;
