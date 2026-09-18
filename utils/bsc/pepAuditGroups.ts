import {
  KpiApprovalStatus,
  PepAuditFlag,
  PepAuditRow,
  ScorecardStatus,
} from '@/types/bsc';
import {
  isPepAuditActionableScorecard,
  resolveAggregatePepWorkflowSteps,
  rowsNeedPepAction,
} from './pepAuditWorkflow';

export type PepAuditStatusFilter =
  | 'all'
  | PepAuditFlag
  | 'returned'
  | 'awaiting-manager'
  | 'awaiting-pep';

export type PepAuditEmployeeGroup = {
  userId: string;
  employeeName: string;
  departmentName?: string | null;
  scorecardId: string;
  cycleLabel: string;
  kpis: PepAuditRow[];
  summary: {
    total: number;
    unrealistic: number;
    pendingReview: number;
    realistic: number;
    returned: number;
  };
};

export type PepAuditListFilters = {
  search?: string;
  status?: PepAuditStatusFilter;
  scorecardId?: string;
  perspective?: string;
};

function summarizeKpis(kpis: PepAuditRow[]): PepAuditEmployeeGroup['summary'] {
  return kpis.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.approvalStatus === KpiApprovalStatus.Rejected) {
        acc.returned += 1;
      }
      if (row.pepAuditFlag === PepAuditFlag.Unrealistic) acc.unrealistic += 1;
      else if (row.pepAuditFlag === PepAuditFlag.PendingReview) {
        acc.pendingReview += 1;
      } else acc.realistic += 1;
      return acc;
    },
    { total: 0, unrealistic: 0, pendingReview: 0, realistic: 0, returned: 0 },
  );
}

export function filterPepAuditRows(
  rows: PepAuditRow[],
  filters: PepAuditListFilters,
): PepAuditRow[] {
  const q = filters.search?.trim().toLowerCase() || '';
  return rows.filter((row) => {
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'returned') {
        if (row.approvalStatus !== KpiApprovalStatus.Rejected) return false;
      } else if (
        filters.status === 'awaiting-manager' ||
        filters.status === 'awaiting-pep'
      ) {
        return false;
      } else if (row.pepAuditFlag !== filters.status) {
        return false;
      }
    }
    if (filters.scorecardId && row.scorecardId !== filters.scorecardId) {
      return false;
    }
    if (filters.perspective && row.perspective !== filters.perspective) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      row.employeeName,
      row.departmentName || '',
      row.cycleLabel,
      row.kpiName,
      row.perspective,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function groupPepAuditRowsByEmployee(
  rows: PepAuditRow[],
): PepAuditEmployeeGroup[] {
  const byScorecard = new Map<string, PepAuditRow[]>();
  for (const row of rows) {
    const list = byScorecard.get(row.scorecardId) || [];
    list.push(row);
    byScorecard.set(row.scorecardId, list);
  }

  const groups: PepAuditEmployeeGroup[] = [];
  for (const [scorecardId, kpis] of byScorecard.entries()) {
    if (!kpis.length) continue;
    const head = kpis[0];
    groups.push({
      userId: head.userId,
      employeeName: head.employeeName,
      departmentName: head.departmentName,
      scorecardId,
      cycleLabel: head.cycleLabel,
      kpis: [...kpis].sort((a, b) => a.kpiName.localeCompare(b.kpiName)),
      summary: summarizeKpis(kpis),
    });
  }

  return groups.sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName, undefined, {
      sensitivity: 'base',
    }),
  );
}

export function buildPepAuditEmployeeDirectory(
  rows: PepAuditRow[],
  filters: PepAuditListFilters,
): PepAuditEmployeeGroup[] {
  return groupPepAuditRowsByEmployee(filterPepAuditRows(rows, filters));
}

