'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Popover, Select, Table } from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import {
  CloseOutlined,
  DownloadOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useRouter, useSearchParams } from 'next/navigation';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import PepAuditBulkActionBar from '@/app/(afterLogin)/(bsc)/bsc/_components/PepAuditBulkActionBar';
import {
  bscTableCellClassName,
  bscTableClassName,
  bscTableHeaderClassName,
  bscTableRowClassName,
} from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useGetBscCycles,
  useGetBscPepAuditRows,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useBulkApproveKpiForPepAudit } from '@/store/server/features/bsc/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  EmployeeScorecard,
  PepAuditFlag,
  PepAuditRow,
  ScorecardStatus,
} from '@/types/bsc';
import { actionableItemsFromPepRows } from '@/utils/bsc/pepAuditBulk';
import { exportPepAuditRows } from '@/utils/bsc/pepAuditExport';
import {
  filterPepAuditRows,
  groupPepAuditRowsByEmployee,
  matchesResultsStatusFilter,
  resolveScorecardResultsStatus,
  resultsApprovalSortOrder,
  scorecardNeedsPepReview,
  type PepAuditEmployeeGroup,
  type PepAuditListFilters,
  type PepAuditStatusFilter,
  type ResultsApprovalStatus,
} from '@/utils/bsc/pepAuditGroups';
import { latestScorecardsByEmployee } from '@/utils/bsc/rollup';
import { resolveTeamManagerId } from '@/utils/bsc/resultsScopeScorecards';
import {
  bscRollupHubHref,
  isCurrentReportingScorecard,
  parseResultsScope,
  resolveScorecardTemplateName,
  scorecardPepAuditHref,
  scorecardResultsHref,
  type ResultsScope,
} from '@/utils/bsc/scorecardTab';
import PepAuditSummaryCards from './PepAuditSummaryCards';
import {
  PepAuditWorkflowStepsAggregate,
  type PepAuditBarParticipants,
} from './PepAuditWorkflowSteps';

const filterButtonClassName =
  'inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50';

const resultsTableClassName = `${bscTableClassName} [&_.ant-table-thead>tr>th]:!px-4 [&_.ant-table-tbody>tr>td]:!px-4 [&_.ant-table-thead>tr>th]:!py-3 [&_.ant-table-tbody>tr>td]:!py-3 [&_.ant-table-thead>tr>th]:!text-left [&_.ant-table-tbody>tr>td]:!text-left [&_.ant-table-tbody>tr>td]:!align-middle`;

const DATA_COLUMN_WIDTH = `${100 / 4}%`;
const ACTIONS_COLUMN_WIDTH = 96;

type EmployeeLookup = {
  label: string;
  profileImage?: string | null;
};

type ResultsScorecardRow = {
  userId: string;
  userName: string;
  managerId: string;
  departmentName?: string | null;
  positionTitle?: string | null;
  scorecardId: string;
  cycleId: string;
  scorecardStatus: ScorecardStatus;
  scorecardLabel: string;
  lastReportPeriod: string;
  approvalStatus: ResultsApprovalStatus;
  pepSummary: PepAuditEmployeeGroup['summary'] | null;
  needsPepReview: boolean;
  pepRows: PepAuditRow[];
  workflowParticipants: PepAuditBarParticipants;
};

type Props = {
  canViewTeamKpi?: boolean;
  canViewAllEmployeeKpi?: boolean;
};

function resolveProfileImageSrc(profileImage: unknown): string | undefined {
  if (!profileImage || typeof profileImage !== 'string') return undefined;
  try {
    const parsed = JSON.parse(profileImage);
    if (
      parsed?.url &&
      typeof parsed.url === 'string' &&
      parsed.url.startsWith('http')
    ) {
      return parsed.url;
    }
  } catch {
    if (profileImage.startsWith('http')) return profileImage;
  }
  return undefined;
}

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatReportPeriod(
  card: EmployeeScorecard,
  hasReports: boolean,
): string {
  if (!hasReports) return '—';
  if (card.periodMonthName) {
    return card.periodYear
      ? `${card.periodMonthName} ${card.periodYear}`
      : card.periodMonthName;
  }
  return card.cycleLabel || '—';
}

