'use client';

import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Popover,
  Select,
  Table,
  Tag,
  Empty,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import { bscFilterButtonClassName } from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import {
  useGetBscCycles,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscScopeTarget,
  BscSetupKind,
  EmployeeScorecard,
  EvaluationCycle,
} from '@/types/bsc';
import { latestScorecardsByEmployee } from '@/utils/bsc/rollup';
import BscSetupModal from './BscSetupModal';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

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

function resolveScopeLabel(config: EvaluationCycle): string {
  if (config.scopeTarget) return config.scopeTarget;
  if (config.employeeIds?.length) return BscScopeTarget.Individual;
  if (config.positionIds?.length || config.positionTitles?.length) {
    return BscScopeTarget.Role;
  }
  if (config.departmentIds?.length || config.departmentNames?.length) {
    return BscScopeTarget.Department;
  }
  return BscScopeTarget.Company;
}

function horizonLabel(config: EvaluationCycle): string {
  if (config.setupKind === BscSetupKind.Temporary) return 'Temporary';
  if (config.setupKind === BscSetupKind.Permanent) return 'Permanent';
  return config.useCustomDates ? 'Temporary' : 'Permanent';
}

type IndividualAssignee = {
  scorecard: EmployeeScorecard;
  individualCount: number;
  configLabel: string;
};