export function pepAuditScorecardOptions(rows: PepAuditRow[]) {
  const map = new Map<string, string>();
  for (const row of rows) {
    if (!map.has(row.scorecardId)) {
      map.set(row.scorecardId, row.cycleLabel);
    }
  }
  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function pepAuditPerspectiveOptions(rows: PepAuditRow[]) {
  return Array.from(new Set(rows.map((row) => row.perspective)))
    .sort()
    .map((value) => ({ value, label: value }));
}

export type PepAuditUserMeta = {
  summary: PepAuditEmployeeGroup['summary'];
  reviewScorecardId: string;
  needsReview: boolean;
};

function mergeSummaries(
  summaries: PepAuditEmployeeGroup['summary'][],
): PepAuditEmployeeGroup['summary'] {
  return summaries.reduce(
    (acc, summary) => ({
      total: acc.total + summary.total,
      unrealistic: acc.unrealistic + summary.unrealistic,
      pendingReview: acc.pendingReview + summary.pendingReview,
      realistic: acc.realistic + summary.realistic,
      returned: acc.returned + summary.returned,
    }),
    { total: 0, unrealistic: 0, pendingReview: 0, realistic: 0, returned: 0 },
  );
}

function actionCount(summary: PepAuditEmployeeGroup['summary']): number {
  return summary.unrealistic + summary.pendingReview + summary.returned;
}

/** Aggregate PEP audit rows per employee (may span multiple scorecards). */
export type ResultsApprovalStatus =
  | 'no-reports'
  | 'returned'
  | 'awaiting-manager'
  | 'awaiting-pep'
  | 'approved';

export function resolveScorecardResultsStatus(
  rows: PepAuditRow[],
  scorecardStatus: ScorecardStatus,
): ResultsApprovalStatus {
  if (!rows.length) return 'no-reports';

  const hasReturned = rows.some(
    (row) => row.approvalStatus === KpiApprovalStatus.Rejected,
  );
  if (hasReturned) return 'returned';

  const [, manager, pep] = resolveAggregatePepWorkflowSteps(rows);

  if (manager === 'active' || (manager === 'pending' && rows.length > 0)) {
    return 'awaiting-manager';
  }

  if (
    manager === 'done' &&
    pep === 'active' &&
    isPepAuditActionableScorecard(scorecardStatus)
  ) {
    return 'awaiting-pep';
  }

  return 'approved';
}

export function scorecardNeedsPepReview(
  rows: PepAuditRow[],
  scorecardStatus: ScorecardStatus,
): boolean {
  return (
    resolveScorecardResultsStatus(rows, scorecardStatus) === 'awaiting-pep' &&
    rowsNeedPepAction(rows)
  );
}

export function resultsApprovalSortOrder(
  status: ResultsApprovalStatus,
): number {
  const order: Record<ResultsApprovalStatus, number> = {
    'awaiting-pep': 0,
    returned: 1,
    'awaiting-manager': 2,
    approved: 3,
    'no-reports': 4,
  };
  return order[status];
}

export function matchesResultsStatusFilter(
  rowStatus: ResultsApprovalStatus,
  filter: PepAuditStatusFilter,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'returned') return rowStatus === 'returned';
  if (filter === 'awaiting-manager') return rowStatus === 'awaiting-manager';
  if (filter === 'awaiting-pep') return rowStatus === 'awaiting-pep';
  if (filter === PepAuditFlag.Unrealistic) {
    return rowStatus === 'awaiting-pep' || rowStatus === 'awaiting-manager';
  }
  if (filter === PepAuditFlag.PendingReview) {
    return rowStatus === 'awaiting-pep' || rowStatus === 'awaiting-manager';
  }
  if (filter === PepAuditFlag.Realistic) return rowStatus === 'approved';
  return true;
}

/** Map summary-card clicks to PEP status filter values. */
export function summaryCardToStatusFilter(
  card: 'unrealistic' | 'pending' | 'realistic' | 'returned',
): PepAuditStatusFilter {
  if (card === 'unrealistic') return PepAuditFlag.Unrealistic;
  if (card === 'pending') return PepAuditFlag.PendingReview;
  if (card === 'realistic') return PepAuditFlag.Realistic;
  return 'returned';
}

export function aggregatePepAuditByUser(
  rows: PepAuditRow[],
): Map<string, PepAuditUserMeta> {
  const groups = groupPepAuditRowsByEmployee(rows);
  const byUser = new Map<string, PepAuditEmployeeGroup[]>();

  for (const group of groups) {
    const list = byUser.get(group.userId) || [];
    list.push(group);
    byUser.set(group.userId, list);
  }

  const result = new Map<string, PepAuditUserMeta>();
  for (const [userId, userGroups] of byUser.entries()) {
    const summary = mergeSummaries(userGroups.map((group) => group.summary));
    let reviewScorecardId = userGroups[0].scorecardId;
    let bestAction = -1;
    for (const group of userGroups) {
      const count = actionCount(group.summary);
      if (count > bestAction) {
        bestAction = count;
        reviewScorecardId = group.scorecardId;
      }
    }
    result.set(userId, {
      summary,
      reviewScorecardId,
      needsReview: actionCount(summary) > 0,
    });
  }

  return result;
}
