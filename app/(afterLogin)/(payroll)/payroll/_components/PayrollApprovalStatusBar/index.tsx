'use client';

import React from 'react';
import { Button, Popconfirm, Skeleton, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, UndoOutlined } from '@ant-design/icons';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRevokePayrollApproval } from '@/store/server/features/payroll/payrollApproval/mutation';
import {
  PayrollApprovalLevelStatus,
  usePayrollApprovalStatus,
} from '@/store/server/features/payroll/payrollApproval/usePayrollApprovalStatus';
import {
  GENERATION_TYPE_LABEL,
  PayrollGenerationType,
} from '@/store/server/features/payroll/payrollApproval/generationTypes';

type LevelStatus = PayrollApprovalLevelStatus['status'];

const STATUS_LABEL: Record<LevelStatus, string> = {
  Approved: 'Approved',
  Pending: 'Pending',
  Rejected: 'Rejected',
  Waiting: 'Waiting',
};

const DOT_CLASS: Record<LevelStatus, string> = {
  Approved: 'border-green-600 bg-green-600 text-white',
  Pending: 'border-okr-primary bg-blue-50 text-okr-primary',
  Rejected: 'border-red-600 bg-red-600 text-white',
  Waiting: 'border-slate-200 bg-white text-slate-300',
};

const STATUS_TEXT_CLASS: Record<LevelStatus, string> = {
  Approved: 'text-green-600',
  Pending: 'text-okr-primary',
  Rejected: 'text-red-600',
  Waiting: 'text-[#8F94A3]',
};

/** One summary chip for the whole generation, from its approval levels. */
function getOverallStatus(
  levels: PayrollApprovalLevelStatus[],
  isFullyApproved: boolean,
): { label: string; chipClass: string } {
  if (isFullyApproved) {
    return { label: 'Approved', chipClass: 'bg-green-50 text-green-700' };
  }
  if (levels.some((level) => level.status === 'Rejected')) {
    return { label: 'Rejected', chipClass: 'bg-red-50 text-red-700' };
  }
  const pending = levels.find((level) => level.status === 'Pending');
  return {
    label: pending ? `Pending · Level ${pending.stepOrder}` : 'Waiting',
    chipClass: pending
      ? 'bg-amber-50 text-amber-700'
      : 'bg-slate-100 text-slate-500',
  };
}