export default function ScorecardsCatalog() {
  const router = useRouter();
  const {
    openCreateSetup,
    roleSearch,
    setRoleSearch,
    roleDepartmentFilter,
    setRoleDepartmentFilter,
    bscCatalogView: view,
    setBscCatalogView,
  } = useBscUiStore();
  const [peopleSearch, setPeopleSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isMobile, isTablet } = useIsMobile();

  const { data: configs, isLoading: configsLoading } = useGetBscCycles();
  const { data: peopleScorecards, isLoading: peopleLoading } =
    useGetBscScorecards();
  const { data: allUsers } = useGetAllUsers();

  const profileImageByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of allUsers?.items || []) {
      const src = resolveProfileImageSrc(user?.profileImage);
      if (user?.id && src) map.set(user.id, src);
    }
    return map;
  }, [allUsers]);

  const scorecards = useMemo(() => configs || [], [configs]);

  const configLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const config of scorecards) {
      map.set(config.id, config.label);
    }
    return map;
  }, [scorecards]);

  const peopleAssignees = useMemo(() => {
    return latestScorecardsByEmployee(peopleScorecards).map((card) => ({
      scorecard: card,
      individualCount: card.targets.filter(
        (t) => t.assignmentSource === 'individual',
      ).length,
      configLabel: configLabelById.get(card.cycleId) || card.cycleLabel,
    }));
  }, [peopleScorecards, configLabelById]);

  const filteredPeople = useMemo(() => {
    const q = peopleSearch.trim().toLowerCase();
    return peopleAssignees.filter((row) => {
      if (!q) return true;
      const person = row.scorecard;
      return (
        person.userName.toLowerCase().includes(q) ||
        (person.positionTitle || '').toLowerCase().includes(q) ||
        (person.departmentName || '').toLowerCase().includes(q) ||
        row.configLabel.toLowerCase().includes(q)
      );
    });
  }, [peopleAssignees, peopleSearch]);

  const pagedPeople = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPeople.slice(start, start + pageSize);
  }, [filteredPeople, currentPage, pageSize]);

  const openPersonScorecard = (row: IndividualAssignee) => {
    setBscCatalogView('people');
    router.push(
      `/bsc/employees/${encodeURIComponent(row.scorecard.userId)}?scorecard=${encodeURIComponent(row.scorecard.id)}&from=individual`,
    );
  };

  const peopleColumns: TableColumnsType<IndividualAssignee> = [
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-1"
        >
          Person
        </span>
      ),
      key: 'person',
      ellipsis: true,
      render: (unused, row) => (
        <div
          className={`flex items-center gap-2 ${tableCellClassName}`}
          data-cy={`bsc-individual-person-cell-${row.scorecard.id}`}
        >
          <Avatar
            size={32}
            src={profileImageByUserId.get(row.scorecard.userId)}
            icon={<UserOutlined />}
            className="shrink-0 bg-[#E6F4FF] text-[#1677ff]"
            data-cy={`bsc-individual-person-avatar-${row.scorecard.id}`}
          >
            {nameInitials(row.scorecard.userName)}
          </Avatar>
          <span
            className="min-w-0 truncate font-medium"
            data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-3"
          >
            {row.scorecard.userName}
          </span>
        </div>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-4"
        >
          Role
        </span>
      ),
      key: 'role',
      ellipsis: true,
      render: (unused, row) => (
        <span
          className={tableCellClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-5"
        >
          {row.scorecard.positionTitle || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-6"
        >
          Department
        </span>
      ),
      key: 'department',
      ellipsis: true,
      render: (unused, row) => (
        <span
          className={tableCellClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-7"
        >
          {row.scorecard.departmentName || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-8"
        >
          Scorecard
        </span>
      ),
      key: 'scorecard',
      ellipsis: true,
      render: (unused, row) => (
        <span
          className={tableCellClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-9"
        >
          {row.configLabel}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-10"
        >
          Extras
        </span>
      ),
      key: 'extras',
      width: 110,
      align: 'right',
      render: (unused, row) =>
        row.individualCount > 0 ? (
          <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
            {row.individualCount} KPI{row.individualCount === 1 ? '' : 's'}
          </Tag>
        ) : (
          <span className={tableCellClassName}>—</span>
        ),
    },
  ];

  const departments = useMemo(() => {
    const set = new Set<string>();
    scorecards.forEach((c) =>
      (c.departmentNames || []).forEach((d) => set.add(d)),
    );
    return Array.from(set).sort();
  }, [scorecards]);

  const filtered = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    return scorecards.filter((c) => {
      if (
        roleDepartmentFilter &&
        !(c.departmentNames || []).includes(roleDepartmentFilter)
      ) {
        return false;
      }
      if (!q) return true;
      const peopleMatch = peopleAssignees.some(
        (row) =>
          row.scorecard.cycleId === c.id &&
          (row.scorecard.userName.toLowerCase().includes(q) ||
            (row.scorecard.positionTitle || '').toLowerCase().includes(q)),
      );
      return (
        peopleMatch ||
        c.label.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.departmentNames || []).some((d) => d.toLowerCase().includes(q)) ||
        (c.positionTitles || []).some((p) => p.toLowerCase().includes(q)) ||
        (c.employeeNames || []).some((n) => n.toLowerCase().includes(q)) ||
        resolveScopeLabel(c).toLowerCase().includes(q) ||
        horizonLabel(c).toLowerCase().includes(q)
      );
    });
  }, [scorecards, roleSearch, roleDepartmentFilter, peopleAssignees]);

  const loading = configsLoading || peopleLoading;

  return (
    <div className="w-full" data-cy="bsc-setup-page">
      <div
        data-cy="okr-settings-bsc-setup-page-tsx-page-div-65"
        className="rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
      >
        {loading ? (
          <div
            data-cy="okr-settings-bsc-setup-page-tsx-page-div-67"
            className="py-16 text-center text-gray-400"
          >
            Loading…
          </div>
        ) : scorecards.length === 0 ? (
          <div
            data-cy="okr-settings-bsc-setup-page-tsx-page-div-69"
            className="flex min-h-[280px] items-center justify-center py-8"
          >
            <EmptyState
              title="No scorecards yet"
              description="Create a scorecard with scope, KPIs, and weights to get started."
              actionText="Add"
              onAction={openCreateSetup}
            />
          </div>
        ) : (
          <>
            <div
              className="mb-6 flex justify-between gap-4"
              data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-12"
            >
              {view === 'scorecards' ? (
                <BscSearchInput
                  placeholder="Search scorecards"
                  value={roleSearch}
                  onChange={setRoleSearch}
                  data-cy="bsc-scorecard-search"
                />
              ) : (
                <BscSearchInput
                  placeholder="Search by name, role, or department"
                  value={peopleSearch}
                  onChange={(value) => {
                    setPeopleSearch(value);
                    setCurrentPage(1);
                  }}
                  data-cy="bsc-individual-people-search"
                />
              )}
              <div
                className="flex flex-wrap items-center gap-2"
                data-cy="bsc-catalog-toolbar-actions"
              >
                <Select
                  value={view}
                  onChange={(value) =>
                    setBscCatalogView(value as 'scorecards' | 'people')
                  }
                  className="w-44"
                  options={[
                    { value: 'scorecards', label: 'Scorecards' },
                    { value: 'people', label: 'Individual KPIs' },
                  ]}
                  data-cy="bsc-catalog-view-filter"
                />
                {view === 'scorecards' ? (
                  <Popover
                    content={
                      <div
                        className="w-[320px] max-w-[320px]"
                        data-cy="bsc-scorecard-filter-popover"
                      >
                        <div
                          className="flex flex-col gap-2"
                          data-cy="bsc-scorecard-filter-dept"
                        >
                          <label className="text-sm font-medium text-gray-700">
                            Department
                          </label>
                          <Select
                            allowClear
                            showSearch
                            placeholder="Filter by department"
                            className="w-full h-10 rounded-lg"
                            value={roleDepartmentFilter}
                            onChange={setRoleDepartmentFilter}
                            options={departments.map((d) => ({
                              value: d,
                              label: d,
                            }))}
                            data-cy="bsc-scorecard-filter-dept-select"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                          <Button
                            onClick={() => setRoleDepartmentFilter(undefined)}
                            className="h-8 px-4 rounded-lg text-xs text-gray-700 border-gray-300"
                          >
                            Reset
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => setFilterOpen(false)}
                            className="h-8 px-4 rounded-lg text-xs bg-okr-primary border-okr-primary"
                          >
                            Save Filter
                          </Button>
                        </div>
                      </div>
                    }
                    title={
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 m-0">
                            Filter
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 mb-0">
                            Select all filters that apply
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFilterOpen(false)}
                          className="text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
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
                      type="default"
                      className={bscFilterButtonClassName}
                      icon={<FilterAltOutlinedIcon className="py-1" />}
                      data-cy="bsc-scorecard-filter"
                    >
                      {!isMobile && 'Filter'}
                    </Button>
                  </Popover>
                ) : null}
              </div>
            </div>

            {view === 'scorecards' ? (
              <>
                <div
                  data-cy="okr-settings-bsc-setup-page-tsx-page-div-104"
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filtered.map((config) => {
                    const scope = resolveScopeLabel(config);
                    return (
                      <div
                        key={config.id}
                        className="relative cursor-pointer rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-5 transition-shadow hover:shadow-sm"
                        onClick={() => router.push(`/bsc/setup/${config.id}`)}
                        data-cy={`bsc-scorecard-card-${config.id}`}
                      >
                        <div
                          className="mb-3 flex flex-wrap items-center gap-2"
                          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-13"
                        >
                          <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                            {horizonLabel(config)}
                          </Tag>
                          <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                            {scope}
                          </Tag>
                          <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                            {config.cadence}
                          </Tag>
                        </div>
                        <p
                          data-cy="okr-settings-bsc-setup-page-tsx-page-p-116"
                          className="mb-0 text-[15px] font-semibold leading-tight text-[#262626]"
                        >
                          {config.label}
                        </p>
                        {config.description ? (
                          <p
                            className="mb-0 mt-1 line-clamp-2 text-[12px] text-[#8F94A3]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-p-14"
                          >
                            {config.description}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {!filtered.length && (
                  <div
                    data-cy="okr-settings-bsc-setup-page-tsx-page-div-142"
                    className="py-12 text-center text-gray-400"
                  >
                    No scorecards match your search
                  </div>
                )}
              </>
            ) : (
              <div data-cy="bsc-individual-assignees-panel">
                {!peopleAssignees.length ? (
                  <div
                    className="rounded-[12px] border border-dashed border-[#d9d9d9] bg-[#F9FAFB] px-4 py-10 text-center"
                    data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-17"
                  >
                    <p
                      className="m-0 text-[14px] font-medium text-[#262626]"
                      data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-p-18"
                    >
                      No employee scorecards yet
                    </p>
                    <p
                      className="m-0 mt-1 text-[13px] text-[#8F94A3]"
                      data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-p-19"
                    >
                      Create a scorecard program so employees appear here. Open
                      a person to add individual KPIs on their scorecard.
                    </p>
                  </div>
                ) : !filteredPeople.length ? (
                  <div className="py-12" data-cy="bsc-individual-people-empty">
                    <Empty description="No people match your filters" />
                  </div>
                ) : (
                  <>
                    <div
                      className="mt-2 overflow-x-auto"
                      data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-20"
                    >
                      <Table
                        className="w-full cursor-pointer"
                        columns={peopleColumns}
                        dataSource={pagedPeople}
                        rowKey={(row) => row.scorecard.id}
                        pagination={false}
                        scroll={{ x: isMobile ? 'max-content' : 900 }}
                        onRow={(row) => ({
                          onClick: () => openPersonScorecard(row),
                        })}
                        rowHoverable={false}
                        rowClassName={(unused, index) =>
                          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                        }
                        data-cy="bsc-individual-people-table"
                      />
                    </div>
                    {isMobile || isTablet ? (
                      <CustomMobilePagination
                        totalResults={filteredPeople.length}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onChange={(page, size) => {
                          setCurrentPage(page);
                          setPageSize(size);
                        }}
                        data-cy="bsc-individual-people-mobile-pagination"
                      />
                    ) : (
                      <CustomPagination
                        current={currentPage}
                        total={filteredPeople.length || 1}
                        pageSize={pageSize}
                        onChange={(page, size) => {
                          setCurrentPage(page);
                          setPageSize(size);
                        }}
                        onShowSizeChange={(size) => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                        data-cy="bsc-individual-people-pagination"
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <BscSetupModal />
    </div>
  );
}
