'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, Select } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  useGetBscCycles,
  useGetBscPepAuditRows,
  useGetBscResultsScorecards,
} from '@/store/server/features/bsc/queries';
import {
  useGetAllUsers,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import { buildOrgEmployees, type BscOrgEmployee } from '@/utils/bsc/orgUsers';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  EmployeeScorecard,
  KpiApprovalStatus,
  PepAuditRow,
  ScorecardStatus,
} from '@/types/bsc';
import {
  resolveScorecardResultsStatus,
  resultsApprovalSortOrder,
} from '@/utils/bsc/pepAuditGroups';
import {
  resolveAggregatePepWorkflowSteps,
  rowsNeedPepAction,
} from '@/utils/bsc/pepAuditWorkflow';
import {
  isCurrentReportingScorecard,
  parseResultsScope,
  scorecardResultsHref,
  scorecardTabHref,
} from '@/utils/bsc/scorecardTab';
import type { PepAuditBarParticipants } from '@/app/(afterLogin)/(bsc)/bsc/_components/PepAuditApprovalStatusBar';
import PepAuditBulkActionBar from '@/app/(afterLogin)/(bsc)/bsc/_components/PepAuditBulkActionBar';
import { usePepAuditBulkSelection } from '@/app/(afterLogin)/(bsc)/bsc/_components/usePepAuditBulkSelection';
import { useBulkApproveKpiForPepAudit } from '@/store/server/features/bsc/mutation';
import { actionableItemsFromPepRows } from '@/utils/bsc/pepAuditBulk';
import PepAuditPeriodCard from './_components/PepAuditPeriodCard';

const AUDIT_STATUSES: ScorecardStatus[] = [
  ScorecardStatus.PendingEval,
  ScorecardStatus.NeedsResubmit,
  ScorecardStatus.Scored,
  ScorecardStatus.Completed,
];

function periodLabel(
  cycleLabel: string,
  periodMonthName?: string | null,
  periodYear?: number | null,
): string {
  if (periodMonthName) {
    // BE periodLabel is often already "September 2026" — don't repeat the year.
    const alreadyHasYear =
      periodYear != null && periodMonthName.includes(String(periodYear));
    return periodYear && !alreadyHasYear
      ? `${periodMonthName} ${periodYear}`
      : periodMonthName;
  }
  return cycleLabel.replace(/\s*\([^)]*\)\s*$/, '').trim() || cycleLabel;
}

function scorecardPeriodSort(
  a: EmployeeScorecard,
  b: EmployeeScorecard,
): number {
  const yearA = a.periodYear ?? 0;
  const yearB = b.periodYear ?? 0;
  if (yearA !== yearB) return yearB - yearA;
  return (b.updatedAt || '').localeCompare(a.updatedAt || '');
}

function hasUnapprovedPepKpis(pepRows: PepAuditRow[]): boolean {
  if (rowsNeedPepAction(pepRows)) return true;
  const [, , pep] = resolveAggregatePepWorkflowSteps(pepRows);
  return pep === 'active';
}

function periodApprovalSortOrder(
  scorecard: EmployeeScorecard,
  pepRows: PepAuditRow[],
): number {
  const [, manager, pep] = resolveAggregatePepWorkflowSteps(pepRows);
  if (pep === 'active') return 0;
  if (manager === 'active') return 1;
  return (
    resultsApprovalSortOrder(
      resolveScorecardResultsStatus(pepRows, scorecard.status),
    ) + 2
  );
}

function buildWorkflowParticipants(
  scorecard: EmployeeScorecard,
  employeeById: Map<string, BscOrgEmployee>,
): PepAuditBarParticipants {
  const reporter = employeeById.get(scorecard.userId);
  const manager = employeeById.get(scorecard.managerId);
  return {
    reporter: {
      name: scorecard.userName || reporter?.name || 'Employee',
      profileImage: reporter?.profileImage ?? null,
    },
    manager: {
      name: manager?.name || 'Manager',
      profileImage: manager?.profileImage ?? null,
    },
    pep: { name: 'PEP', profileImage: null },
  };
}

