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
  useGetBscPerspectiveCatalog,
  useGetBscScorecardAssignments,
} from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeUuid(value?: string | null): boolean {
  return Boolean(value && UUID_RE.test(value));
}

function asNamedList(data: unknown): Array<{ id: string; name: string }> {
  const raw = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown })?.items)
      ? ((data as { items: unknown[] }).items)
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

function resolveNamedLabels(
  ids: string[] | undefined,
  labels: string[] | undefined,
  nameById: Map<string, string>,
): string[] {
  const count = Math.max(ids?.length || 0, labels?.length || 0);
  const resolved: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const id = ids?.[i];
    const label = labels?.[i];
    const fromOrg = id ? nameById.get(id) : undefined;
    if (fromOrg) {
      resolved.push(fromOrg);
      continue;
    }
    if (label && !looksLikeUuid(label)) {
      resolved.push(label);
      continue;
    }
    if (id && !looksLikeUuid(id)) {
      resolved.push(id);
      continue;
    }
    if (label) resolved.push(label);
    else if (id) resolved.push(id);
  }
  return resolved.filter(Boolean);
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
  // Catalog enrichment only (names / perspective) — not the scorecard KPI set.
  const { data: catalogKpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: perspectiveCatalog } = useGetBscPerspectiveCatalog();
  const { data: peopleScorecards, isLoading: peopleLoading } =
    useGetBscScorecardAssignments(configId);
  const { data: allUsers } = useGetAllUsers();
  const { data: departmentsData } = useGetDepartments();
  const { data: positionsData } = useGetAllPositions();

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

  const profileImageByUserId = useMemo(() => {
    const map = new Map<string, string>();
    const list = Array.isArray(allUsers?.items)
      ? allUsers.items
      : Array.isArray(allUsers)
        ? allUsers
        : [];
    for (const user of list) {
      const src = resolveProfileImageSrc(user?.profileImage);
      if (user?.id && src) map.set(user.id, src);
    }
    return map;
  }, [allUsers]);

  const uniqueKpis = useMemo(() => {
    const catalogById = new Map(
      (catalogKpis || []).map((kpi) => [kpi.id, kpi]),
    );
    const perspectiveNameById = new Map(
      (perspectiveCatalog || []).map((p) => [p.id, p.name]),
    );
    const looksLikeId = (value?: string | null) =>
      Boolean(
        value &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            value,
          ),
      );
    const resolvePerspectiveName = (
      lineName?: string | null,
      catalogName?: string | null,
    ) => {
      if (catalogName && !looksLikeId(catalogName)) return catalogName;
      if (lineName && !looksLikeId(lineName)) return lineName;
      if (catalogName && looksLikeId(catalogName)) {
        return perspectiveNameById.get(catalogName) || catalogName;
      }
      if (lineName && looksLikeId(lineName)) {
        return perspectiveNameById.get(lineName) || lineName;
      }
      return 'Perspective';
    };
    const lines = config?.templateKpis || [];

    // Prefer KPIs linked on the scorecard template (what was selected at create).
    if (lines.length) {
      return lines
        .map((line): KpiLibraryItem => {
          const catalog = catalogById.get(line.kpiLibraryId);
          return {
            id: line.kpiLibraryId,
            evaluationConfigId: configId,
            name: line.name || catalog?.name || 'KPI',
            description: line.description ?? catalog?.description ?? null,
            perspective: resolvePerspectiveName(
              line.perspective,
              catalog?.perspective,
            ),
            targetLogic:
              line.targetLogic ||
              catalog?.targetLogic ||
              TargetLogic.HigherBetter,
            measurementUnit:
              line.measurementUnit || catalog?.measurementUnit || '',
            defaultTarget: line.targetValue ?? catalog?.defaultTarget ?? null,
            weight: line.weightPercentage,
            suggestedWeight: line.weightPercentage,
            worstCase: line.worstCase ?? catalog?.worstCase ?? null,
            bestCase: line.bestCase ?? catalog?.bestCase ?? null,
            cadence: line.cadence ?? catalog?.cadence ?? null,
            checkInDay: line.checkInDay ?? catalog?.checkInDay ?? null,
            createdAt: catalog?.createdAt || new Date().toISOString(),
          };
        })
        .sort((a, b) => {
          const byPerspective = a.perspective.localeCompare(b.perspective);
          if (byPerspective) return byPerspective;
          return a.name.localeCompare(b.name);
        });
    }

    // Mock / legacy fallback: filter catalog by evaluationConfigId.
    const byKey = new Map<string, KpiLibraryItem>();
    for (const kpi of catalogKpis || []) {
      if (kpi.evaluationConfigId && kpi.evaluationConfigId !== configId) {
        continue;
      }
      const key = `${kpi.perspective}::${kpi.name}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          ...kpi,
          perspective: resolvePerspectiveName(null, kpi.perspective),
        });
      }
    }
    return Array.from(byKey.values()).sort((a, b) => {
      const byPerspective = a.perspective.localeCompare(b.perspective);
      if (byPerspective) return byPerspective;
      return a.name.localeCompare(b.name);
    });
  }, [catalogKpis, config?.templateKpis, configId, perspectiveCatalog]);

  const people = useMemo(
    () =>
      [...(peopleScorecards || [])].sort((a, b) =>
        (a.userName || '').localeCompare(b.userName || ''),
      ),
    [peopleScorecards],
  );

  const uniquePeople = useMemo(() => {
    const list = Array.isArray(allUsers?.items)
      ? allUsers.items
      : Array.isArray(allUsers)
        ? allUsers
        : [];
    const usersById = new Map(list.map((user: any) => [user.id, user]));
    const byUser = new Map<string, EmployeeScorecard>();
    for (const person of people) {
      if (byUser.has(person.userId)) continue;
      const user = usersById.get(person.userId);
      const first = user?.firstName || user?.first_name || '';
      const last = user?.lastName || user?.last_name || '';
      const fullName = `${first} ${last}`.replace(/\s+/g, ' ').trim();
      const resolvedName =
        fullName ||
        user?.email ||
        (person.userName && !looksLikeUuid(person.userName)
          ? person.userName
          : '') ||
        person.userId;
      byUser.set(person.userId, {
        ...person,
        userName: resolvedName,
        departmentName:
          person.departmentName ||
          (person.departmentId
            ? departmentNameById.get(person.departmentId)
            : null) ||
          user?.department?.name ||
          user?.departmentName ||
          null,
        positionTitle:
          person.positionTitle ||
          (person.positionId
            ? positionNameById.get(person.positionId)
            : null) ||
          user?.position?.name ||
          user?.positionTitle ||
          null,
      });
    }
    return Array.from(byUser.values()).sort((a, b) =>
      (a.userName || '').localeCompare(b.userName || ''),
    );
  }, [people, allUsers, departmentNameById, positionNameById]);

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
      departments: resolveNamedLabels(
        config.departmentIds,
        config.departmentNames,
        departmentNameById,
      ),
      roles: resolveNamedLabels(
        config.positionIds,
        config.positionTitles,
        positionNameById,
      ),
      individuals: resolveNamedLabels(
        config.employeeIds,
        config.employeeNames,
        new Map(
          uniquePeople.map((person) => [person.userId, person.userName]),
        ),
      ),
    };
  }, [config, departmentNameById, positionNameById, uniquePeople]);

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
              emptyLabel="None assigned"
              dataCy="bsc-scorecard-detail-departments-card"
              onViewMore={() => openListModal('departments')}
              className="w-full min-w-0"
            />
            <BscKpiCountCard
              label="Roles"
              items={assignmentSummary.roles}
              emptyLabel="None assigned"
              dataCy="bsc-scorecard-detail-roles-card"
              onViewMore={() => openListModal('roles')}
              className="w-full min-w-0"
            />
            <BscKpiCountCard
              label="People"
              items={uniquePeople.map((person) => person.userName)}
              emptyLabel="No people assigned yet"
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
                <div
                  className="flex flex-col gap-1"
                  data-cy="bsc-scorecard-detail-people-list"
                >
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
                      <div
                        className="min-w-0 flex flex-col"
                        data-cy={`bsc-scorecard-person-meta-${person.userId}`}
                      >
                        <span
                          className="truncate text-sm font-medium text-[#262626]"
                          data-cy={`bsc-scorecard-person-name-${person.userId}`}
                        >
                          {person.userName}
                        </span>
                        <span
                          className="truncate text-xs text-[#8F94A3]"
                          data-cy={`bsc-scorecard-person-detail-${person.userId}`}
                        >
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
                      : 'No people assigned yet'
                  }
                />
              )
            ) : filteredNames.length ? (
              <div
                className="flex flex-col gap-1"
                data-cy="bsc-scorecard-detail-names-list"
              >
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
