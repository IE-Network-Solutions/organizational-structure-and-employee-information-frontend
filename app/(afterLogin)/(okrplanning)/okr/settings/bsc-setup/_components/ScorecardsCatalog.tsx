'use client';

import React, { useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Empty,
} from 'antd';
import type { MenuProps, TableColumnsType } from 'antd';
import {
  EllipsisOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscScopeTarget,
  BscSetupKind,
  EmployeeScorecard,
  EvaluationCycle,
} from '@/types/bsc';
import AssignIndividualKpisModal from './AssignIndividualKpisModal';
import BscSetupModal from './BscSetupModal';

const { Option } = Select;

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

function resolveScopeLabel(config: EvaluationCycle): string {
  if (config.employeeIds?.length) return BscScopeTarget.Individual;
  if (config.positionIds?.length || config.positionTitles?.length) {
    return BscScopeTarget.Role;
  }
  if (config.departmentIds?.length || config.departmentNames?.length) {
    return BscScopeTarget.Department;
  }
  return 'Unscoped';
}

function scopeSummary(config: EvaluationCycle): string {
  const scope = resolveScopeLabel(config);
  if (scope === BscScopeTarget.Individual) {
    const names = config.employeeNames || [];
    if (!names.length) {
      return `${config.employeeIds?.length || 0} individual${
        (config.employeeIds?.length || 0) === 1 ? '' : 's'
      }`;
    }
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }
  if (scope === BscScopeTarget.Role) {
    const roles = config.positionTitles || [];
    if (!roles.length) return 'Roles';
    if (roles.length <= 2) return roles.join(', ');
    return `${roles.slice(0, 2).join(', ')} +${roles.length - 2}`;
  }
  if (scope === BscScopeTarget.Department) {
    const depts = config.departmentNames || [];
    if (!depts.length) return 'Departments';
    if (depts.length <= 2) return depts.join(', ');
    return `${depts.slice(0, 2).join(', ')} +${depts.length - 2}`;
  }
  return 'No assignment';
}

function horizonLabel(config: EvaluationCycle): string {
  if (config.setupKind === BscSetupKind.Temporary) return 'Temporary';
  if (config.setupKind === BscSetupKind.Permanent) return 'Permanent';
  return config.useCustomDates ? 'Temporary' : 'Permanent';
}