export default function EmployeePepAuditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);
  const userId = decodeURIComponent(String(params?.userId || ''));
  const scorecardIdParam = searchParams.get('scorecard') || '';
  const fromAudit = searchParams.get('from') === 'results-audit';
  const scope = parseResultsScope(searchParams);
  const selectedRef = useRef<HTMLDivElement | null>(null);

  const { data: scorecards, isLoading } = useGetBscResultsScorecards(
    scope || 'all',
  );
  const { data: cycles } = useGetBscCycles();
  const { data: allPepRows } = useGetBscPepAuditRows(
    userId ? { userId } : undefined,
  );
  const { data: allUsersData } = useGetAllUsersData();
  const { data: allUsers } = useGetAllUsers();
  const employeeById = useMemo(() => {
    const map = new Map<string, BscOrgEmployee>();
    for (const employee of buildOrgEmployees(allUsersData, allUsers)) {
      map.set(employee.id, employee);
    }
    return map;
  }, [allUsersData, allUsers]);

  const cycleById = useMemo(() => {
    const map = new Map<string, { isActive?: boolean; status?: string }>();
    for (const cycle of cycles || []) {
      map.set(cycle.id, {
        isActive: cycle.isActive,
        status: cycle.status,
      });
    }
    return map;
  }, [cycles]);

  const allPersonScorecards = useMemo(
    () => (scorecards || []).filter((card) => card.userId === userId),
    [scorecards, userId],
  );

  const personScorecards = useMemo(
    () =>
      allPersonScorecards.filter(
        (card) =>
          AUDIT_STATUSES.includes(card.status) &&
          card.targets.some(
            (target) =>
              target.actualValue != null ||
              (target.approvalStatus === KpiApprovalStatus.Rejected &&
                !!target.rejectionReason?.trim()),
          ),
      ),
    [allPersonScorecards],
  );

  const pepRowsByScorecardId = useMemo(() => {
    const map = new Map<string, PepAuditRow[]>();
    for (const row of allPepRows || []) {
      const list = map.get(row.scorecardId) || [];
      list.push(row);
      map.set(row.scorecardId, list);
    }
    return map;
  }, [allPepRows]);

  const orderedScorecards = useMemo(() => {
    const list = [...personScorecards];
    if (
      scorecardIdParam &&
      !list.some((card) => card.id === scorecardIdParam)
    ) {
      const fromUrl = allPersonScorecards.find(
        (card) => card.id === scorecardIdParam,
      );
      if (fromUrl) list.unshift(fromUrl);
    }
    return list.sort((a, b) => {
      const rowsA = pepRowsByScorecardId.get(a.id) || [];
      const rowsB = pepRowsByScorecardId.get(b.id) || [];
      const byApproval =
        periodApprovalSortOrder(a, rowsA) - periodApprovalSortOrder(b, rowsB);
      if (byApproval !== 0) return byApproval;
      const aCurrent = isCurrentReportingScorecard(a, cycleById);
      const bCurrent = isCurrentReportingScorecard(b, cycleById);
      if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
      return scorecardPeriodSort(a, b);
    });
  }, [
    allPersonScorecards,
    cycleById,
    pepRowsByScorecardId,
    personScorecards,
    scorecardIdParam,
  ]);

  const displayName =
    orderedScorecards[0]?.userName ||
    allPersonScorecards[0]?.userName ||
    employeeById.get(userId)?.name ||
    'Employee';

  const [periodFilterId, setPeriodFilterId] = useState('all');
  const {
    clear: clearBulkSelection,
    isSelected: isBulkItemSelected,
    toggleItem: toggleBulkItem,
    resolveSelected: resolveBulkSelected,
    selectedCount: bulkSelectedCount,
  } = usePepAuditBulkSelection();
  const { mutateAsync: bulkApproveAsync, isLoading: bulkApproving } =
    useBulkApproveKpiForPepAudit();

  const periodFilterOptions = useMemo(() => {
    const options = orderedScorecards.map((card) => {
      const pepRows = pepRowsByScorecardId.get(card.id) || [];
      const needsReview = hasUnapprovedPepKpis(pepRows);
      const label = periodLabel(
        card.cycleLabel,
        card.periodMonthName,
        card.periodYear,
      );
      return {
        value: card.id,
        label: needsReview ? 'Current period' : label,
      };
    });
    if (orderedScorecards.length <= 1) return options;
    return [{ value: 'all', label: 'All periods' }, ...options];
  }, [orderedScorecards, pepRowsByScorecardId]);

  const visibleScorecards = useMemo(() => {
    if (periodFilterId === 'all') return orderedScorecards;
    return orderedScorecards.filter((card) => card.id === periodFilterId);
  }, [orderedScorecards, periodFilterId]);

  const actionableItems = useMemo(
    () =>
      visibleScorecards.flatMap((scorecard) =>
        actionableItemsFromPepRows(
          pepRowsByScorecardId.get(scorecard.id) || [],
        ),
      ),
    [pepRowsByScorecardId, visibleScorecards],
  );

  useEffect(() => {
    clearBulkSelection();
  }, [clearBulkSelection, periodFilterId, userId]);

  useEffect(() => {
    if (!scorecardIdParam || !selectedRef.current) return;
    selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scorecardIdParam, visibleScorecards.length, isLoading]);

  const back = () => {
    setScorecardTab('results');
    router.push(scorecardResultsHref(scope));
  };

  const handleBulkApprove = async () => {
    const items = resolveBulkSelected(actionableItems);
    if (!items.length) return;
    await bulkApproveAsync(
      items.map(({ scorecardId, targetId }) => ({ scorecardId, targetId })),
    );
    clearBulkSelection();
  };

  const selectPeriod = (value: string) => {
    setPeriodFilterId(value);
    const next = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      next.delete('scorecard');
    } else {
      next.set('scorecard', value);
    }
    const query = next.toString();
    router.replace(
      `/bsc/employees/${encodeURIComponent(userId)}/pep-audit${query ? `?${query}` : ''}`,
      { scroll: false },
    );
  };

  if (isLoading) {
    return (
      <div
        className="py-16 text-center text-gray-400"
        data-cy="bsc-pep-audit-detail-loading"
      >
        Loading…
      </div>
    );
  }

  if (!orderedScorecards.length) {
    return (
      <div className="py-16" data-cy="bsc-pep-audit-detail-empty">
        <Empty description="No reported KPI check-ins found for this employee." />
        <div data-cy="auto-added" className="mt-4 flex justify-center">
          <Button onClick={back}>Back to PEP Audit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-cy="bsc-pep-audit-detail-page">
      <CustomBreadcrumb
        title="PEP Audit Review"
        subtitle="Review reported KPIs, verify data sources, and approve or reject results."
        items={[
          { title: 'My Scorecard', href: scorecardTabHref('mine') },
          { title: 'Results', href: scorecardResultsHref(scope) },
          { title: displayName },
        ]}
      />

      <div
        data-cy="auto-added"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={back}
          className="px-0"
          data-cy="bsc-pep-audit-detail-back"
        >
          {fromAudit ? 'Back to PEP Audit' : 'Back to Results'}
        </Button>
        <div
          data-cy="auto-added"
          className="flex shrink-0 flex-wrap items-center gap-2"
        >
          <PepAuditBulkActionBar
            variant="inline"
            approveAppearance="toolbar"
            selectedCount={bulkSelectedCount}
            onApprove={handleBulkApprove}
            onClear={clearBulkSelection}
            loading={bulkApproving}
            dataCy="bsc-pep-audit-detail-bulk-bar"
          />
          {periodFilterOptions.length > 1 ? (
            <Select
              className="h-10 w-[220px]"
              value={periodFilterId}
              options={periodFilterOptions}
              onChange={selectPeriod}
              showSearch
              optionFilterProp="label"
              data-cy="bsc-pep-audit-period-filter"
            />
          ) : null}
        </div>
      </div>

      {visibleScorecards.map((scorecard) => {
        const isSelected = scorecard.id === scorecardIdParam;
        const pepRows = pepRowsByScorecardId.get(scorecard.id) || [];
        const isCurrent = hasUnapprovedPepKpis(pepRows);
        return (
          <PepAuditPeriodCard
            key={scorecard.id}
            scorecard={scorecard}
            periodLabel={periodLabel(
              scorecard.cycleLabel,
              scorecard.periodMonthName,
              scorecard.periodYear,
            )}
            isCurrentPeriod={isCurrent}
            pepRows={pepRows}
            participants={buildWorkflowParticipants(scorecard, employeeById)}
            scrollRef={isSelected ? selectedRef : undefined}
            isKpiSelected={(targetId) =>
              isBulkItemSelected({
                scorecardId: scorecard.id,
                targetId,
              })
            }
            onKpiSelectedChange={(targetId, checked) =>
              toggleBulkItem({ scorecardId: scorecard.id, targetId }, checked)
            }
          />
        );
      })}
    </div>
  );
}
