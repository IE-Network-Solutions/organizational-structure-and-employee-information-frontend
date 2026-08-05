import React, { FC } from 'react';
import { Timeline } from 'antd';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import EmptyState from '@/components/empty';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';
import {
  ExternalTrainingApproval,
  ExternalTrainingApprovalAction,
  ExternalTrainingApprovalActionLabel,
  ExternalTrainingApprovalStageLabel,
} from '@/types/tna/externalTna';

interface ApprovalTimelineProps {
  approvals?: ExternalTrainingApproval[];
  className?: string;
}

const COLOR_BY_ACTION: Record<ExternalTrainingApprovalAction, string> = {
  [ExternalTrainingApprovalAction.SUBMITTED]: 'blue',
  [ExternalTrainingApprovalAction.APPROVED]: 'green',
  [ExternalTrainingApprovalAction.REJECTED]: 'red',
  [ExternalTrainingApprovalAction.CANCELLED]: 'gray',
  [ExternalTrainingApprovalAction.PAYMENT_CONFIRMED]: 'green',
  [ExternalTrainingApprovalAction.COMMITMENT_ACTIVATED]: 'blue',
  [ExternalTrainingApprovalAction.COMMITMENT_COMPLETED]: 'green',
};

/** Chronological audit trail of a request: submission through commitment. */
const ApprovalTimeline: FC<ApprovalTimelineProps> = ({
  approvals,
  className = '',
}) => {
  if (!approvals?.length) {
    return (
      <EmptyState
        compact
        title="No approval history"
        description="Actions taken on this request will appear here."
        data-cy="tna-approval-timeline-empty"
      />
    );
  }

  return (
    <div className={className} data-cy="tna-approval-timeline">
      <Timeline
        items={approvals.map((approval) => ({
          color: COLOR_BY_ACTION[approval.action] ?? 'blue',
          children: (
            <div
              className="flex flex-col gap-0.5"
              data-cy={`tna-approval-timeline-item-${approval.id}`}
            >
              <span
                data-cy="tna-approval-timeline-action"
                className="text-sm font-bold leading-[22px] text-black"
              >
                {ExternalTrainingApprovalActionLabel[approval.action] ??
                  approval.action}
                <span
                  data-cy="tna-approval-timeline-stage"
                  className="ml-2 text-xs font-normal text-black/45"
                >
                  {ExternalTrainingApprovalStageLabel[approval.stage] ??
                    approval.stage}
                </span>
              </span>
              <span
                data-cy="tna-approval-timeline-actor"
                className="text-xs leading-5 text-black/70"
              >
                by{' '}
                <EmployeeName
                  userId={approval.actedBy}
                  fallback="System"
                  className="font-medium"
                />
                {approval.actedAt
                  ? ` · ${dayjs(approval.actedAt).format(`${DATE_FORMAT} HH:mm`)}`
                  : ''}
              </span>
              {approval.remark ? (
                <span
                  className="mt-1 rounded-[6px] bg-black/[0.02] px-2 py-1 text-xs leading-5 text-black/70"
                  data-cy={`tna-approval-timeline-remark-${approval.id}`}
                >
                  {approval.remark}
                </span>
              ) : null}
            </div>
          ),
        }))}
      />
    </div>
  );
};

export default ApprovalTimeline;
