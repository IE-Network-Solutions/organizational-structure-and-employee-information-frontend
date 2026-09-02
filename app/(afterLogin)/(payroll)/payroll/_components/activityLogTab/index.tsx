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
  'Payslip Generated': 'lime',
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
      minWidth: 150,
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
      minWidth: 200,
      render: (
        performedBy: unknown,
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
      minWidth: 180,
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
      minWidth: 240,
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
      className="payroll-table-scroll-host w-full overflow-x-auto scrollbar-none rounded-lg overflow-hidden"
    >
      <Table
        id="payroll-activity-log-table"
        data-cy="payroll-activity-log-table"
        className="payroll-table"
        rowKey="id"
        pagination={false}
        dataSource={logs}
        columns={columns}
        locale={{
          emptyText: (
            <div
              className="payroll-table-empty-viewport-center py-10"
              data-cy="payroll-activity-log-empty-wrap"
            >
              <EmptyState
                minimal
                description="No activity recorded for this pay period"
                data-cy="payroll-activity-log-empty"
                className="!py-2"
              />
            </div>
          ),
        }}
      />
    </div>
  );
};

export default ActivityLogTab;
