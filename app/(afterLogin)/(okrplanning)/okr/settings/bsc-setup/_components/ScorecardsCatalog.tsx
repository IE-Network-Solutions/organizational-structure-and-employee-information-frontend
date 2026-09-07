'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Modal,
  Popover,
  Select,
  Spin,
  Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  CloseOutlined,
  EllipsisOutlined,
  UserOutlined,
} from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import PeopleAssigneesGridSkeleton from '@/app/(afterLogin)/(bsc)/bsc/_components/PeopleAssigneesGridSkeleton';
import ScorecardsGridSkeleton from '@/app/(afterLogin)/(bsc)/bsc/_components/ScorecardsGridSkeleton';
import { bscFilterButtonClassName } from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import { useDeleteBscCycle } from '@/store/server/features/bsc/mutation';
import {
  useGetBscCycles,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscScopeTarget,
  EmployeeScorecard,
  EvaluationCycle,
} from '@/types/bsc';
import { latestScorecardsByEmployee } from '@/utils/bsc/rollup';
import BscSetupModal from './BscSetupModal';

const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';
const metaTagClassName =
  'm-0 rounded-md border border-[#d9d9d9] bg-white px-3 py-0.5 text-xs font-normal text-[#8c8c8c]';

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

type IndividualAssignee = {
  scorecard: EmployeeScorecard;
  individualCount: number;
  configLabel: string;
};

