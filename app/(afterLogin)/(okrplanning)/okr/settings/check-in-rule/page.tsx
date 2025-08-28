'use client';

import React, { useState } from 'react';
import { Button, Table, Tag } from 'antd';
import { FaPlus } from 'react-icons/fa';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CheckInRuleDrawer from './check-in';

interface CheckInRule {
  id: string;
  name: string;
  description: string;
  ruleAppliesTo: string;
  planningPeriod: string;
  ruleType: string;
  frequency: number;
  operation: string;
  action: string;
  category: string;
}

const CheckInRulePage: React.FC = () => {
  const [rules, setRules] = useState<CheckInRule[]>([
    {
      id: '1',
      name: '80% Streak Rule',
      description: 'Rule for tracking 80% achievement streak',
      ruleAppliesTo: 'Plan',
      planningPeriod: 'Weekly',
      ruleType: 'Achievement-Based',
      frequency: 1,
      operation: 'check-in',
      action: 'Reprimand',
      category: 'KPI',
    },
    {
      id: '2',
      name: 'Deadline Planning Rule',
      description: 'Rule for deadline compliance tracking',
      ruleAppliesTo: 'Objective',
      planningPeriod: 'Daily',
      ruleType: 'Time-Based',
      frequency: 3,
      operation: 'review',
      action: 'Appreciation',
      category: 'Milestone',
    },
    {
      id: '3',
      name: 'Weekly Achievement Benchmark',
      description: 'Weekly achievement tracking rule',
      ruleAppliesTo: 'KeyResult',
      planningPeriod: 'Monthly',
      ruleType: 'Both',
      frequency: 2,
      operation: 'evaluation',
      action: 'Appreciation',
      category: 'Milestone',
    },
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CheckInRule | null>(null);

  const handleAddNew = () => {
    setSelectedRule(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (rule: CheckInRule) => {
    setSelectedRule(rule);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedRule(null);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Reprimand':
        return 'red';
      case 'Appreciation':
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Rule',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Interval',
      dataIndex: 'planningPeriod',
      key: 'planningPeriod',
      render: (text: string) => (
        <span className="text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (text: number) => (
        <span className="text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={getActionColor(action)} className="font-medium">
          {action}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <span className="text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CheckInRule) => (
        <AccessGuard permissions={[Permissions.CreateOkrRule]}>
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Button>
        </AccessGuard>
      ),
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Check-in Rule</h2>
        <AccessGuard permissions={[Permissions.CreateOkrRule]}>
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 h-10 flex items-center gap-2"
            icon={<FaPlus className="text-xs" />}
            onClick={handleAddNew}
          >
             Add New
          </Button>
        </AccessGuard>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <Table
          dataSource={rules}
          columns={columns}
          pagination={false}
          rowKey="id"
          className="custom-table"
          components={{
            header: {
              cell: (props: any) => (
                <th className="bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-500 border-b border-gray-200">
                  {props.children}
                </th>
              ),
            },
            body: {
              row: (props: any) => (
                <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  {props.children}
                </tr>
              ),
              cell: (props: any) => (
                <td className="px-4 py-4 text-sm text-gray-900">
                  {props.children}
                </td>
              ),
            },
          }}
        />
      </div>

      {/* Check-in Rule Drawer */}
      <CheckInRuleDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        checkInRule={selectedRule}
      />

      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
          padding: 12px 16px !important;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 16px !important;
        }
        
        .custom-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f9fafb !important;
        }
      `}</style>
    </div>
  );
};

export default CheckInRulePage; 