function ApprovalStep({
  level,
  name,
  isLast,
}: {
  level: PayrollApprovalLevelStatus;
  name: string;
  isLast: boolean;
}) {
  return (
    <Tooltip
      title={`${STATUS_LABEL[level.status]}: ${name}`}
      data-cy={`payroll-approval-level-tooltip-${level.stepOrder}`}
    >
      <li
        className="flex min-w-0 items-start gap-2"
        data-cy={`payroll-approval-level-${level.stepOrder}`}
      >
        <div
          className="flex flex-col items-center self-stretch"
          data-cy={`payroll-approval-level-rail-${level.stepOrder}`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
              DOT_CLASS[level.status]
            }`}
            data-cy={`payroll-approval-level-dot-${level.stepOrder}`}
          >
            {level.status === 'Approved' && <CheckOutlined />}
            {level.status === 'Rejected' && <CloseOutlined />}
            {level.status === 'Pending' && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-okr-primary"
                data-cy={`payroll-approval-level-pending-dot-${level.stepOrder}`}
              />
            )}
          </span>
          {!isLast && (
            <span
              className={`mt-1 w-px flex-1 ${
                level.status === 'Approved' ? 'bg-green-600' : 'bg-slate-200'
              }`}
              data-cy={`payroll-approval-connector-${level.stepOrder}`}
            />
          )}
        </div>
        <div
          className="min-w-0 pb-2"
          data-cy={`payroll-approval-level-text-${level.stepOrder}`}
        >
          <p
            className={`m-0 truncate text-[13px] font-medium leading-5 ${
              level.status === 'Waiting' ? 'text-[#8F94A3]' : 'text-[#161A2C]'
            }`}
            title={name}
            data-cy={`payroll-approval-level-name-${level.stepOrder}`}
          >
            {name}
          </p>
          <p
            className={`m-0 text-[11px] leading-4 ${
              STATUS_TEXT_CLASS[level.status]
            }`}
            data-cy={`payroll-approval-level-status-${level.stepOrder}`}
          >
            {STATUS_LABEL[level.status]}
          </p>
        </div>
      </li>
    </Tooltip>
  );
}

type PayrollApprovalStatusBarProps = {
  payPeriodId: string;
  /** Which generation of the pay period this approval belongs to. */
  generationType?: PayrollGenerationType;
};

const CARD_CLASS =
  'flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 transition-shadow hover:shadow-sm';

/** Approval card of one generation (payroll, PP monthly, PP quarterly, incentive). */
const PayrollApprovalStatusBar = ({
  payPeriodId,
  generationType = 'PAYROLL',
}: PayrollApprovalStatusBarProps) => {
  const {
    approvalLevels,
    isLoading,
    isFullyApproved,
    hasWorkflow,
    getApproverName,
  } = usePayrollApprovalStatus(payPeriodId, generationType);
  const { userId } = useAuthenticationStore();
  const { mutate: revokeApproval, isLoading: isRevoking } =
    useRevokePayrollApproval();

  if (!hasWorkflow && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={CARD_CLASS} data-cy="payroll-approval-status-loading">
        <Skeleton active title={{ width: 96 }} paragraph={{ rows: 2 }} />
      </div>
    );
  }

  if (!approvalLevels.length) {
    return null;
  }

  const overall = getOverallStatus(approvalLevels, isFullyApproved);
  // The server re-checks this; here it only decides whether to offer the action.
  const canRevoke =
    isFullyApproved &&
    approvalLevels.some(
      (level) => level.displayUserId === userId || level.userId === userId,
    );
  const typeLabel = GENERATION_TYPE_LABEL[generationType];

  return (
    <section
      className={CARD_CLASS}
      aria-label={`${GENERATION_TYPE_LABEL[generationType]} approval`}
      data-cy={`payroll-approval-status-bar-${generationType}`}
    >
      <header
        className="flex items-center justify-between gap-2"
        data-cy={`payroll-approval-status-header-${generationType}`}
      >
        <h4
          className="m-0 truncate text-sm font-semibold text-[#161A2C]"
          data-cy={`payroll-approval-status-type-${generationType}`}
        >
          {GENERATION_TYPE_LABEL[generationType]}
        </h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${overall.chipClass}`}
          data-cy={`payroll-approval-status-chip-${generationType}`}
        >
          {overall.label}
        </span>
      </header>

      <ol
        className="m-0 flex list-none flex-col p-0"
        data-cy="payroll-approval-status-levels"
      >
        {approvalLevels.map((level, idx) => (
          <ApprovalStep
            key={level.stepOrder}
            level={level}
            name={getApproverName(level.displayUserId) || '—'}
            isLast={idx === approvalLevels.length - 1}
          />
        ))}
      </ol>

      {canRevoke && (
        <footer
          className="flex justify-end border-t border-slate-100 pt-3"
          data-cy={`payroll-approval-status-footer-${generationType}`}
        >
          <Popconfirm
            title={`Revoke ${typeLabel} approval?`}
            description="The approval restarts from the first level and every approver has to approve again. Until then this generation can be regenerated."
            okText="Revoke"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            placement="topRight"
            onConfirm={() => revokeApproval({ payPeriodId, generationType })}
            data-cy={`payroll-approval-revoke-popconfirm-${generationType}`}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<UndoOutlined />}
              loading={isRevoking}
              data-cy={`payroll-approval-revoke-button-${generationType}`}
            >
              Revoke approval
            </Button>
          </Popconfirm>
        </footer>
      )}
    </section>
  );
};

export default PayrollApprovalStatusBar;