export default function ScorecardsCatalog() {
  const router = useRouter();
  const {
    openCreateSetup,
    openEditSetup,
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
  const deleteCycle = useDeleteBscCycle();

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

  const confirmDeleteScorecard = useCallback(
    (config: EvaluationCycle) => {
      Modal.confirm({
        title: 'Delete this scorecard?',
        content: `"${config.label}" and its assignments will be removed.`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => deleteCycle.mutateAsync(config.id),
      });
    },
    [deleteCycle],
  );

  const scorecardMenuItems = useCallback(
    (config: EvaluationCycle): MenuProps['items'] => [
      {
        key: 'edit',
        label: 'Edit',
        onClick: () => openEditSetup(config),
      },
      {
        key: 'open',
        label: 'Open details',
        onClick: () => router.push(`/bsc/setup/${config.id}`),
      },
      { type: 'divider' },
      {
        key: 'delete',
        label: 'Delete',
        danger: true,
        onClick: () => confirmDeleteScorecard(config),
      },
    ],
    [confirmDeleteScorecard, openEditSetup, router],
  );

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
        resolveScopeLabel(c).toLowerCase().includes(q)
      );
    });
  }, [scorecards, roleSearch, roleDepartmentFilter, peopleAssignees]);

  const loading = configsLoading || peopleLoading;

  const loadingSkeleton =
    view === 'people' ? (
      <PeopleAssigneesGridSkeleton />
    ) : (
      <ScorecardsGridSkeleton />
    );

  return (
    <div className="w-full" data-cy="bsc-setup-page">
      {loading && scorecards.length === 0 ? (
        <Spin
          spinning={loading}
          data-cy="okr-settings-bsc-setup-page-tsx-page-div-67"
        >
          <ScorecardsGridSkeleton />
        </Spin>
      ) : scorecards.length === 0 ? (
        <div
          data-cy="okr-settings-bsc-setup-page-tsx-page-div-69"
          className="flex min-h-[240px] items-center justify-center py-8"
        >
          <EmptyState
            title="No scorecards yet"
            description="Create a scorecard with scope, KPIs, and weights to get started."
            actionText="Add scorecard"
            onAction={openCreateSetup}
          />
        </div>
      ) : (
        <>
          <div
            className="mb-4 flex flex-wrap items-center gap-3"
            data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-12"
          >
            <div
              data-cy="scorecardscatalog-div-281"
              className="min-w-[200px] flex-1"
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
            </div>
            <div
              className="flex shrink-0 flex-wrap items-center gap-2"
              data-cy="bsc-catalog-toolbar-actions"
            >
              <Select
                value={view}
                onChange={(value) => {
                  setBscCatalogView(value as 'scorecards' | 'people');
                  setCurrentPage(1);
                }}
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
                        <label
                          data-cy="scorecardscatalog-label-329"
                          className="text-sm font-medium text-gray-700"
                        >
                          Department
                        </label>
                        <Select
                          allowClear
                          showSearch
                          placeholder="Filter by department"
                          className="h-10 w-full rounded-lg"
                          value={roleDepartmentFilter}
                          onChange={setRoleDepartmentFilter}
                          options={departments.map((d) => ({
                            value: d,
                            label: d,
                          }))}
                          data-cy="bsc-scorecard-filter-dept-select"
                        />
                      </div>
                      <div
                        data-cy="scorecardscatalog-div-346"
                        className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4"
                      >
                        <Button
                          onClick={() => setRoleDepartmentFilter(undefined)}
                          className="h-8 rounded-lg border-gray-300 px-4 text-xs text-gray-700"
                        >
                          Reset
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => setFilterOpen(false)}
                          className="h-8 rounded-lg border-okr-primary bg-okr-primary px-4 text-xs"
                        >
                          Save Filter
                        </Button>
                      </div>
                    </div>
                  }
                  title={
                    <div
                      data-cy="scorecardscatalog-div-364"
                      className="flex items-start justify-between"
                    >
                      <div data-cy="scorecardscatalog-div-365">
                        <h3
                          data-cy="scorecardscatalog-h3-366"
                          className="m-0 text-base font-bold text-gray-900"
                        >
                          Filter
                        </h3>
                        <p
                          data-cy="scorecardscatalog-p-369"
                          className="mb-0 mt-1 text-xs text-gray-500"
                        >
                          Select all filters that apply
                        </p>
                      </div>
                      <button
                        data-cy="scorecardscatalog-button-373"
                        type="button"
                        onClick={() => setFilterOpen(false)}
                        className="cursor-pointer border-none bg-transparent p-1 text-gray-400 hover:text-gray-600"
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

          <Spin spinning={loading}>
            {loading ? (
              loadingSkeleton
            ) : view === 'scorecards' ? (
              <>
                {filtered.length ? (
                  <div
                    data-cy="okr-settings-bsc-setup-page-tsx-page-div-104"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {filtered.map((config) => {
                      const scope = resolveScopeLabel(config);
                      return (
                        <div
                          key={config.id}
                          role="button"
                          tabIndex={0}
                          className="relative cursor-pointer rounded-[12px] bg-[#F9FAFB] p-5 transition-shadow hover:shadow-sm"
                          onClick={() => router.push(`/bsc/setup/${config.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              router.push(`/bsc/setup/${config.id}`);
                            }
                          }}
                          data-cy={`bsc-scorecard-card-${config.id}`}
                        >
                          <div
                            className="mb-3 flex items-start justify-between gap-2"
                            data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-13"
                          >
                            <p
                              data-cy="okr-settings-bsc-setup-page-tsx-page-p-116"
                              className="mb-0 mr-2 flex-1 text-[15px] font-semibold leading-tight text-[#262626]"
                            >
                              {config.label}
                            </p>
                            <Dropdown
                              menu={{ items: scorecardMenuItems(config) }}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                              <button
                                type="button"
                                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-[#8c8c8c] transition-colors hover:text-[#262626]"
                                onClick={(e) => e.stopPropagation()}
                                data-cy={`bsc-scorecard-card-menu-${config.id}`}
                              >
                                <EllipsisOutlined style={{ fontSize: 14 }} />
                              </button>
                            </Dropdown>
                          </div>
                          {config.description ? (
                            <p
                              className="mb-3 line-clamp-2 text-[12px] text-[#8F94A3]"
                              data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-p-14"
                            >
                              {config.description}
                            </p>
                          ) : null}
                          <div
                            data-cy="scorecardscatalog-div-461"
                            className="flex flex-wrap items-center gap-2"
                          >
                            <Tag className={blueTagClassName}>{scope}</Tag>
                            <Tag className={blueTagClassName}>
                              {config.isActive === false
                                ? 'Inactive'
                                : 'Active'}
                            </Tag>
                            {config.effectiveFrom || config.startDate ? (
                              <Tag className={blueTagClassName}>
                                From {config.effectiveFrom || config.startDate}
                              </Tag>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
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
                    className="flex min-h-[240px] items-center justify-center py-8"
                    data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-17"
                  >
                    <EmptyState
                      title="No employee scorecards yet"
                      description="Create a scorecard program so employees appear here. Open a person to add individual KPIs on their scorecard."
                      actionText="Add scorecard"
                      onAction={openCreateSetup}
                    />
                  </div>
                ) : !filteredPeople.length ? (
                  <div
                    className="py-12 text-center text-gray-400"
                    data-cy="bsc-individual-people-empty"
                  >
                    No people match your search
                  </div>
                ) : (
                  <>
                    <div
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                      data-cy="bsc-individual-people-grid"
                    >
                      {pagedPeople.map((row) => {
                        const avatarSrc = profileImageByUserId.get(
                          row.scorecard.userId,
                        );
                        return (
                          <Card
                            key={row.scorecard.id}
                            bordered={false}
                            className="cursor-pointer rounded-xl transition-shadow hover:shadow-sm"
                            style={{ background: '#F9FAFB', boxShadow: 'none' }}
                            bodyStyle={{ padding: '16px' }}
                            onClick={() => openPersonScorecard(row)}
                            data-cy={`bsc-individual-person-card-${row.scorecard.id}`}
                          >
                            <div
                              data-cy="scorecardscatalog-div-528"
                              className="flex items-start gap-3"
                            >
                              <Avatar
                                size={40}
                                src={avatarSrc}
                                icon={<UserOutlined />}
                                className="shrink-0 bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                                data-cy={`bsc-individual-person-avatar-${row.scorecard.id}`}
                              >
                                {nameInitials(row.scorecard.userName)}
                              </Avatar>
                              <div
                                data-cy="scorecardscatalog-div-538"
                                className="min-w-0 flex-1"
                              >
                                <p
                                  data-cy="scorecardscatalog-p-539"
                                  className="m-0 truncate text-sm font-semibold leading-5 text-gray-800"
                                >
                                  {row.scorecard.userName}
                                </p>
                                <p
                                  data-cy="scorecardscatalog-p-542"
                                  className="m-0 mt-1 truncate text-xs text-[#8F94A3]"
                                >
                                  {row.scorecard.positionTitle || '—'}
                                  {row.scorecard.departmentName
                                    ? ` · ${row.scorecard.departmentName}`
                                    : ''}
                                </p>
                                <div
                                  data-cy="scorecardscatalog-div-548"
                                  className="mt-2 flex flex-wrap items-center gap-2"
                                >
                                  <Tag className={metaTagClassName}>
                                    {row.configLabel}
                                  </Tag>
                                  {row.individualCount > 0 ? (
                                    <Tag className={blueTagClassName}>
                                      {row.individualCount} extra KPI
                                      {row.individualCount === 1 ? '' : 's'}
                                    </Tag>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
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
          </Spin>
        </>
      )}
      <BscSetupModal />
    </div>
  );
}
