'use client';

import React, { useState } from 'react';
import { Table, Button, Tag } from 'antd';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import CheckInRuleDrawer from './check-in';
import { useGetCheckInRules } from '@/store/server/features/okrplanning/monitoring-evaluation/check-in-rule/queries';
import { useDeleteCheckInRule } from '@/store/server/features/okrplanning/monitoring-evaluation/check-in-rule/mutations';
import { CheckInRule } from '@/types/okr/check-in-rule';
import { useDefaultPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningPeriod } from '@/store/uistate/features/okrplanning/okrSetting/interface';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { useQueryClient } from 'react-query';

const CheckInRulePage: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Partial<CheckInRule> | null>(null);

  const { data: checkInRulesData, isLoading, error } = useGetCheckInRules();
  const { data: planningPeriodsData } = useDefaultPlanningPeriods();
  const { data: feedbackTypesData } = useFetchAllFeedbackTypes();
  const { mutate: deleteCheckInRule } = useDeleteCheckInRule();
  const queryClient = useQueryClient();

  // Extract rules from the response data - handle different possible structures
  let rules: CheckInRule[] = [];
  if (checkInRulesData) {
    if (Array.isArray(checkInRulesData)) {
      rules = checkInRulesData;
    } else if (checkInRulesData.items && Array.isArray(checkInRulesData.items)) {
      rules = checkInRulesData.items;
    }
  }

  const handleAddNew = () => {
    setSelectedRule(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record: CheckInRule) => {
    setSelectedRule(record);
    setIsDrawerOpen(true);
  };

  const handleDelete = (record: CheckInRule) => {
    deleteCheckInRule(record.id);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedRule(null);
  };

  const getAppliesToColor = (appliesTo: string) => {
    switch (appliesTo) {
      case 'Plan':
        return 'blue';
      case 'Report':
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Applies To',
      dataIndex: 'appliesTo',
      key: 'appliesTo',
      render: (appliesTo: string) => (
        <Tag color={getAppliesToColor(appliesTo)} className="font-medium">
          {appliesTo}
        </Tag>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (record: CheckInRule) => {
        const types = [];
        if (record.timeBased) types.push('Time-Based');
        if (record.achievementBased) types.push('Achievement-Based');
        return types.length > 0 ? types.join(', ') : 'None';
      },
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
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      render: (operation: string) => (
        <span className="text-gray-900">{operation}</span>
      ),
    },
    {
      title: 'Interval',
      key: 'interval',
      render: (record: CheckInRule) => {
        // Find the planning period name from the planning period ID
        const planningPeriod = planningPeriodsData?.items?.find(
          (period: PlanningPeriod) => period.id === record.planningPeriodId
        );
        
        return (
          <Tag color="cyan" className="font-medium">
            {planningPeriod?.name || 'Not Set'}
          </Tag>
        );
      },
    },

    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: string) => {
        // Find the category name from the feedback types data
        const feedbackType = feedbackTypesData?.items?.find(
          (type: FeedbackTypeItems) => type.id === categoryId
        );
        
        return (
          <Tag color="orange" className="font-medium">
            {feedbackType?.category || 'Unknown Category'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="flex space-x-2">
          <AccessGuard permissions={[Permissions.CreateOkrRule]}>
            <Button
              type="default"
              className="flex items-center space-x-1 bg-blue text-white hover:bg-sky-600 border-none"
              icon={<GrEdit />}
              onClick={() => handleEdit(record)}
            />
          </AccessGuard>
          <DeletePopover onDelete={() => handleDelete(record)}>
            <AccessGuard permissions={[Permissions.CreateOkrRule]}>
              <Button
                type="default"
                className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
                icon={<RiDeleteBin6Line />}
              />
            </AccessGuard>
          </DeletePopover>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Check-in Rule</h1>
        <AccessGuard permissions={[Permissions.CreateOkrRule]}>
          <Button
            type="primary"
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 flex items-center gap-2"
            icon={<FaPlus />}
          >
            Add New
          </Button>
        </AccessGuard>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table
          dataSource={rules}
          columns={columns}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: undefined, // Use default "No data found" message
          }}
          className="min-w-full"
        />
      </div>

      <CheckInRuleDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        checkInRule={selectedRule}
        onSuccess={() => {
          // Manually refetch the data
          if (checkInRulesData) {
            // Force a refetch by invalidating the query
            queryClient.invalidateQueries({ queryKey: ['checkInRule'] });
          }
        }}
      />

      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
          padding: 16px;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f9fafb;
        }

        /* Ensure table columns maintain proper widths */
        .ant-table {
          min-width: 1200px;
        }
        
        .ant-table-thead > tr > th,
        .ant-table-tbody > tr > td {
          white-space: nowrap;
          min-width: 120px;
        }
        
        /* Specific column widths */
        .ant-table-thead > tr > th:nth-child(1) { min-width: 150px; } /* Rule Name */
        .ant-table-thead > tr > th:nth-child(2) { min-width: 120px; } /* Applies To */
        .ant-table-thead > tr > th:nth-child(3) { min-width: 140px; } /* Type */
        .ant-table-thead > tr > th:nth-child(4) { min-width: 100px; } /* Frequency */
        .ant-table-thead > tr > th:nth-child(5) { min-width: 100px; } /* Operation */
        .ant-table-thead > tr > th:nth-child(6) { min-width: 120px; } /* Interval */
        .ant-table-thead > tr > th:nth-child(7) { min-width: 120px; } /* Action */
        .ant-table-thead > tr > th:nth-child(8) { min-width: 120px; } /* Category */
        .ant-table-thead > tr > th:nth-child(9) { min-width: 150px; } /* Actions */
      `}</style>
    </div>
  );
};

export default CheckInRulePage; 