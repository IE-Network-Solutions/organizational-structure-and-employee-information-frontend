'use client';

import { useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  useGetVpDeductionDetails,
  useGetVpDeductionTotal,
} from '@/store/server/features/okrplanning/okr/vp-deduction/queries';
import {
  FiscalSession,
  getViolationNameLabels,
  resolvePreviousMonthId,
} from '@/store/server/features/okrplanning/okr/vp-deduction/utils';
import VpViolationDetailModal from './vp-violation-detail-modal';

type ViolationCardProps = {
  userId: string;
};

const ViolationCard = ({ userId }: ViolationCardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { data: activeMonth } = useGetActiveMonth();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const monthId = activeMonth?.id;
  const sessions = (activeFiscalYear?.sessions ?? []) as FiscalSession[];
  const sessionId =
    sessions.find((session) => session.active)?.id || sessions[0]?.id;

  const { data: vpScore, isLoading: isVpScoreLoading } = useGetVPScore(userId, {
    monthId,
  });
  const { data: detailsResponse, isLoading: isDetailsLoading } =
    useGetVpDeductionDetails({
      userId,
      monthId,
      sessionId,
      enabled: Boolean(userId && monthId && sessionId),
    });

  const previousMonthId = resolvePreviousMonthId(sessions, sessionId, monthId);

  const { data: previousVpDeductionTotal } = useGetVpDeductionTotal({
    userId,
    monthId: previousMonthId,
    sessionId,
    enabled: Boolean(previousMonthId && sessionId),
  });

  const totalVpDeductions = Number(vpScore?.totalVpDeductions ?? 0);
  const previousVpDeductions = Number(
    previousVpDeductionTotal?.totalVpDeductions ?? 0,
  );
  const violationChange = totalVpDeductions - previousVpDeductions;
  const items = detailsResponse?.items ?? [];
  const violationCount = items.length;
  const itemIdsKey = items.map((item) => item.id).join(',');
  const violationNameLabels = useMemo(
    () => getViolationNameLabels(items),
    [itemIdsKey],
  );

  const isLoading = isVpScoreLoading || isDetailsLoading;
  const hasViolations = totalVpDeductions > 0 || violationCount > 0;

  return (
    <>
      <div
        className="rounded-lg border border-[#f0f0f0] p-4 h-full"
        data-cy="vp-criteria-breakdown-violation-card"
      >
        <div
          className="flex items-center justify-between gap-3"
          data-cy="vp-criteria-breakdown-violation-header"
        >
          <p
            className="text-sm text-[#595959]"
            data-cy="vp-criteria-breakdown-violation-name"
          >
            Violation
          </p>
          {isLoading ? (
            <Skeleton.Input
              active
              size="small"
              style={{ width: 96 }}
              data-cy="vp-criteria-breakdown-violation-delta-skeleton"
            />
          ) : (
            <span
              className={`rounded border px-2 py-1 text-xs ${
                violationChange <= 0
                  ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#389e0d]'
                  : 'border-[#ffa39e] bg-[#fff1f0] text-[#ff4d4f]'
              }`}
              data-cy="vp-criteria-breakdown-violation-delta"
            >
              {violationChange >= 0 ? '+' : ''}
              {violationChange} vs last month
            </span>
          )}
        </div>

        {isLoading ? (
          <Skeleton
            active
            paragraph={{ rows: 2 }}
            className="mt-2"
            data-cy="vp-criteria-breakdown-violation-body-skeleton"
          />
        ) : hasViolations ? (
          <div
            className="mt-2 rounded-md border border-[#ffccc7] bg-[#fff1f0] p-3"
            data-cy="vp-criteria-breakdown-violation-negative"
          >
            <p
              className="text-sm text-[#ff4d4f]"
              data-cy="vp-criteria-breakdown-violation-count-text"
            >
              {violationCount} Attendance violation
              {violationCount !== 1 ? 's' : ''} Recorded
            </p>
            <p
              className="text-xs text-[#8c8c8c] mt-1"
              data-cy="vp-criteria-breakdown-violation-points-text"
            >
              {totalVpDeductions} VP point{totalVpDeductions !== 1 ? 's' : ''}{' '}
              Removed
            </p>
          </div>
        ) : (
          <div
            className="mt-2 rounded-md border border-[#d9d9d9] bg-[#fafafa] p-3"
            data-cy="vp-criteria-breakdown-violation-empty"
          >
            <p
              className="text-sm text-[#595959]"
              data-cy="vp-criteria-breakdown-violation-empty-text"
            >
              No attendance violations recorded this month
            </p>
            <p
              className="text-xs text-[#8c8c8c] mt-1"
              data-cy="vp-criteria-breakdown-violation-empty-points"
            >
              0 VP points removed
            </p>
          </div>
        )}

        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2"
          data-cy="vp-criteria-breakdown-violation-footer"
        >
          <div
            className="flex flex-wrap items-center gap-2"
            data-cy="vp-criteria-breakdown-violation-chips"
          >
            {violationNameLabels.map((label) => (
              <span
                key={label}
                className="rounded border border-[#d9d9d9] bg-white px-2.5 py-1 text-xs text-[#595959]"
                data-cy={`vp-criteria-breakdown-violation-chip-${label
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                {label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsDetailModalOpen(true)}
            disabled={!hasViolations}
            className="text-sm font-medium text-[#1677ff] hover:text-blue-800 disabled:cursor-not-allowed disabled:text-[#bfbfbf]"
            data-cy="vp-criteria-breakdown-violation-details-link"
          >
            Details
          </button>
        </div>
      </div>

      <VpViolationDetailModal
        open={isDetailModalOpen}
        userId={userId}
        monthId={monthId}
        sessionId={sessionId}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
};

export default ViolationCard;
