'use client';

import React from 'react';
import { Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import {
  EmployeeScorecard,
  KpiApprovalStatus,
  PepAuditRow,
  ScorecardKpiTarget,
} from '@/types/bsc';
import { PepAuditWorkflowStepsAggregate } from '@/app/(afterLogin)/(bsc)/bsc/my-scorecard/_components/PepAuditWorkflowSteps';
import type { PepAuditBarParticipants } from '@/app/(afterLogin)/(bsc)/bsc/_components/PepAuditApprovalStatusBar';
import {
  resolveScorecardResultsStatus,
  type ResultsApprovalStatus,
} from '@/utils/bsc/pepAuditGroups';
import { rowNeedsPepAction } from '@/utils/bsc/pepAuditWorkflow';
import PepAuditKpiReviewCard from './PepAuditKpiReviewCard';

const periodTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';

type Props = {
  scorecard: EmployeeScorecard;
  periodLabel: string;
  isCurrentPeriod?: boolean;
  pepRows: PepAuditRow[];
  participants: PepAuditBarParticipants;
  scrollRef?: React.Ref<HTMLDivElement>;
  isKpiSelected?: (targetId: string) => boolean;
  onKpiSelectedChange?: (targetId: string, checked: boolean) => void;
};

function isPepAuditVisibleTarget(target: ScorecardKpiTarget): boolean {
  if (target.actualValue != null) return true;
  return (
    target.approvalStatus === KpiApprovalStatus.Rejected &&
    !!target.rejectionReason?.trim()
  );
}

function reportedTargets(scorecard: EmployeeScorecard): ScorecardKpiTarget[] {
  return scorecard.targets
    .filter(isPepAuditVisibleTarget)
    .sort((a, b) => a.kpiName.localeCompare(b.kpiName));
}

const PERIOD_STATUS_LABEL: Record<ResultsApprovalStatus, string> = {
  approved: 'Fully approved',
  returned: 'Rejected',
  'awaiting-manager': 'Awaiting manager',
  'awaiting-pep': 'Awaiting PEP review',
  'no-reports': 'No reports',
};

function PeriodStatusBadge({
  status,
  dataCy,
}: {
  status: ResultsApprovalStatus;
  dataCy: string;
}) {
  if (status === 'no-reports') return null;

  if (status === 'approved') {
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1.5 rounded border border-[#b7eb8f] bg-[#f6ffed] px-2 py-0.5 text-xs font-medium text-[#389e0d]"
        data-cy={dataCy}
      >
        <CheckOutlined className="text-[11px]" />
        {PERIOD_STATUS_LABEL[status]}
      </span>
    );
  }

  const color =
    status === 'returned'
      ? 'red'
      : status === 'awaiting-pep'
        ? 'blue'
        : 'default';

  return (
    <Tag color={color} className="m-0 shrink-0" data-cy={dataCy}>
      {PERIOD_STATUS_LABEL[status]}
    </Tag>
  );
}

export default function PepAuditPeriodCard({
  scorecard,
  periodLabel,
  isCurrentPeriod = false,
  pepRows,
  participants,
  scrollRef,
  isKpiSelected,
  onKpiSelectedChange,
}: Props) {
  const targets = reportedTargets(scorecard);
  const periodStatus = resolveScorecardResultsStatus(pepRows, scorecard.status);
  const showWorkflowBar = isCurrentPeriod && pepRows.length > 0;
  const actionableTargetIds = new Set(
    pepRows.filter(rowNeedsPepAction).map((row) => row.targetId),
  );

  return (
    <div
      ref={scrollRef}
      id={`pep-audit-period-${scorecard.id}`}
      className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-none"
      data-cy={`bsc-pep-audit-period-${scorecard.id}`}
    >
      <div
        className="border-b border-[#F0F0F0] p-4"
        data-cy="bsc-pep-audit-period-header"
      >
        <div
          data-cy="auto-added"
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div data-cy="auto-added" className="min-w-0 flex-1">
            <h2
              data-cy="auto-added"
              className="m-0 text-xl font-bold text-gray-900"
            >
              {scorecard.userName}
            </h2>
            <p data-cy="auto-added" className="m-0 mt-1 text-sm text-gray-500">
              {scorecard.departmentName || '—'}
              {scorecard.positionTitle ? ` · ${scorecard.positionTitle}` : ''}
            </p>
            <div data-cy="auto-added" className="mt-2">
              {isCurrentPeriod ? (
                <Tag
                  className="m-0 h-5 shrink-0 rounded border border-[#b7eb8f] bg-[#f6ffed] px-1.5 text-[11px] font-normal leading-5 text-[#389e0d]"
                  data-cy="bsc-pep-audit-period-current"
                >
                  Current period
                </Tag>
              ) : (
                <Tag
                  className={`${periodTagClassName} shrink-0`}
                  data-cy="bsc-pep-audit-period-tag"
                >
                  {periodLabel}
                </Tag>
              )}
            </div>
          </div>
          {showWorkflowBar ? (
            <PepAuditWorkflowStepsAggregate
              rows={pepRows}
              participants={participants}
              dataCy={`bsc-pep-audit-approval-bar-${scorecard.id}`}
              className="ml-auto w-full max-w-[50%] shrink-0 justify-end"
            />
          ) : pepRows.length > 0 ? (
            <PeriodStatusBadge
              status={periodStatus}
              dataCy={`bsc-pep-audit-period-status-${scorecard.id}`}
            />
          ) : null}
        </div>
      </div>

      <div data-cy="bsc-pep-audit-period-kpis">
        {targets.length ? (
          targets.map((target, index) => (
            <PepAuditKpiReviewCard
              key={target.id}
              scorecardId={scorecard.id}
              target={target}
              isLast={index === targets.length - 1}
              selectable={actionableTargetIds.has(target.id)}
              selected={isKpiSelected?.(target.id) ?? false}
              onSelectedChange={(checked) =>
                onKpiSelectedChange?.(target.id, checked)
              }
            />
          ))
        ) : (
          <p
            data-cy="auto-added"
            className="m-0 px-4 py-6 text-center text-sm text-gray-400"
          >
            No reported KPIs for this period.
          </p>
        )}
      </div>
    </div>
  );
}