function buildEmployeeLookupMap(
  allUsers: { items?: Array<Record<string, unknown>> } | undefined,
): Map<string, EmployeeLookup> {
  const map = new Map<string, EmployeeLookup>();
  for (const user of allUsers?.items || []) {
    const id = typeof user.id === 'string' ? user.id : '';
    if (!id) continue;
    const rawName = [user.firstName, user.middleName, user.lastName]
      .filter((part) => typeof part === 'string' && part.trim())
      .join(' ')
      .trim();
    const label =
      rawName ||
      (typeof user.email === 'string' ? user.email : '') ||
      'Employee';
    map.set(id, {
      label,
      profileImage: resolveProfileImageSrc(user.profileImage) ?? null,
    });
  }
  return map;
}

function buildWorkflowParticipants(
  scorecard: EmployeeScorecard,
  employeeById: Map<string, EmployeeLookup>,
): PepAuditBarParticipants {
  const reporter = employeeById.get(scorecard.userId);
  const manager = employeeById.get(scorecard.managerId);
  return {
    reporter: {
      name: scorecard.userName || reporter?.label || 'Employee',
      profileImage: reporter?.profileImage ?? null,
    },
    manager: {
      name: manager?.label || 'Manager',
      profileImage: manager?.profileImage ?? null,
    },
    pep: {
      name: 'PEP',
      profileImage: null,
    },
  };
}

function buildScorecardRow(
  scorecard: EmployeeScorecard,
  group: PepAuditEmployeeGroup | null,
  employeeById: Map<string, EmployeeLookup>,
  cycleById: Map<
    string,
    { label: string; isActive?: boolean; status?: string }
  >,
): ResultsScorecardRow {
  const pepRows = group?.kpis ?? [];
  const pepSummary = group?.summary ?? null;
  const approvalStatus = resolveScorecardResultsStatus(
    pepRows,
    scorecard.status,
  );
  const hasReports = pepRows.length > 0;
  return {
    userId: scorecard.userId,
    userName: scorecard.userName,
    managerId: scorecard.managerId,
    departmentName: scorecard.departmentName,
    positionTitle: scorecard.positionTitle,
    scorecardId: scorecard.id,
    cycleId: scorecard.cycleId,
    scorecardStatus: scorecard.status,
    scorecardLabel: resolveScorecardTemplateName(scorecard, cycleById),
    lastReportPeriod: formatReportPeriod(scorecard, hasReports),
    approvalStatus,
    pepSummary,
    needsPepReview: scorecardNeedsPepReview(pepRows, scorecard.status),
    pepRows,
    workflowParticipants: buildWorkflowParticipants(scorecard, employeeById),
  };
}

function matchesSearch(row: ResultsScorecardRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    row.userName,
    row.departmentName || '',
    row.positionTitle || '',
    row.scorecardLabel,
    row.lastReportPeriod,
  ]
    .join(' ')
    .toLowerCase();
  if (haystack.includes(q)) return true;
  return row.pepRows.some((pepRow) => {
    const pepHaystack = [pepRow.kpiName, pepRow.perspective]
      .join(' ')
      .toLowerCase();
    return pepHaystack.includes(q);
  });
}

