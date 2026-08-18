'use client';

import React, { useEffect } from 'react';
import { Avatar, Table, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePayrollActivityLogStore } from '@/store/uistate/features/payroll/activityLog';
import { PayrollActivityAction } from '../payPeriodSelect/mockPayPeriods';
import EmptyState from '@/components/empty';

const ACTION_COLORS: Record<PayrollActivityAction, string> = {
  Generated: 'green',
  Regenerated: 'blue',
  Approved: 'purple',
  Exported: 'cyan',
  'Payslip Sent': 'geekblue',
  Reconciled: 'gold',
};

interface ActivityLogTabProps {
  payPeriodId: string;
}

const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ payPeriodId }) => {
  const logsByPeriod = usePayrollActivityLogStore(
    (state) => state.logsByPeriod,
  );
  const getLogs = usePayrollActivityLogStore((state) => state.getLogs);

  useEffect(() => {
    getLogs(payPeriodId);
  }, [getLogs, payPeriodId]);

  const logs = logsByPeriod[payPeriodId] ?? [];

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: PayrollActivityAction) => (
        <Tag
          color={ACTION_COLORS[action] || 'default'}
          className="capitalize text-sm"
          style={{ border: 'none' }}
          data-cy={`payroll-activity-log-action-tag-${action}`}
        >
          {action}
        </Tag>
      ),
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      render: (
        _unused: unknown,
        record: {
          id: string;
          performedBy: { firstName: string; lastName: string };
        },
      ) => {
        const fullName =
          `${record.performedBy.firstName || ''} ${record.performedBy.lastName || ''}`.trim();
        return (
          <div
            className="flex items-center gap-2"
            data-cy={`payroll-activity-log-performed-by-${record.id}`}
          >
            <Avatar size={32} icon={<UserOutlined />} />
            <span
              className="text-sm"
              data-cy={`payroll-activity-log-user-name-${record.id}`}
            >
              {fullName || 'Unknown User'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Performed At',
      dataIndex: 'performedAt',
      key: 'performedAt',
      render: (date: string, record: { id: string }) => (
        <span
          className="text-sm"
          data-cy={`payroll-activity-log-performed-at-${record.id}`}
        >
          {dayjs(date).format('MMM DD, YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (remarks: string, record: { id: string }) => (
        <span
          className="text-sm text-gray-600"
          data-cy={`payroll-activity-log-remarks-${record.id}`}
        >
          {remarks || '--'}
        </span>
      ),
    },
  ];

  return (
    <div
      id="payroll-activity-log-tab-view-container"
      data-cy="payroll-activity-log-tab-view-container"
      className="w-full"
    >
      <Table
        id="payroll-activity-log-table"
        data-cy="payroll-activity-log-table"
        rowKey="id"
        pagination={false}
        dataSource={logs}
        columns={columns}
        locale={{
          emptyText: (
            <EmptyState
              minimal
              description="No activity recorded for this pay period"
              data-cy="payroll-activity-log-empty"
            />
          ),
        }}
      />
    </div>
  );
};

export default ActivityLogTab;
