'use client';

import React from 'react';
import { Skeleton, Tooltip } from 'antd';
import {
  PayrollApprovalLevelStatus,
  usePayrollApprovalStatus,
} from '@/store/server/features/payroll/payrollApproval/usePayrollApprovalStatus';

const STATUS_LABEL: Record<PayrollApprovalLevelStatus['status'], string> = {
  Approved: 'Approved',
  Pending: 'Pending',
  Rejected: 'Rejected',
  Waiting: 'Waiting',
};

function ApprovalLevelItem({
  level,
  getApproverName,
  showConnector,
  connectorActive,
}: {
  level: PayrollApprovalLevelStatus;
  getApproverName: (userId: string) => string;
  showConnector: boolean;
  connectorActive: boolean;
}) {
  const name = getApproverName(level.displayUserId) || '—';

  return (
    <>
      {showConnector && (
        <div
          className="hidden h-0.5 min-w-[8px] flex-1 sm:block"
          style={{
            backgroundColor: connectorActive ? '#16A34A' : '#E5E7EB',
          }}
          data-cy={`payroll-approval-connector-${level.stepOrder}`}
        />
      )}
      <Tooltip title={`${STATUS_LABEL[level.status]}: ${name}`}>
        <div
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 text-center"
          data-cy={`payroll-approval-level-${level.stepOrder}`}
        >
          {/* <p className="m-0 text-[10px] text-gray-500">Level {level.stepOrder}</p> */}
          <p
            className={`m-0 line-clamp-2 w-full text-[11px] leading-tight ${
              level.status === 'Waiting'
                ? 'text-gray-400'
                : 'font-medium text-gray-800'
            }`}
            title={name}
            data-cy={`payroll-approval-level-name-${level.stepOrder}`}
          >
            {name}
          </p>
          <span
            className={`text-[10px] leading-none ${
              level.status === 'Approved'
                ? 'text-[#16A34A]'
                : level.status === 'Pending'
                  ? 'text-[#1677FF]'
                  : level.status === 'Rejected'
                    ? 'text-[#DC2626]'
                    : 'text-gray-400'
            }`}
            data-cy={`payroll-approval-level-status-${level.stepOrder}`}
          >
            {STATUS_LABEL[level.status]}
          </span>
        </div>
      </Tooltip>
    </>
  );
}

type PayrollApprovalStatusBarProps = {
  payPeriodId: string;
};

const BAR_WRAPPER_CLASS =
  'w-full lg:ml-auto lg:w-1/3 lg:max-w-[360px] lg:shrink-0';

const PayrollApprovalStatusBar = ({
  payPeriodId,
}: PayrollApprovalStatusBarProps) => {
  const { approvalLevels, isLoading, hasWorkflow, getApproverName } =
    usePayrollApprovalStatus(payPeriodId);

  if (!hasWorkflow && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className={`${BAR_WRAPPER_CLASS} flex items-center justify-end gap-2`}
        data-cy="payroll-approval-status-loading"
      >
        {Array.from({ length: 2 }).map((unusedItem, idx) => (
          <div
            key={`payroll-approval-skeleton-${idx}`}
            className="flex flex-1 flex-col items-center gap-1"
            data-cy={`payroll-approval-skeleton-${idx}`}
          >
            <Skeleton.Input
              active
              size="small"
              style={{ width: 48, height: 10 }}
            />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 64, height: 12 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!approvalLevels.length) {
    return null;
  }

  return (
    <div
      className={`${BAR_WRAPPER_CLASS} flex min-w-0 items-center justify-end`}
      data-cy="payroll-approval-status-bar"
    >
      <div
        className="flex w-full min-w-0 items-center"
        data-cy="payroll-approval-status-levels"
      >
        {approvalLevels.map((level, idx) => {
          const previousLevel = idx > 0 ? approvalLevels[idx - 1] : null;
          const connectorActive =
            previousLevel?.status === 'Approved' && level.status !== 'Waiting';

          return (
            <React.Fragment key={level.stepOrder}>
              <ApprovalLevelItem
                level={level}
                getApproverName={getApproverName}
                showConnector={idx > 0}
                connectorActive={connectorActive}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PayrollApprovalStatusBar;
