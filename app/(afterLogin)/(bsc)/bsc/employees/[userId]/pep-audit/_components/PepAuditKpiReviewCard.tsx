'use client';

import React, { useState } from 'react';
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
import { resolvePepAuditFlag } from '@/utils/bsc/pepAudit';
import { targetScorePercent } from '@/utils/bsc/rollup';

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

  const { mutateAsync: approveAsync, isLoading: approveLoading } =
    useApproveKpiForPepAudit();
  const { mutateAsync: rejectAsync, isLoading: rejectLoading } =
    useRejectKpiForPepAudit();
  const { mutateAsync: returnAsync, isLoading: returnLoading } =
    useReturnUnrealisticKpiForPepAudit();

  const pepFlag = resolvePepAuditFlag(target);
  const isRejected = target.approvalStatus === KpiApprovalStatus.Rejected;
  const progress = isRejected ? 0 : targetScorePercent(target);
  const isReturnedToManager =
    target.approvalStatus === KpiApprovalStatus.Pending &&
    !!target.pepReturnReason?.trim();
  const isApproved = pepFlag === PepAuditFlag.Realistic;
  const canAct =
    target.actualValue != null &&
    target.approvalStatus === KpiApprovalStatus.Approved &&
    (pepFlag === PepAuditFlag.Unrealistic ||
      pepFlag === PepAuditFlag.PendingReview);
  const acting = approveLoading || rejectLoading || returnLoading;

  const handleApprove = async () => {
    await approveAsync({ scorecardId, targetId: target.id });
  };

  const handleReject = async (comment: string) => {
    await rejectAsync({
      scorecardId,
      targetId: target.id,
      rejectionReason: comment,
    });
    setRejectOpen(false);
  };

  const handleUnrealisticReturn = async (comment: string) => {
    await returnAsync({
      scorecardId,
      targetId: target.id,
      returnReason: comment,
    });
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
                    value={target.actualValue}
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
              </div>
            </div>

            <div data-cy="auto-added" className="mt-2">
              <DataSourceReview url={target.dataSource} />
            </div>

            {isReturnedToManager && target.pepReturnReason ? (
              <p
                data-cy="auto-added"
                className="m-0 mt-2 text-sm text-amber-700"
              >
                Returned to manager: {target.pepReturnReason}
              </p>
            ) : null}
            {isRejected && target.rejectionReason ? (
              <p data-cy="auto-added" className="m-0 mt-2 text-sm text-red-600">
                {target.rejectionReason}
              </p>
            ) : null}
          </div>
        </div>

        <div
          data-cy="auto-added"
          className="flex shrink-0 flex-wrap items-center gap-2"
        >
          {canAct ? (
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
            <Tag color="green" className="m-0">
              Approved
            </Tag>
          ) : isReturnedToManager ? (
            <Tag color="orange" className="m-0">
              Returned to manager
            </Tag>
          ) : isRejected ? (
            <Tag color="red" className="m-0">
              Rejected
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
