'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Popover, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined, UserOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetBscResultsScorecards } from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { EmployeeScorecard } from '@/types/bsc';
import {
  computeRollup,
  departmentRollups,
  latestScorecardsByEmployee,
} from '@/utils/bsc/rollup';
import {
  parseResultsScope,
  scorecardResultsHref,
  type ResultsScope,
} from '@/utils/bsc/scorecardTab';
import RollupProgressCard from '@/app/(afterLogin)/(bsc)/bsc/_components/RollupProgressCard';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

const filterButtonClassName =
  'inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type EmployeeKpiRow = EmployeeScorecard & {
  kpiCount: number;
  individualCount: number;
};

type Props = {
  canViewTeamKpi?: boolean;
  canViewAllEmployeeKpi?: boolean;
};

function looksLikeUuid(value?: string | null): boolean {
  return Boolean(value && UUID_RE.test(value));
}

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

/** Org `/users` responses vary: `{ items }`, bare array, or id-keyed map. */
function normalizeUsers(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];

  const body = data as Record<string, unknown>;
  const candidates = [
    body.items,
    body.data,
    body.users,
    body.employees,
    (body.data as Record<string, unknown> | undefined)?.items,
    (body.data as Record<string, unknown> | undefined)?.users,
    (body.data as Record<string, unknown> | undefined)?.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate as any[];
    }
  }

  const values = Object.values(body).filter(
    (value) =>
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('id' in (value as object) ||
        'userId' in (value as object) ||
        'email' in (value as object) ||
        'firstName' in (value as object) ||
        'fullName' in (value as object)),
  ) as any[];

  return values.length > 0 ? values : [];
}

function asNamedList(data: unknown): Array<{ id: string; name: string }> {
  const raw = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown })?.items)
      ? (data as { items: unknown[] }).items
      : [];
  return raw
    .map((row: any) => ({
      id: String(row?.id || ''),
      name: String(
        row?.name ||
          row?.departmentName ||
          row?.positionName ||
          row?.title ||
          '',
      ).trim(),
    }))
    .filter((row) => row.id);
}

