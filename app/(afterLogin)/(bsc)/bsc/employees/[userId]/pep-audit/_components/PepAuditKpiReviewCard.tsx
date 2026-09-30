'use client';

import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Tag, Tooltip } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  LinkOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import KpiRejectModal from '@/app/(afterLogin)/(bsc)/bsc/_components/KpiRejectModal';
import ScoreProgressBar from '@/app/(afterLogin)/(bsc)/bsc/_components/ScoreProgressBar';
import { TargetMetricValue } from '@/app/(afterLogin)/(bsc)/bsc/_components/TargetValueCell';
import {
  useApproveKpiForPepAudit,
  useRejectKpiForPepAudit,
  useReturnUnrealisticKpiForPepAudit,
} from '@/store/server/features/bsc/mutation';
import {
  KpiApprovalStatus,
  PepAuditFlag,
  ScorecardKpiTarget,
} from '@/types/bsc';
import {
  resolvePepAuditFlag,
  achievedStretchTarget,
} from '@/utils/bsc/pepAudit';
import { targetScorePercent } from '@/utils/bsc/rollup';
import { normalizeRatio } from '@/utils/bsc/scoring';
import { bscAccess } from '@/utils/bsc/permissions';

function DataSourceReview({ url }: { url: string | null | undefined }) {
  if (!url?.trim()) {
    return (
      <span data-cy="auto-added" className="text-sm text-gray-500">
        No data source provided
      </span>
    );
  }
  const source = url.trim();
  const href = /^https?:\/\//i.test(source) ? source : `https://${source}`;
  return (
    <Tooltip title={source}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-[#1677ff] hover:underline"
        data-cy="bsc-pep-audit-data-source-link"
      >
        <LinkOutlined />
        Review data source
      </a>
    </Tooltip>
  );
}

/**
 * Achievement % of the reported (effective) value against target, with the
 * same threshold gate as BE scoring. Used before the card has a stored score.
 */
function reportedAchievementPercent(target: ScorecardKpiTarget): number | null {
  if (target.actualValue == null || target.targetValue == null) return null;
  const { ratio } = normalizeRatio(
    target.actualValue,
    target.targetValue,
    target.targetLogic,
    {
      worstCase: target.worstCase,
      bestCase: target.bestCase,
      acceptableThreshold: target.acceptableThreshold,
    },
  );
  return Math.round(ratio * 1000) / 10;
}

/** Auditor action just taken on this card (before the list refetch lands). */
type AuditOutcome = {
  kind: 'approved' | 'rejected' | 'returned';
  comment?: string;
};

type Props = {
  scorecardId: string;
  target: ScorecardKpiTarget;
  isLast?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (checked: boolean) => void;
};

export default function PepAuditKpiReviewCard({
  scorecardId,
  target,
  isLast = false,
  selectable = false,
  selected = false,
  onSelectedChange,
}: Props) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [unrealisticOpen, setUnrealisticOpen] = useState(false);
  /**
   * Outcome of the auditor's action on this card, applied as soon as the
   * request succeeds so the buttons lock immediately (the list refetch lands
   * a moment later and then drives the same state from server data).
   */
  const [localOutcome, setLocalOutcome] = useState<AuditOutcome | null>(null);

  // New server data for this KPI supersedes the local outcome.
  useEffect(() => {
    setLocalOutcome(null);
  }, [
    target.id,
    target.approvalStatus,
    target.pepAuditFlag,
    target.pepReturnReason,
    target.rejectionReason,
  ]);

  const { mutateAsync: approveAsync, isLoading: approveLoading } =
    useApproveKpiForPepAudit();
  const { mutateAsync: rejectAsync, isLoading: rejectLoading } =
    useRejectKpiForPepAudit();
  const { mutateAsync: returnAsync, isLoading: returnLoading } =
    useReturnUnrealisticKpiForPepAudit();

  const pepFlag = resolvePepAuditFlag(target);
  const isRejected =
    localOutcome?.kind === 'rejected' ||
    (!localOutcome && target.approvalStatus === KpiApprovalStatus.Rejected);
  const isReturnedToManager =
    localOutcome?.kind === 'returned' ||
    (!localOutcome &&
      target.approvalStatus === KpiApprovalStatus.Pending &&
      !!target.pepReturnReason?.trim());
  // "Approved" = PEP explicitly approved a manager-approved result — never
  // inferred from the threshold.
  const isApproved =
    localOutcome?.kind === 'approved' ||
    (!localOutcome &&
      target.approvalStatus === KpiApprovalStatus.Approved &&
      target.pepAuditFlag === PepAuditFlag.Realistic);
  const awaitingManager =
    !localOutcome &&
    !isRejected &&
    !isReturnedToManager &&
    target.approvalStatus === KpiApprovalStatus.Pending;
  // Result breaks the acceptable threshold → flag for the auditor.
  const isFlagged =
    !isApproved && !isRejected && pepFlag === PepAuditFlag.Unrealistic;
  // Reject resets progress for resubmission. Otherwise show the finalized
  // score, or — until the card is scored — the reported result's achievement
  // so the auditor can judge it.
  const progress = isRejected
    ? 0
    : (targetScorePercent(target) ?? reportedAchievementPercent(target));
  const hitStretch =
    !isRejected &&
    achievedStretchTarget(
      target.actualValue,
      target.stretchTarget,
      target.targetLogic,
    );
  // Approve / Unrealistic / Reject need "PEP Audit KPI Results".
  const awaitingPep =
    !localOutcome &&
    target.actualValue != null &&
    target.approvalStatus === KpiApprovalStatus.Approved &&
    (pepFlag === PepAuditFlag.Unrealistic ||
      pepFlag === PepAuditFlag.PendingReview);
  const canAct = bscAccess.pepAudit() && awaitingPep;
  const acting = approveLoading || rejectLoading || returnLoading;
  const rejectionReason =
    localOutcome?.kind === 'rejected'
      ? localOutcome.comment
      : target.rejectionReason;
  const returnReason =
    localOutcome?.kind === 'returned'
      ? localOutcome.comment
      : target.pepReturnReason;

  const handleApprove = async () => {
    await approveAsync({ scorecardId, targetId: target.id });
    setLocalOutcome({ kind: 'approved' });
  };

  const handleReject = async (comment: string) => {
    await rejectAsync({
      scorecardId,
      targetId: target.id,
      rejectionReason: comment,
    });
    setLocalOutcome({ kind: 'rejected', comment });
    setRejectOpen(false);
  };

  const handleUnrealisticReturn = async (comment: string) => {
    await returnAsync({
      scorecardId,
      targetId: target.id,
      returnReason: comment,
    });
    setLocalOutcome({ kind: 'returned', comment });
    setUnrealisticOpen(false);
  };

  return (
    <div
      className={`px-4 py-4 ${isLast ? '' : 'border-b border-[#F0F0F0]'}`}
      data-cy={`bsc-pep-audit-kpi-row-${target.id}`}
    >
      <div
        data-cy="auto-added"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div
          data-cy="auto-added"
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          {selectable ? (
            <Checkbox
              checked={selected}
              disabled={!canAct}
              onChange={(event) => onSelectedChange?.(event.target.checked)}
              className="mt-0.5"
              data-cy={`bsc-pep-audit-select-${target.id}`}
            />
          ) : null}
          <div data-cy="auto-added" className="min-w-0 flex-1">
            <p
              data-cy="auto-added"
              className="m-0 text-sm font-semibold text-gray-900"
            >
              {target.kpiName}
            </p>
            {isFlagged ? (
              <Tag
                color="red"
                className="m-0 mt-1 mr-1"
                data-cy={`bsc-pep-audit-flagged-${target.id}`}
              >
                Below acceptable threshold
              </Tag>
            ) : null}
            {hitStretch ? (
              <Tag
                color="purple"
                className="m-0 mt-1"
                data-cy={`bsc-pep-audit-stretch-achieved-${target.id}`}
              >
                Stretch achieved
              </Tag>
            ) : null}

            <div
              data-cy="auto-added"
              className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              <ScoreProgressBar
                value={progress}
                dataCy={`bsc-pep-audit-progress-${target.id}`}
                className="!min-w-[180px] !max-w-[280px]"
              />
              <div
                data-cy="auto-added"
                className="flex flex-wrap items-center gap-4 text-sm text-gray-600"
              >
                <span data-cy="auto-added">
                  Reported:{' '}
                  <TargetMetricValue
                    value={isRejected ? null : target.actualValue}
                    unit={target.measurementUnit}
                    worstCase={target.worstCase}
                    bestCase={target.bestCase}
                    dataCy={`bsc-pep-audit-actual-${target.id}`}
                  />
                </span>
                <span data-cy="auto-added">
                  Target:{' '}
                  <TargetMetricValue
                    value={target.targetValue}
                    unit={target.measurementUnit}
                    worstCase={target.worstCase}
                    bestCase={target.bestCase}
                    dataCy={`bsc-pep-audit-target-${target.id}`}
                  />
                </span>
                {target.stretchTarget != null ? (
                  <span data-cy="auto-added">
                    Stretch:{' '}
                    <TargetMetricValue
                      value={target.stretchTarget}
                      unit={target.measurementUnit}
                      worstCase={target.worstCase}
                      bestCase={target.bestCase}
                      dataCy={`bsc-pep-audit-stretch-${target.id}`}
                    />
                  </span>
                ) : null}
              </div>
            </div>

            <div data-cy="auto-added" className="mt-2">
              <DataSourceReview url={target.dataSource} />
            </div>

            {isReturnedToManager && returnReason ? (
              <p
                data-cy="auto-added"
                className="m-0 mt-2 text-sm text-amber-700"
              >
                Returned to manager: {returnReason}
              </p>
            ) : null}
            {isRejected && rejectionReason ? (
              <p
                data-cy={`bsc-pep-audit-rejection-reason-${target.id}`}
                className="m-0 mt-2 text-sm text-red-600"
              >
                Rejected: {rejectionReason}
              </p>
            ) : null}
          </div>
        </div>

        <div
          data-cy="auto-added"
          className="flex shrink-0 flex-wrap items-center gap-2"
        >
          {/* Rejected wins: it resets the KPI for the employee to resubmit. */}
          {isRejected ? (
            <Tag
              color="red"
              className="m-0"
              data-cy={`bsc-pep-audit-status-rejected-${target.id}`}
            >
              Rejected
            </Tag>
          ) : canAct ? (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                loading={approveLoading}
                disabled={acting && !approveLoading}
                onClick={handleApprove}
                data-cy={`bsc-pep-audit-approve-${target.id}`}
              >
                Approve
              </Button>
              <Button
                size="small"
                icon={<WarningOutlined />}
                loading={returnLoading}
                disabled={acting && !returnLoading}
                onClick={() => setUnrealisticOpen(true)}
                data-cy={`bsc-pep-audit-unrealistic-${target.id}`}
              >
                Unrealistic
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                loading={rejectLoading}
                disabled={acting && !rejectLoading}
                onClick={() => setRejectOpen(true)}
                data-cy={`bsc-pep-audit-reject-${target.id}`}
              >
                Reject
              </Button>
            </>
          ) : isApproved ? (
            <Tag
              color="green"
              className="m-0"
              data-cy={`bsc-pep-audit-status-approved-${target.id}`}
            >
              Approved
            </Tag>
          ) : isReturnedToManager ? (
            <Tag
              color="orange"
              className="m-0"
              data-cy={`bsc-pep-audit-status-returned-${target.id}`}
            >
              Returned to manager
            </Tag>
          ) : awaitingManager ? (
            <Tag
              color="blue"
              className="m-0"
              data-cy={`bsc-pep-audit-status-awaiting-manager-${target.id}`}
            >
              Pending evaluation
            </Tag>
          ) : awaitingPep ? (
            <Tag
              color="gold"
              className="m-0"
              data-cy={`bsc-pep-audit-status-pending-review-${target.id}`}
            >
              Pending PEP review
            </Tag>
          ) : null}
        </div>
      </div>

      <KpiRejectModal
        open={rejectOpen}
        mode="pep-reject"
        kpiName={target.kpiName}
        loading={rejectLoading}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
      <KpiRejectModal
        open={unrealisticOpen}
        mode="pep-unrealistic"
        kpiName={target.kpiName}
        loading={returnLoading}
        onClose={() => setUnrealisticOpen(false)}
        onConfirm={handleUnrealisticReturn}
      />
    </div>
  );
}