type CatalogView = 'scorecards' | 'people';

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
  } = useBscUiStore();
  const [view, setView] = useState<CatalogView>('scorecards');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [peopleConfigFilter, setPeopleConfigFilter] = useState<
    string | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignScorecard, setAssignScorecard] =
    useState<EmployeeScorecard | null>(null);
  const { isMobile, isTablet } = useIsMobile();

  const { data: configs, isLoading: configsLoading } = useGetBscCycles();
  const { data: kpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: peopleScorecards, isLoading: peopleLoading } =
    useGetBscScorecards();

  const scorecards = useMemo(() => configs || [], [configs]);

  const configLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const config of scorecards) {
      map.set(config.id, config.label);
    }
    return map;
  }, [scorecards]);

  const personOptions = useMemo(() => {
    const byKey = new Map<
      string,
      { scorecard: EmployeeScorecard; label: string }
    >();
    for (const card of peopleScorecards || []) {
      const key = `${card.userId}::${card.cycleId}`;
      const label = [
        card.userName,
        card.positionTitle,
        configLabelById.get(card.cycleId) || card.cycleLabel,
      ]
        .filter(Boolean)
        .join(' · ');
      const existing = byKey.get(key);
      if (
        !existing ||
        (card.targets?.length || 0) > (existing.scorecard.targets?.length || 0)
      ) {
        byKey.set(key, { scorecard: card, label });
      }
    }
    return Array.from(byKey.values()).sort((a, b) =>
      a.scorecard.userName.localeCompare(b.scorecard.userName),
    );
  }, [peopleScorecards, configLabelById]);

  const peopleWithIndividualKpis = useMemo(() => {
    const rows: IndividualAssignee[] = [];
    for (const card of peopleScorecards || []) {
      const individualCount = card.targets.filter(
        (t) => t.assignmentSource === 'individual',
      ).length;
      if (!individualCount) continue;
      rows.push({
        scorecard: card,
        individualCount,
        configLabel: configLabelById.get(card.cycleId) || card.cycleLabel,
      });
    }
    return rows.sort((a, b) =>
      (a.scorecard.userName || '').localeCompare(b.scorecard.userName || ''),
    );
  }, [peopleScorecards, configLabelById]);

  const individualCountByConfig = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of peopleWithIndividualKpis) {
      map.set(row.scorecard.cycleId, (map.get(row.scorecard.cycleId) || 0) + 1);
    }
    return map;
  }, [peopleWithIndividualKpis]);

  const filteredPeople = useMemo(() => {
    const q = peopleSearch.trim().toLowerCase();
    return peopleWithIndividualKpis.filter((row) => {
      if (peopleConfigFilter && row.scorecard.cycleId !== peopleConfigFilter) {
        return false;
      }
      if (!q) return true;
      const person = row.scorecard;
      return (
        person.userName.toLowerCase().includes(q) ||
        (person.positionTitle || '').toLowerCase().includes(q) ||
        (person.departmentName || '').toLowerCase().includes(q) ||
        row.configLabel.toLowerCase().includes(q)
      );
    });
  }, [peopleWithIndividualKpis, peopleSearch, peopleConfigFilter]);

  const pagedPeople = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPeople.slice(start, start + pageSize);
  }, [filteredPeople, currentPage, pageSize]);

  const openPersonOnScorecard = (row: IndividualAssignee) => {
    router.push(
      `/bsc/setup/${row.scorecard.cycleId}?person=${encodeURIComponent(row.scorecard.userId)}`,
    );
  };

  const openAssignForPerson = (scorecard: EmployeeScorecard | null) => {
    setAssignScorecard(scorecard);
    setAssignOpen(true);
  };

  const closeAssign = () => {
    setAssignOpen(false);
    setAssignScorecard(null);
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
        <span
          className={`inline-flex items-center gap-2 ${tableCellClassName}`}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-2"
        >
          <UserOutlined className="text-[#1677ff]" />
          <span
            className="font-medium"
            data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-3"
          >
            {row.scorecard.userName}
          </span>
        </span>
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
      render: (unused, row) => (
        <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
          {row.individualCount} KPI{row.individualCount === 1 ? '' : 's'}
        </Tag>
      ),
    },
    {
      title: (
        <span
          className={`${tableHeaderClassName} whitespace-nowrap`}
          data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-span-11"
        >
          Action
        </span>
      ),
      key: 'actions',
      width: 88,
      align: 'center',
      onHeaderCell: () => ({
        className: 'whitespace-nowrap',
      }),
      render: (unused, row) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Edit',
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
              openAssignForPerson(row.scorecard);
            },
          },
        ];
        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center border-none bg-transparent text-[#8c8c8c] transition-colors hover:text-[#262626] cursor-pointer"
              onClick={(event) => event.stopPropagation()}
              data-cy={`bsc-individual-row-menu-${row.scorecard.id}`}
            >
              <EllipsisOutlined style={{ fontSize: 14 }} />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const kpiCountByConfig = useMemo(() => {
    const map = new Map<string, number>();
    for (const kpi of kpis || []) {
      map.set(
        kpi.evaluationConfigId,
        (map.get(kpi.evaluationConfigId) || 0) + 1,
      );
    }
    return map;
  }, [kpis]);

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
      const peopleMatch = peopleWithIndividualKpis.some(
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
  }, [scorecards, roleSearch, roleDepartmentFilter, peopleWithIndividualKpis]);

  const loading = configsLoading || kpisLoading || peopleLoading;

  const showPeopleForScorecard = (
    event: React.MouseEvent,
    configId: string,
  ) => {
    event.stopPropagation();
    setPeopleConfigFilter(configId);
    setPeopleSearch('');
    setView('people');
  };

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
              className="mb-6 flex flex-wrap items-center justify-between gap-3"
              data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-12"
            >
              <Space wrap>
                {view === 'scorecards' ? (
                  <>
                    <Input
                      allowClear
                      placeholder="Search scorecards"
                      prefix={<SearchOutlined />}
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="w-72"
                      data-cy="bsc-scorecard-search"
                    />
                    <Select
                      value={view}
                      onChange={(value) => setView(value as CatalogView)}
                      className="w-56"
                      options={[
                        { value: 'scorecards', label: 'Scorecards' },
                        { value: 'people', label: 'Individual KPIs' },
                      ]}
                      data-cy="bsc-catalog-view-filter"
                    />
                    <Select
                      allowClear
                      placeholder="Filter by department"
                      className="w-56"
                      value={roleDepartmentFilter}
                      onChange={setRoleDepartmentFilter}
                    >
                      {departments.map((d) => (
                        <Option key={d} value={d}>
                          {d}
                        </Option>
                      ))}
                    </Select>
                  </>
                ) : (
                  <>
                    <Input
                      allowClear
                      placeholder="Search by name, role, or department"
                      prefix={<SearchOutlined />}
                      value={peopleSearch}
                      onChange={(e) => {
                        setPeopleSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-80"
                      data-cy="bsc-individual-people-search"
                    />
                    <Select
                      value={view}
                      onChange={(value) => setView(value as CatalogView)}
                      className="w-56"
                      options={[
                        { value: 'scorecards', label: 'Scorecards' },
                        { value: 'people', label: 'Individual KPIs' },
                      ]}
                      data-cy="bsc-catalog-view-filter"
                    />
                  </>
                )}
              </Space>
              {view === 'people' ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openAssignForPerson(null)}
                  disabled={!personOptions.length}
                  className="bg-[#2b54ad]"
                  data-cy="bsc-individual-add-from-catalog"
                >
                  Add individual KPIs
                </Button>
              ) : null}
            </div>

            {view === 'scorecards' ? (
              <>
                <div
                  data-cy="okr-settings-bsc-setup-page-tsx-page-div-104"
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filtered.map((config) => {
                    const kpiCount = kpiCountByConfig.get(config.id) || 0;
                    const peopleWithExtras =
                      individualCountByConfig.get(config.id) || 0;
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
                          className="mb-1 text-[15px] font-semibold leading-tight text-[#262626]"
                        >
                          {config.label}
                        </p>
                        {config.description ? (
                          <p
                            className="mb-4 line-clamp-2 text-[12px] text-[#8F94A3]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-p-14"
                          >
                            {config.description}
                          </p>
                        ) : (
                          <div
                            className="mb-4"
                            data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-15"
                          />
                        )}
                        <div
                          data-cy="okr-settings-bsc-setup-page-tsx-page-div-119"
                          className="flex flex-wrap items-center gap-2"
                        >
                          <div
                            data-cy="okr-settings-bsc-setup-page-tsx-page-div-121"
                            className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                          >
                            {scopeSummary(config)}
                          </div>
                          <div
                            data-cy="okr-settings-bsc-setup-page-tsx-page-div-133"
                            className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                          >
                            {kpiCount} KPI{kpiCount === 1 ? '' : 's'}
                          </div>
                          {peopleWithExtras > 0 ? (
                            <button
                              type="button"
                              className="rounded-[6px] border border-[#91caff] bg-[#e6f4ff] px-3 py-1.5 text-[12px] text-[#1677ff] cursor-pointer"
                              onClick={(event) =>
                                showPeopleForScorecard(event, config.id)
                              }
                              data-cy={`bsc-scorecard-people-badge-${config.id}`}
                            >
                              {peopleWithExtras} person
                              {peopleWithExtras === 1 ? '' : 's'} with extras
                            </button>
                          ) : null}
                          {(config.periodLabels || [])[0] ? (
                            <div
                              className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                              data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-16"
                            >
                              {config.periodLabels[0]}
                            </div>
                          ) : null}
                        </div>
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
                {!peopleWithIndividualKpis.length ? (
                  <div
                    className="rounded-[12px] border border-dashed border-[#d9d9d9] bg-[#F9FAFB] px-4 py-10 text-center"
                    data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-div-17"
                  >
                    <p
                      className="m-0 text-[14px] font-medium text-[#262626]"
                      data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-p-18"
                    >
                      No individual KPI assignments yet
                    </p>
                    <p
                      className="m-0 mt-1 text-[13px] text-[#8F94A3]"
                      data-cy="-okrplanning-okr-settings-bsc-setup-scorecardscatalog-p-19"
                    >
                      Use Add individual KPIs to append person-only KPIs to an
                      employee scorecard.
                    </p>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="mt-4 bg-[#2b54ad]"
                      onClick={() => openAssignForPerson(null)}
                      disabled={!personOptions.length}
                      data-cy="bsc-individual-add-empty"
                    >
                      Add individual KPIs
                    </Button>
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
                        scroll={{ x: isMobile ? 'max-content' : 1000 }}
                        onRow={(row) => ({
                          onClick: () => openPersonOnScorecard(row),
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
      <AssignIndividualKpisModal
        open={assignOpen}
        scorecard={assignScorecard}
        personOptions={assignScorecard ? [] : personOptions}
        evaluationConfigId={assignScorecard?.cycleId}
        onClose={closeAssign}
      />
    </div>
  );
}