function userDisplayName(user: any): string {
  if (!user) return '';
  const info = user?.employeeInformation;
  return (
    user?.fullName ||
    info?.fullName ||
    [
      user?.firstName || user?.first_name || info?.firstName,
      user?.middleName || user?.middle_name || info?.middleName,
      user?.lastName || user?.last_name || info?.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim() ||
    user?.email ||
    user?.username ||
    ''
  );
}

function resolveTeamManagerId(
  actorId: string | undefined,
  scorecards: EmployeeScorecard[],
): string {
  const preferred = actorId || 'demo-user';

  const isDirectReport = (card: EmployeeScorecard, managerId: string) =>
    card.managerId === managerId &&
    card.userId !== managerId &&
    card.userId !== 'demo-user';

  const countReports = (managerId: string) =>
    scorecards.filter((card) => isDirectReport(card, managerId)).length;

  if (countReports(preferred) > 0) return preferred;

  // Mock/demo fallback when the signed-in user has no direct reports in seed data.
  if (preferred !== 'demo-user' && countReports('demo-user') > 0) {
    return 'demo-user';
  }

  return preferred;
}

export default function EmployeeKpiTable({
  canViewTeamKpi: canViewTeamProp,
  canViewAllEmployeeKpi: canViewAllProp,
}: Props = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId: actorId } = useAuthenticationStore();
  const canViewTeamKpi =
    canViewTeamProp ??
    AccessGuard.checkAccess({ permissions: [Permissions.ViewTeamOkr] });
  const canViewAllEmployeeKpi =
    canViewAllProp ??
    AccessGuard.checkAccess({ permissions: [Permissions.ViewCompanyOkr] });

  const scopeOptions = useMemo(() => {
    // Always allow own results (like My OKR). Team / All match OKR tab gates.
    const options: { value: ResultsScope; label: string }[] = [
      { value: 'mine', label: 'My KPI' },
    ];
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
    : allowedScopes[0] || 'mine';

  useEffect(() => {
    if (!allowedScopes.length) return;
    if (scope !== scopeFromUrl) {
      router.replace(scorecardResultsHref(scope));
    }
  }, [allowedScopes.length, router, scope, scopeFromUrl]);

  useEffect(() => {
    setUserId(undefined);
    setDepartment(undefined);
    setCurrentPage(1);
  }, [scope]);

  const [userId, setUserId] = useState<string | undefined>();
  const [department, setDepartment] = useState<string | undefined>();
  const [draftScope, setDraftScope] = useState<ResultsScope>(scope);
  const [draftUserId, setDraftUserId] = useState<string | undefined>();
  const [draftDepartment, setDraftDepartment] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isMobile, isTablet } = useIsMobile();
  const { data: scorecards, isLoading } = useGetBscResultsScorecards(scope);
  const { data: allUsers } = useGetAllUsers();
  const { data: departmentsData } = useGetDepartments();
  const { data: positionsData } = useGetAllPositions();

  useEffect(() => {
    if (filterOpen) {
      setDraftScope(scope);
      setDraftUserId(userId);
      setDraftDepartment(
        scope === 'team' || scope === 'mine' ? undefined : department,
      );
    }
  }, [filterOpen, scope, userId, department]);

  const departmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const dept of asNamedList(departmentsData)) {
      if (dept.name) map.set(dept.id, dept.name);
    }
    return map;
  }, [departmentsData]);

  const positionNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const pos of asNamedList(positionsData)) {
      if (pos.name) map.set(pos.id, pos.name);
    }
    return map;
  }, [positionsData]);

  const usersById = useMemo(() => {
    const map = new Map<string, any>();
    for (const user of normalizeUsers(allUsers)) {
      const id = String(user?.id || user?.userId || '').trim();
      if (id) map.set(id, user);
    }
    return map;
  }, [allUsers]);

  const profileImageByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of normalizeUsers(allUsers)) {
      const id = String(user?.id || user?.userId || '').trim();
      const src = resolveProfileImageSrc(user?.profileImage);
      if (id && src) map.set(id, src);
    }
    return map;
  }, [allUsers]);

  const enrichedScorecards = useMemo(() => {
    return (scorecards || []).map((card) => {
      const user = usersById.get(String(card.userId));
      const job = user?.employeeJobInformation?.[0];
      const resolvedName =
        userDisplayName(user) ||
        (card.userName && !looksLikeUuid(card.userName) ? card.userName : '') ||
        card.userId;
      const departmentName =
        (card.departmentName && !looksLikeUuid(card.departmentName)
          ? card.departmentName
          : null) ||
        (card.departmentId
          ? departmentNameById.get(card.departmentId) || null
          : null) ||
        job?.department?.name ||
        user?.department?.name ||
        user?.departmentName ||
        user?.employeeInformation?.department?.name ||
        null;
      const positionTitle =
        (card.positionTitle && !looksLikeUuid(card.positionTitle)
          ? card.positionTitle
          : null) ||
        (card.positionId
          ? positionNameById.get(card.positionId) || null
          : null) ||
        job?.position?.name ||
        job?.position?.title ||
        user?.position?.name ||
        user?.positionTitle ||
        null;

      return {
        ...card,
        userName: resolvedName,
        departmentName,
        positionTitle,
      };
    });
  }, [scorecards, usersById, departmentNameById, positionNameById]);

  // API already scopes by mine/team/all. Keep a light client filter for mock
  // team fallback when actor has no reports under their own id.
  const scopedScorecards = useMemo(() => {
    const list = enrichedScorecards;
    if (scope !== 'team') return list;
    const manager = resolveTeamManagerId(actorId, list);
    if (manager === actorId) return list;
    const skip = new Set([manager, 'demo-user'].filter(Boolean));
    return list.filter(
      (card) => card.managerId === manager && !skip.has(card.userId),
    );
  }, [enrichedScorecards, scope, actorId]);

  const latestByEmployee = useMemo(
    () => latestScorecardsByEmployee(scopedScorecards),
    [scopedScorecards],
  );

  const companyRollup = useMemo(
    () => computeRollup(latestByEmployee, { scope: 'company' }),
    [latestByEmployee],
  );

  const deptRollups = useMemo(
    () => (scope === 'all' ? departmentRollups(latestByEmployee) : []),
    [latestByEmployee, scope],
  );

  const employeeOptions = useMemo(
    () =>
      latestByEmployee.map((row) => ({
        value: row.userId,
        label: row.userName,
      })),
    [latestByEmployee],
  );

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    latestByEmployee.forEach((row) => {
      if (row.departmentName) set.add(row.departmentName);
    });
    return Array.from(set).sort();
  }, [latestByEmployee]);

  const filtered = useMemo(() => {
    return latestByEmployee
      .filter((row) => !userId || row.userId === userId)
      .filter((row) => !department || row.departmentName === department)
      .map((row) => ({
        ...row,
        kpiCount: Array.isArray(row.targets) ? row.targets.length : 0,
        individualCount: Array.isArray(row.targets)
          ? row.targets.filter((t) => t.assignmentSource === 'individual')
              .length
          : 0,
      }))
      .sort((a, b) => a.userName.localeCompare(b.userName));
  }, [latestByEmployee, userId, department]);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openEmployeeDetail = (row: EmployeeKpiRow) => {
    router.push(
      `/bsc/employees/${encodeURIComponent(row.userId)}?scorecard=${encodeURIComponent(row.id)}`,
    );
  };

  const openCompanyRollup = () => {
    router.push('/bsc/roll-up');
  };

  const openDepartmentRollup = (departmentName: string) => {
    router.push(
      `/bsc/roll-up?department=${encodeURIComponent(departmentName)}`,
    );
  };

  const columns: ColumnsType<EmployeeKpiRow> = [
    {
      title: (
        <span
          data-cy="employeekpitable-span-250"
          className={tableHeaderClassName}
        >
          Employee
        </span>
      ),
      key: 'employee',
      render: (unused, row) => {
        const src = profileImageByUserId.get(row.userId);
        const displayName = row.userName || 'Employee';
        return (
          <div
            data-cy="employeekpitable-div-255"
            className="flex items-center gap-3 min-w-0"
          >
            <Avatar
              size={36}
              src={src}
              icon={!src ? <UserOutlined /> : undefined}
              className="shrink-0 bg-[#E6F4FF] text-[#1677FF]"
              data-cy={`bsc-results-avatar-${row.userId}`}
            >
              {!src ? nameInitials(displayName) : null}
            </Avatar>
            <div
              data-cy="employeekpitable-div-264"
              className="min-w-0 flex flex-col"
            >
              <span
                data-cy="employeekpitable-span-265"
                className={`${tableCellClassName} truncate font-medium`}
                title={displayName}
              >
                {displayName}
              </span>
              <span
                data-cy="employeekpitable-span-268"
                className="text-xs text-gray-500 truncate"
                title={row.positionTitle || undefined}
              >
                {row.positionTitle || '—'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span
          data-cy="employeekpitable-span-277"
          className={tableHeaderClassName}
        >
          Department
        </span>
      ),
      dataIndex: 'departmentName',
      key: 'department',
      render: (value: string | null | undefined) => (
        <span
          data-cy="employeekpitable-span-281"
          className={tableCellClassName}
          title={value || undefined}
        >
          {value || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="employeekpitable-span-285"
          className={tableHeaderClassName}
        >
          KPIs
        </span>
      ),
      key: 'kpis',
      width: 120,
      render: (unused, row) => (
        <div data-cy="employeekpitable-div-289" className="flex flex-col gap-1">
          <span
            data-cy="employeekpitable-span-290"
            className={tableCellClassName}
          >
            {row.kpiCount}
          </span>
          {row.individualCount > 0 ? (
            <Tag className="m-0 w-fit border-[#91caff] bg-[#e6f4ff] text-[#1677ff]">
              {row.individualCount} individual
            </Tag>
          ) : null}
        </div>
      ),
    },
  ];

  const applyFilters = () => {
    setUserId(draftUserId);
    setDepartment(
      draftScope === 'team' || draftScope === 'mine'
        ? undefined
        : draftDepartment,
    );
    setCurrentPage(1);
    if (draftScope !== scope) {
      router.push(scorecardResultsHref(draftScope));
    }
    setFilterOpen(false);
  };

  const handleReset = () => {
    const defaultScope = allowedScopes[0] || 'mine';
    setDraftUserId(undefined);
    setDraftDepartment(undefined);
    setDraftScope(defaultScope);
    setUserId(undefined);
    setDepartment(undefined);
    setCurrentPage(1);
    if (defaultScope !== scope) {
      router.push(scorecardResultsHref(defaultScope));
    }
    setFilterOpen(false);
  };

  const filterBody = (
    <div className="flex flex-col gap-4" data-cy="bsc-results-filter-body">
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        data-cy="bsc-results-filter-grid"
      >
        {scopeOptions.length > 1 ? (
          <div
            className="flex flex-col gap-2 sm:col-span-2"
            data-cy="bsc-results-filter-scope"
          >
            <label
              className="text-sm font-medium text-gray-700"
              data-cy="bsc-results-filter-scope-label"
            >
              Scope
            </label>
            <Select
              value={draftScope}
              onChange={(value: ResultsScope) => {
                setDraftScope(value);
                if (value === 'team' || value === 'mine') {
                  setDraftDepartment(undefined);
                }
              }}
              options={scopeOptions}
              className="w-full h-10 rounded-lg"
              data-cy="bsc-results-filter-scope-select"
            />
          </div>
        ) : null}
        <div
          className="flex flex-col gap-2"
          data-cy="bsc-results-filter-employee"
        >
          <label
            className="text-sm font-medium text-gray-700"
            data-cy="bsc-results-filter-employee-label"
          >
            Employee
          </label>
          <Select
            showSearch
            allowClear
            placeholder="Select employee"
            className="w-full h-10 rounded-lg"
            value={draftUserId}
            onChange={(value) => setDraftUserId(value)}
            options={employeeOptions}
            optionFilterProp="label"
            data-cy="bsc-results-filter-employee-select"
          />
        </div>
        <div className="flex flex-col gap-2" data-cy="bsc-results-filter-dept">
            <label
              className={`text-sm font-medium ${
                draftScope === 'team' || draftScope === 'mine'
                  ? 'text-gray-400'
                  : 'text-gray-700'
              }`}
              data-cy="bsc-results-filter-dept-label"
            >
            Department
          </label>
          <Select
            allowClear
            showSearch
            disabled={draftScope === 'team' || draftScope === 'mine'}
            placeholder="Department"
            className="w-full h-10 rounded-lg"
            value={
              draftScope === 'team' || draftScope === 'mine'
                ? undefined
                : draftDepartment
            }
            onChange={(value) => setDraftDepartment(value)}
            options={departmentOptions.map((name) => ({
              value: name,
              label: name,
            }))}
            data-cy="bsc-results-filter-dept-select"
          />
        </div>
      </div>
    </div>
  );

  const filterPopover = (
    <div
      className="w-[460px] max-w-[460px]"
      data-cy="bsc-results-filter-popover"
    >
      {filterBody}
      <div
        className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100"
        data-cy="bsc-results-filter-actions"
      >
        <Button
          onClick={handleReset}
          className="h-8 px-4 rounded-lg text-xs text-gray-700 border-gray-300"
          data-cy="bsc-results-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={applyFilters}
          className="h-8 px-4 rounded-lg text-xs bg-okr-primary border-okr-primary"
          data-cy="bsc-results-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4" data-cy="bsc-all-employee-kpi-table">
      <div
        className="w-full flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden scrollbar-none pb-1"
        data-cy="bsc-all-employee-rollup-summary"
      >
        <RollupProgressCard
          rollup={companyRollup}
          onClick={scope === 'mine' ? undefined : openCompanyRollup}
          dataCy="bsc-company-rollup-card"
          label={
            scope === 'mine'
              ? 'My Scorecard'
              : scope === 'team'
                ? 'Subordinate Scorecard'
                : 'Company-wide Scorecard'
          }
        />
        {deptRollups.map((row) => (
          <RollupProgressCard
            key={row.departmentName}
            rollup={row}
            onClick={() => {
              if (row.departmentName) openDepartmentRollup(row.departmentName);
            }}
            dataCy={`bsc-department-rollup-card-${row.departmentName}`}
          />
        ))}
      </div>

      <div
        className="border border-[#D9D9D9] rounded-lg"
        data-cy="bsc-all-employee-table-card"
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 mb-2 px-3 pt-3"
          data-cy="bsc-all-employee-toolbar"
        >
          <div
            data-cy="employeekpitable-div-482"
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
          >
            <Select
              showSearch
              allowClear
              placeholder="Search Employee"
              value={userId}
              onChange={(value) => {
                setUserId(value);
                setCurrentPage(1);
              }}
              className="h-10 w-full sm:w-[240px]"
              options={employeeOptions}
              optionFilterProp="label"
              data-cy="bsc-all-employee-search"
            />
          </div>
          <div
            id="okr-filter-button-wrapper"
            data-cy="bsc-results-filter-button-wrapper"
            className="flex-shrink-0"
          >
            <Popover
              content={filterPopover}
              title={
                <div
                  className="flex justify-between items-start"
                  data-cy="bsc-results-filter-title"
                >
                  <div data-cy="bsc-results-filter-title-text">
                    <h3
                      className="text-base font-bold text-gray-900 m-0"
                      data-cy="bsc-results-filter-heading"
                    >
                      Filter
                    </h3>
                    <p
                      className="text-xs text-gray-500 mt-1 mb-0"
                      data-cy="bsc-results-filter-hint"
                    >
                      Select all filters that apply
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
                    data-cy="bsc-results-filter-close"
                  >
                    <CloseOutlined />
                  </button>
                </div>
              }
              trigger="click"
              open={filterOpen}
              onOpenChange={setFilterOpen}
              placement="bottomRight"
              arrow={false}
            >
              <Button
                id="desktop-filter-button"
                type="default"
                className={filterButtonClassName}
                icon={
                  <FilterAltOutlinedIcon
                    className="py-1"
                    sx={{ fontSize: 22 }}
                  />
                }
                data-cy="bsc-results-filter-button"
              >
                Filter
              </Button>
            </Popover>
          </div>
        </div>

        <div
          className="overflow-x-auto mt-2"
          data-cy="bsc-all-employee-table-wrap"
        >
          {isLoading ? (
            <div data-cy="bsc-all-employee-kpi-table-skeleton">
              <TableSkeleton columns={columns} scroll={{ x: 520 }} />
            </div>
          ) : (
            <Table
              className="w-full cursor-pointer [&_.ant-table]:!border-[#D9D9D9] [&_.ant-table-thead_.ant-table-cell]:!border-[#D9D9D9] [&_.ant-table-tbody_.ant-table-cell]:!border-[#D9D9D9]"
              columns={columns}
              dataSource={paged}
              pagination={false}
              loading={false}
              scroll={{ x: 520 }}
              rowKey="id"
              rowHoverable={false}
              onRow={(row) => ({
                onClick: () => openEmployeeDetail(row),
              })}
              rowClassName={(unused, index) =>
                index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
              }
              data-cy="bsc-all-employee-table"
              locale={{
                emptyText:
                  scope === 'mine'
                    ? 'No KPI results for your scorecard'
                    : scope === 'team'
                      ? 'No subordinate KPI results'
                      : 'No employee KPI results',
              }}
            />
          )}
        </div>

        <div className="px-3 pb-3" data-cy="bsc-all-employee-kpi-pagination">
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