export default function ResultsEmployeeTable({
  canViewTeamKpi: canViewTeamProp,
  canViewAllEmployeeKpi: canViewAllProp,
}: Props = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId: actorId } = useAuthenticationStore();
  const { isMobile, isTablet } = useIsMobile();

  const canViewTeamKpi =
    canViewTeamProp ??
    AccessGuard.checkAccess({ permissions: [Permissions.ViewTeamOkr] });
  const canViewAllEmployeeKpi =
    canViewAllProp ??
    AccessGuard.checkAccess({ permissions: [Permissions.ViewCompanyOkr] });

  const scopeOptions = useMemo(() => {
    const options: { value: ResultsScope; label: string }[] = [];
    if (canViewTeamKpi)
      options.push({ value: 'team', label: 'Subordinate KPI' });
    if (canViewAllEmployeeKpi) {
      options.push({ value: 'all', label: 'All Employees KPI' });
    }
    return options;
  }, [canViewTeamKpi, canViewAllEmployeeKpi]);

  const allowedScopes = useMemo(
    () => scopeOptions.map((option) => option.value),
    [scopeOptions],
  );

  const scopeFromUrl = parseResultsScope(searchParams);
  const scope: ResultsScope = allowedScopes.includes(scopeFromUrl)
    ? scopeFromUrl
    : allowedScopes[0] || 'all';
  useEffect(() => {
    if (!allowedScopes.length) return;
    if (scope !== scopeFromUrl) {
      router.replace(scorecardResultsHref(scope), { scroll: false });
    }
  }, [allowedScopes.length, router, scope, scopeFromUrl]);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<PepAuditStatusFilter>('all');
  const [draftDepartment, setDraftDepartment] = useState<string | undefined>();
  const [draftStatus, setDraftStatus] = useState<PepAuditStatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards();
  const { data: cycles } = useGetBscCycles();
  const { data: allPepRows, isLoading: pepRowsLoading } =
    useGetBscPepAuditRows();
  const { data: allUsers } = useGetAllUsers();
  const { mutateAsync: bulkApproveAsync, isLoading: bulkApproving } =
    useBulkApproveKpiForPepAudit();

  useEffect(() => {
    setDepartment(undefined);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  }, [scope]);

  useEffect(() => {
    if (filterOpen) {
      setDraftDepartment(scope === 'team' ? undefined : department);
      setDraftStatus(statusFilter);
    }
  }, [department, filterOpen, scope, statusFilter]);

  const employeeById = useMemo(
    () => buildEmployeeLookupMap(allUsers),
    [allUsers],
  );

  const profileImageByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, employee] of employeeById.entries()) {
      if (employee.profileImage) map.set(id, employee.profileImage);
    }
    return map;
  }, [employeeById]);

  const scopedScorecards = useMemo(() => {
    const list = scorecards || [];
    if (scope !== 'team') return list;
    const manager = resolveTeamManagerId(actorId, list);
    const skip = new Set([manager, 'demo-user'].filter(Boolean));
    return list.filter(
      (card) => card.managerId === manager && !skip.has(card.userId),
    );
  }, [scorecards, scope, actorId]);

  const scopedScorecardIds = useMemo(
    () => new Set(scopedScorecards.map((card) => card.id)),
    [scopedScorecards],
  );

  const scopedPepRows = useMemo(
    () =>
      (allPepRows || []).filter((row) =>
        scopedScorecardIds.has(row.scorecardId),
      ),
    [allPepRows, scopedScorecardIds],
  );

  const cycleById = useMemo(() => {
    const map = new Map<
      string,
      { label: string; isActive?: boolean; status?: string }
    >();
    for (const cycle of cycles || []) {
      map.set(cycle.id, {
        label: cycle.label,
        isActive: cycle.isActive,
        status: cycle.status,
      });
    }
    return map;
  }, [cycles]);

  const currentPeriodScorecards = useMemo(
    () =>
      scopedScorecards.filter((card) =>
        isCurrentReportingScorecard(card, cycleById),
      ),
    [cycleById, scopedScorecards],
  );

  const currentByEmployee = useMemo(
    () => latestScorecardsByEmployee(currentPeriodScorecards),
    [currentPeriodScorecards],
  );

  const currentScorecardIds = useMemo(
    () => new Set(currentByEmployee.map((card) => card.id)),
    [currentByEmployee],
  );

  const currentPepRows = useMemo(
    () =>
      scopedPepRows.filter((row) => currentScorecardIds.has(row.scorecardId)),
    [currentScorecardIds, scopedPepRows],
  );

  const pepGroupByScorecardId = useMemo(() => {
    const map = new Map<string, PepAuditEmployeeGroup>();
    for (const group of groupPepAuditRowsByEmployee(currentPepRows)) {
      map.set(group.scorecardId, group);
    }
    return map;
  }, [currentPepRows]);

  const tableRows = useMemo((): ResultsScorecardRow[] => {
    return currentByEmployee.map((scorecard) => {
      const group = pepGroupByScorecardId.get(scorecard.id) ?? null;
      return buildScorecardRow(scorecard, group, employeeById, cycleById);
    });
  }, [cycleById, currentByEmployee, employeeById, pepGroupByScorecardId]);

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    tableRows.forEach((row) => {
      if (row.departmentName) set.add(row.departmentName);
    });
    return Array.from(set).sort();
  }, [tableRows]);

  const pepListFilters: PepAuditListFilters = useMemo(
    () => ({
      status: statusFilter,
    }),
    [statusFilter],
  );

  const filtered = useMemo(() => {
    return tableRows
      .filter((row) => !department || row.departmentName === department)
      .filter((row) => matchesSearch(row, search))
      .filter((row) => {
        if (
          statusFilter === 'awaiting-manager' ||
          statusFilter === 'awaiting-pep'
        ) {
          return matchesResultsStatusFilter(row.approvalStatus, statusFilter);
        }
        if (statusFilter === 'all') return true;
        if (!row.pepRows.length) {
          return statusFilter === 'all';
        }
        const filteredPep = filterPepAuditRows(row.pepRows, pepListFilters);
        return filteredPep.length > 0;
      })
      .sort((a, b) => {
        const byStatus =
          resultsApprovalSortOrder(a.approvalStatus) -
          resultsApprovalSortOrder(b.approvalStatus);
        if (byStatus !== 0) return byStatus;
        const byName = a.userName.localeCompare(b.userName);
        return byName;
      });
  }, [department, pepListFilters, search, statusFilter, tableRows]);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const rowSelection: TableRowSelection<ResultsScorecardRow> = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys) => setSelectedRowKeys(keys as string[]),
    getCheckboxProps: (row) => ({
      disabled: !row.needsPepReview,
    }),
  };

  const handleBulkApprove = async () => {
    const items = filtered
      .filter((row) => selectedRowKeys.includes(row.userId))
      .flatMap((row) => actionableItemsFromPepRows(row.pepRows));
    if (!items.length) return;
    await bulkApproveAsync(
      items.map(({ scorecardId, targetId }) => ({ scorecardId, targetId })),
    );
    setSelectedRowKeys([]);
  };

  const isLoading =
    (scorecardsLoading && !scorecards) || (pepRowsLoading && !allPepRows);

  const openPepAudit = (row: ResultsScorecardRow) => {
    router.push(scorecardPepAuditHref(row.userId, row.scorecardId, scope));
  };

  const openEmployeeRow = (row: ResultsScorecardRow) => {
    if (row.pepRows.length > 0) {
      openPepAudit(row);
      return;
    }
    router.push(
      `/bsc/employees/${encodeURIComponent(row.userId)}?scorecard=${encodeURIComponent(row.scorecardId)}`,
    );
  };

  const openRollupHub = () => {
    router.push(bscRollupHubHref(scope));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const scorecardIds = new Set(filtered.map((row) => row.scorecardId));
      const rows = currentPepRows.filter((row) =>
        scorecardIds.has(row.scorecardId),
      );
      const exportRows = filterPepAuditRows(rows, {
        ...pepListFilters,
        search,
      });
      await exportPepAuditRows(exportRows.length ? exportRows : currentPepRows);
    } finally {
      setExporting(false);
    }
  };

  const applyFilters = () => {
    setDepartment(scope === 'team' ? undefined : draftDepartment);
    setStatusFilter(draftStatus);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftDepartment(undefined);
    setDraftStatus('all');
    setDepartment(undefined);
    setStatusFilter('all');
    setSearch('');
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const filterBody = (
    <div className="flex flex-col gap-4" data-cy="bsc-results-filter-body">
      <div
        data-cy="auto-added"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div data-cy="auto-added" className="flex flex-col gap-2">
          <label
            data-cy="auto-added"
            className={`text-sm font-medium ${
              scope === 'team' ? 'text-gray-400' : 'text-gray-700'
            }`}
          >
            Department
          </label>
          <Select
            allowClear
            showSearch
            disabled={scope === 'team'}
            placeholder="Department"
            className="h-10"
            value={scope === 'team' ? undefined : draftDepartment}
            onChange={setDraftDepartment}
            options={departmentOptions.map((name) => ({
              value: name,
              label: name,
            }))}
            data-cy="bsc-results-filter-dept"
          />
        </div>
        <div data-cy="auto-added" className="flex flex-col gap-2">
          <label
            data-cy="auto-added"
            className="text-sm font-medium text-gray-700"
          >
            Approval status
          </label>
          <Select
            className="h-10"
            value={draftStatus}
            onChange={setDraftStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'awaiting-pep', label: 'Awaiting PEP review' },
              { value: 'awaiting-manager', label: 'Awaiting manager' },
              { value: PepAuditFlag.Realistic, label: 'Approved' },
            ]}
            data-cy="bsc-results-filter-pep-status"
          />
        </div>
      </div>
    </div>
  );

  const columns: ColumnsType<ResultsScorecardRow> = [
    {
      title: (
        <span
          className={bscTableHeaderClassName}
          data-cy="bsc-results-col-employee"
        >
          Employee
        </span>
      ),
      key: 'employee',
      width: DATA_COLUMN_WIDTH,
      align: 'left',
      render: (ignored, row) => {
        const src = profileImageByUserId.get(row.userId);
        return (
          <div data-cy="auto-added" className="flex min-w-0 items-center gap-3">
            <Avatar
              size={36}
              src={src}
              icon={!src ? <UserOutlined /> : undefined}
              className="shrink-0 bg-[#E6F4FF] text-[#1677FF]"
            >
              {!src ? nameInitials(row.userName) : null}
            </Avatar>
            <div data-cy="auto-added" className="min-w-0">
              <p
                data-cy="auto-added"
                className="m-0 truncate text-sm font-medium text-[#262626]"
              >
                {row.userName}
              </p>
              <p
                data-cy="auto-added"
                className="m-0 truncate text-xs text-gray-500"
              >
                {row.departmentName || row.positionTitle || '—'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span
          className={bscTableHeaderClassName}
          data-cy="bsc-results-col-scorecard"
        >
          Scorecard
        </span>
      ),
      key: 'scorecard',
      width: DATA_COLUMN_WIDTH,
      align: 'left',
      render: (ignored, row) => (
        <span data-cy="auto-added" className={bscTableCellClassName}>
          {row.scorecardLabel}
        </span>
      ),
    },
    {
      title: (
        <span
          className={bscTableHeaderClassName}
          data-cy="bsc-results-col-last-report"
        >
          Last report period
        </span>
      ),
      key: 'lastReportPeriod',
      width: DATA_COLUMN_WIDTH,
      align: 'left',
      render: (ignored, row) => (
        <span data-cy="auto-added" className={bscTableCellClassName}>
          {row.lastReportPeriod}
        </span>
      ),
    },
    {
      title: (
        <span
          className={bscTableHeaderClassName}
          data-cy="bsc-results-col-status"
        >
          Approval status
        </span>
      ),
      key: 'approvalStatus',
      width: DATA_COLUMN_WIDTH,
      align: 'left',
      render: (ignored, row) => (
        <PepAuditWorkflowStepsAggregate
          rows={row.pepRows}
          participants={row.workflowParticipants}
          dataCy={`bsc-results-approval-bar-${row.scorecardId}`}
        />
      ),
    },
    {
      title: (
        <span
          className={bscTableHeaderClassName}
          data-cy="bsc-results-col-actions"
        >
          Actions
        </span>
      ),
      key: 'actions',
      width: ACTIONS_COLUMN_WIDTH,
      align: 'left',
      render: (ignored, row) => {
        if (!row.pepRows.length) {
          return (
            <span data-cy="auto-added" className={bscTableCellClassName}>
              —
            </span>
          );
        }
        const label = row.needsPepReview ? 'Review' : 'View';
        return (
          <Button
            type={row.needsPepReview ? 'primary' : 'default'}
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              openPepAudit(row);
            }}
            data-cy={`bsc-results-review-${row.scorecardId}`}
          >
            {label}
          </Button>
        );
      },
    },
  ];

  if (!allowedScopes.length) {
    return (
      <div
        className="py-16 text-center text-gray-400"
        data-cy="bsc-results-empty-permission"
      >
        You do not have access to KPI results.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-cy="bsc-results-unified-panel">
      <div data-cy="auto-added" className="flex flex-col gap-3">
        <div
          className="flex items-center justify-end"
          data-cy="bsc-results-rollup-header"
        >
          <button
            type="button"
            onClick={openRollupHub}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-sm font-medium text-[#1677ff] hover:underline"
            data-cy="bsc-results-rollup-view-all"
          >
            View roll-up
            <RightOutlined className="text-xs" />
          </button>
        </div>
        <PepAuditSummaryCards rows={currentPepRows} />
      </div>

      <div
        className="rounded-lg border border-[#D9D9D9] bg-white"
        data-cy="bsc-results-table-card"
      >
        <div
          data-cy="auto-added"
          className="flex flex-wrap items-center justify-between gap-3 px-3 pt-3"
        >
          <BscSearchInput
            placeholder="Search employee or KPI"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            data-cy="bsc-results-search"
          />
          <div
            data-cy="auto-added"
            className="flex shrink-0 items-center gap-2"
          >
            <Popover
              open={filterOpen}
              onOpenChange={setFilterOpen}
              trigger="click"
              placement="bottomRight"
              arrow={false}
              content={
                <div
                  className="w-[460px] max-w-[460px]"
                  data-cy="bsc-results-filter-popover"
                >
                  {filterBody}
                  <div
                    data-cy="auto-added"
                    className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4"
                  >
                    <Button
                      onClick={resetFilters}
                      data-cy="bsc-results-filter-reset"
                    >
                      Reset
                    </Button>
                    <Button
                      type="primary"
                      onClick={applyFilters}
                      className="bg-okr-primary border-okr-primary"
                      data-cy="bsc-results-filter-save"
                    >
                      Save Filter
                    </Button>
                  </div>
                </div>
              }
              title={
                <div
                  data-cy="auto-added"
                  className="flex items-start justify-between"
                >
                  <div data-cy="auto-added">
                    <h3
                      data-cy="auto-added"
                      className="m-0 text-base font-bold text-gray-900"
                    >
                      Filter
                    </h3>
                    <p
                      data-cy="auto-added"
                      className="mb-0 mt-1 text-xs text-gray-500"
                    >
                      Department and approval status
                    </p>
                  </div>
                  <button
                    data-cy="auto-added"
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    className="cursor-pointer border-none bg-transparent p-1 text-gray-400 hover:text-gray-600"
                  >
                    <CloseOutlined />
                  </button>
                </div>
              }
            >
              <Button
                type="default"
                className={filterButtonClassName}
                icon={<FilterAltOutlinedIcon sx={{ fontSize: 22 }} />}
                data-cy="bsc-results-filter-button"
              >
                Filter
              </Button>
            </Popover>
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              disabled={!currentPepRows.length}
              onClick={handleExport}
              data-cy="bsc-results-export"
            >
              Export
            </Button>
            <PepAuditBulkActionBar
              variant="inline"
              approveAppearance="toolbar"
              selectedCount={selectedRowKeys.length}
              onApprove={handleBulkApprove}
              onClear={() => setSelectedRowKeys([])}
              loading={bulkApproving}
              dataCy="bsc-results-bulk-bar"
            />
          </div>
        </div>

        <div data-cy="auto-added" className="overflow-x-auto px-3 pb-3 pt-2">
          {isLoading ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              className={resultsTableClassName}
              columns={columns}
              dataSource={paged}
              pagination={false}
              tableLayout="fixed"
              rowKey="userId"
              rowSelection={rowSelection}
              rowClassName={(ignored, index) =>
                `${bscTableRowClassName(index)} cursor-pointer`
              }
              onRow={(row) => ({
                onClick: (event) => {
                  const target = event.target as HTMLElement;
                  if (
                    target.closest('.ant-checkbox') ||
                    target.closest('.ant-checkbox-wrapper') ||
                    target.closest('button')
                  ) {
                    return;
                  }
                  openEmployeeRow(row);
                },
              })}
              locale={{
                emptyText:
                  scope === 'team'
                    ? 'No subordinate KPI results'
                    : 'No employee KPI results',
              }}
              data-cy="bsc-results-employee-table"
            />
          )}
        </div>

        <div className="px-3 pb-3" data-cy="bsc-results-pagination">
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={filtered.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={filtered.length || 1}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
