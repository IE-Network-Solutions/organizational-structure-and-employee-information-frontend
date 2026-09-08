'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Empty, Modal, Progress, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import { BscKpiCountCard } from '@/app/(afterLogin)/(bsc)/bsc/_components/BscKpiMetricCard';
import {
  useGetBscCycle,
  useGetBscKpiLibrary,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscScopeTarget,
  EmployeeScorecard,
  EvaluationCycle,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';
import BscSetupModal from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-setup/_components/BscSetupModal';
import { computeKpiRollup, formatScore } from '@/utils/bsc/rollup';
import { scorecardTabHref } from '@/utils/bsc/scorecardTab';
import { cadenceLabel, checkInDayLabel } from '@/utils/bsc/checkInSchedule';
import {
  bscTableCellClassName as tableCellClassName,
  bscTableClassName as tableClassName,
  bscTableHeaderClassName as tableHeaderClassName,
  bscTableRowClassName,
} from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';

const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';

type ListKind = 'departments' | 'roles' | 'people';

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

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function ScoreProgressBar({
  value,
  dataCy,
}: {
  value: number | null;
  dataCy: string;
}) {
  if (value == null) {
    return (
      <span className={tableCellClassName} data-cy={dataCy}>
        —
      </span>
    );
  }
  const percent = Math.min(Math.max(value, 0), 100);
  return (
    <div className="flex min-w-0 items-center gap-2" data-cy={dataCy}>
      <Progress
        percent={percent}
        showInfo={false}
        strokeColor="#1f4fd8"
        trailColor="#e5e7eb"
        size="small"
        className="m-0 min-w-0 flex-1"
        data-cy={`${dataCy}-bar`}
      />
      <span
        className="shrink-0 text-sm font-normal text-[#4d4d4d]"
        data-cy={`${dataCy}-label`}
      >
        {formatScore(percent)}%
      </span>
    </div>
  );
}

export default function BscScorecardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const configId = String(params?.configId || '');
  const searchParams = useSearchParams();
  const focusPersonId = searchParams?.get('person') || '';
  const { openEditSetup, setScorecardTab } = useBscUiStore();
  const [kpiSearch, setKpiSearch] = useState('');
  const [listModal, setListModal] = useState<ListKind | null>(null);
  const [listSearch, setListSearch] = useState('');

  const { data: config, isLoading: configLoading } = useGetBscCycle(configId);
  const { data: allKpis, isLoading: kpisLoading } = useGetBscKpiLibrary({
    evaluationConfigId: configId,
  });
  const { data: peopleScorecards, isLoading: peopleLoading } =
    useGetBscScorecards({ cycleId: configId });
  const { data: allUsers } = useGetAllUsers();

  const profileImageByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of allUsers?.items || []) {
      const src = resolveProfileImageSrc(user?.profileImage);
      if (user?.id && src) map.set(user.id, src);
    }
    return map;
  }, [allUsers]);

  const uniqueKpis = useMemo(() => {
    const byKey = new Map<string, KpiLibraryItem>();
    for (const kpi of allKpis || []) {
      const key = `${kpi.perspective}::${kpi.name}`;
      if (!byKey.has(key)) byKey.set(key, kpi);
    }
    return Array.from(byKey.values()).sort((a, b) => {
      const byPerspective = a.perspective.localeCompare(b.perspective);
      if (byPerspective) return byPerspective;
      return a.name.localeCompare(b.name);
    });
  }, [allKpis]);

  const people = useMemo(
    () =>
      [...(peopleScorecards || [])].sort((a, b) =>
        (a.userName || '').localeCompare(b.userName || ''),
      ),
    [peopleScorecards],
  );

  const uniquePeople = useMemo(() => {
    const byUser = new Map<string, EmployeeScorecard>();
    for (const person of people) {
      if (!byUser.has(person.userId)) byUser.set(person.userId, person);
    }
    return Array.from(byUser.values()).sort((a, b) =>
      (a.userName || '').localeCompare(b.userName || ''),
    );
  }, [people]);

  const kpiRollupById = useMemo(() => {
    const map = new Map<
      string,
      { averageScore: number; evaluatedCount: number }
    >();
    for (const kpi of uniqueKpis) {
      const rollup = computeKpiRollup(people, kpi.id);
      map.set(kpi.id, {
        averageScore: rollup.averageScore,
        evaluatedCount: rollup.evaluatedCount,
      });
    }
    return map;
  }, [uniqueKpis, people]);

  const filteredKpis = useMemo(() => {
    const q = kpiSearch.trim().toLowerCase();
    if (!q) return uniqueKpis;
    return uniqueKpis.filter(
      (kpi) =>
        kpi.name.toLowerCase().includes(q) ||
        (kpi.perspective || '').toLowerCase().includes(q) ||
        (kpi.measurementUnit || '').toLowerCase().includes(q),
    );
  }, [uniqueKpis, kpiSearch]);

  const loading = configLoading || kpisLoading || peopleLoading;

  const backToBsc = () => {
    setScorecardTab('bsc');
    router.push(scorecardTabHref('bsc'));
  };

  useEffect(() => {
    if (!focusPersonId || !uniquePeople.length) return;
    setListSearch('');
    setListModal('people');
  }, [focusPersonId, uniquePeople.length]);

  const kpiColumns: ColumnsType<KpiLibraryItem> = [
    {
      title: (
        <span data-cy="page-span-245" className={tableHeaderClassName}>
          KPI
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <div data-cy="page-div-249" className="flex flex-col gap-1">
          <span data-cy="page-span-250" className={tableCellClassName}>
            {name}
          </span>
          {row.description ? (
            <span
              data-cy="page-span-252"
              className="text-[12px] text-[#8F94A3]"
            >
              {row.description}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: (
        <span data-cy="page-span-260" className={tableHeaderClassName}>
          Perspective
        </span>
      ),
      dataIndex: 'perspective',
      key: 'perspective',
      width: 180,
      render: (perspective: string) => (
        <Tag className={blueTagClassName}>{perspective}</Tag>
      ),
    },
    {
      title: (
        <span data-cy="page-span-269" className={tableHeaderClassName}>
          Weight
        </span>
      ),
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (weight: number) => (
        <span data-cy="page-span-274" className={tableCellClassName}>
          {weight}%
        </span>
      ),
    },
    {
      title: (
        <span data-cy="page-span-278" className={tableHeaderClassName}>
          Target
        </span>
      ),
      key: 'target',
      width: 140,
      render: (unused, row) => (
        <span data-cy="page-span-282" className={tableCellClassName}>
          {row.defaultTarget != null
            ? `${row.defaultTarget}${row.measurementUnit ? ` ${row.measurementUnit}` : ''}`
            : '—'}
        </span>
      ),
    },
    {
      title: (
        <span data-cy="page-span-290" className={tableHeaderClassName}>
          Check-in
        </span>
      ),
      key: 'checkIn',
      width: 160,
      render: (unused, row) => {
        const cadence = cadenceLabel(row.cadence);
        const day = checkInDayLabel(row.cadence, row.checkInDay);
        if (!cadence)
          return (
            <span data-cy="page-span-296" className={tableCellClassName}>
              —
            </span>
          );
        return (
          <span data-cy="page-span-298" className={tableCellClassName}>
            {[cadence, day].filter(Boolean).join(' · ')}
          </span>
        );
      },
    },
    {
      title: (
        <span data-cy="page-span-305" className={tableHeaderClassName}>
          Avg progress
        </span>
      ),
      key: 'avgProgress',
      width: 200,
      render: (unused, row) => {
        const rollup = kpiRollupById.get(row.id);
        const value =
          rollup && rollup.evaluatedCount > 0 ? rollup.averageScore : null;
        return (
          <ScoreProgressBar
            value={value}
            dataCy={`bsc-scorecard-kpi-avg-${row.id}`}
          />
        );
      },
    },
    {
      title: (
        <span data-cy="page-span-321" className={tableHeaderClassName}>
          Logic
        </span>
      ),
      dataIndex: 'targetLogic',
      key: 'targetLogic',
      width: 140,
      render: (logic: TargetLogic) => (
        <span data-cy="page-span-326" className={tableCellClassName}>
          {targetLogicLabel(logic)}
        </span>
      ),
    },
  ];

  const assignmentSummary = useMemo(() => {
    if (!config) {
      return {
        scope: BscScopeTarget.Company,
        departments: [] as string[],
        roles: [] as string[],
        individuals: [] as string[],
      };
    }
    return {
      scope: resolveScopeLabel(config),
      departments: config.departmentNames || [],
      roles: config.positionTitles || [],
      individuals: config.employeeNames || [],
    };
  }, [config]);

  const openListModal = (kind: ListKind) => {
    setListSearch('');
    setListModal(kind);
  };

  const modalTitle =
    listModal === 'departments'
      ? 'Departments'
      : listModal === 'roles'
        ? 'Roles'
        : 'People';

  const modalSearchPlaceholder =
    listModal === 'departments'
      ? 'Search departments'
      : listModal === 'roles'
        ? 'Search roles'
        : 'Search people';

  const filteredNames = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    const source =
      listModal === 'departments'
        ? assignmentSummary.departments
        : listModal === 'roles'
          ? assignmentSummary.roles
          : [];
    if (!q) return source;
    return source.filter((name) => name.toLowerCase().includes(q));
  }, [listModal, listSearch, assignmentSummary]);

  const filteredPeople = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return uniquePeople;
    return uniquePeople.filter(
      (person) =>
        person.userName.toLowerCase().includes(q) ||
        (person.positionTitle || '').toLowerCase().includes(q) ||
        (person.departmentName || '').toLowerCase().includes(q),
    );
  }, [listSearch, uniquePeople]);

  return (
    <div className="w-full" data-cy="bsc-scorecard-detail-page">
      <CustomBreadcrumb
        title={config?.label || 'Scorecard'}
        subtitle={
          config
            ? [
                resolveScopeLabel(config),
                config.isActive === false ? 'Inactive' : 'Active',
                config.effectiveFrom || config.startDate
                  ? `From ${config.effectiveFrom || config.startDate}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')
            : 'Scorecard detail'
        }
        onBack={backToBsc}
        backControlDataCy="bsc-scorecard-detail-back"
      />

      {loading ? (
        <div
          className="py-16 text-center text-gray-400"
          data-cy="bsc-scorecard-detail-loading"
        >
          Loading…
        </div>
      ) : !config ? (
        <div className="py-12" data-cy="bsc-scorecard-detail-missing">
          <Empty description="Scorecard not found">
            <Button type="primary" onClick={backToBsc}>
              Back to BSC
            </Button>
          </Empty>
        </div>
      ) : (
        <div
          className="flex flex-col gap-4"
          data-cy="bsc-scorecard-detail-body"
        >
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            data-cy="bsc-scorecard-detail-summary-cards"
          >
            <BscKpiCountCard
              label="Departments"
              items={assignmentSummary.departments}
              dataCy="bsc-scorecard-detail-departments-card"
              onViewMore={() => openListModal('departments')}
              className="w-full min-w-0"
            />
            <BscKpiCountCard
              label="Roles"
              items={assignmentSummary.roles}
              dataCy="bsc-scorecard-detail-roles-card"
              onViewMore={() => openListModal('roles')}
              className="w-full min-w-0"
            />
            <BscKpiCountCard
              label="People"
              items={uniquePeople.map((person) => person.userName)}
              dataCy="bsc-scorecard-detail-people-card"
              onViewMore={() => openListModal('people')}
              className="w-full min-w-0"
            />
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-3"
            data-cy="bsc-scorecard-detail-toolbar"
          >
            <BscSearchInput
              placeholder="Search KPIs"
              value={kpiSearch}
              onChange={setKpiSearch}
              data-cy="bsc-scorecard-detail-kpi-search"
            />
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openEditSetup(config)}
              className="bg-[#2b54ad]"
              data-cy="bsc-scorecard-detail-edit"
            >
              Edit
            </Button>
          </div>

          <div data-cy="bsc-scorecard-detail-kpis">
            {!uniqueKpis.length ? (
              <div data-cy="page-div-456" className="py-8">
                <Empty
                  description="No KPIs linked yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : !filteredKpis.length ? (
              <div data-cy="page-div-463" className="py-8">
                <Empty
                  description="No KPIs match your search"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <Table
                className={tableClassName}
                columns={kpiColumns}
                dataSource={filteredKpis}
                pagination={false}
                rowKey="id"
                scroll={{ x: 1020 }}
                rowClassName={(unused, index) =>
                  bscTableRowClassName(index, 'cursor-pointer')
                }
                onRow={(row) => ({
                  onClick: () =>
                    router.push(
                      `/bsc/kpis/${encodeURIComponent(row.id)}?perspective=${encodeURIComponent(row.perspective)}&scorecard=${encodeURIComponent(configId)}`,
                    ),
                })}
                data-cy="bsc-scorecard-detail-kpi-table"
              />
            )}
          </div>
        </div>
      )}

      <Modal
        open={listModal != null}
        onCancel={() => setListModal(null)}
        footer={null}
        centered
        width={480}
        destroyOnClose
        closeIcon={<CloseOutlined />}
        title={modalTitle}
        data-cy="bsc-scorecard-detail-list-modal"
      >
        <div className="mt-2" data-cy="bsc-scorecard-detail-list-modal-body">
          <BscSearchInput
            placeholder={modalSearchPlaceholder}
            value={listSearch}
            onChange={setListSearch}
            className="!w-full"
            data-cy="bsc-scorecard-detail-list-search"
          />
          <div
            className="mt-4 max-h-[360px] overflow-y-auto"
            data-cy="bsc-scorecard-detail-list-results"
          >
            {listModal === 'people' ? (
              filteredPeople.length ? (
                <div className="flex flex-col gap-1">
                  {filteredPeople.map((person) => (
                    <button
                      key={person.userId}
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-2 py-2 text-left hover:bg-[#FAFAFA] ${
                        focusPersonId && person.userId === focusPersonId
                          ? 'bg-[#E6F4FF]'
                          : ''
                      }`}
                      onClick={() =>
                        router.push(
                          `/bsc/employees/${encodeURIComponent(person.userId)}?scorecard=${encodeURIComponent(person.id)}`,
                        )
                      }
                      data-cy={`bsc-scorecard-person-row-${person.userId}`}
                    >
                      <Avatar
                        size={32}
                        src={profileImageByUserId.get(person.userId)}
                        icon={<UserOutlined />}
                        className="shrink-0 bg-[#E6F4FF] text-[#1677ff]"
                      >
                        {nameInitials(person.userName)}
                      </Avatar>
                      <div className="min-w-0 flex flex-col">
                        <span className="truncate text-sm font-medium text-[#262626]">
                          {person.userName}
                        </span>
                        <span className="truncate text-xs text-[#8F94A3]">
                          {[person.positionTitle, person.departmentName]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    listSearch.trim()
                      ? 'No people match your search'
                      : 'No people assigned'
                  }
                />
              )
            ) : filteredNames.length ? (
              <div className="flex flex-col gap-1">
                {filteredNames.map((name) => (
                  <div
                    key={name}
                    className="rounded-lg px-3 py-2 text-sm text-[#262626] hover:bg-[#FAFAFA]"
                    data-cy={`bsc-scorecard-list-item-${name}`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  listSearch.trim()
                    ? `No ${modalTitle.toLowerCase()} match your search`
                    : `No ${modalTitle.toLowerCase()} assigned`
                }
              />
            )}
          </div>
        </div>
      </Modal>

      <BscSetupModal />
    </div>
  );
}
