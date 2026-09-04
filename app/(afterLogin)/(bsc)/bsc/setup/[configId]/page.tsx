'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Empty, Progress, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  LeftOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import {
  useGetBscCycle,
  useGetBscKpiLibrary,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscScopeTarget,
  BscSetupKind,
  EvaluationCycle,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';
import BscSetupModal from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-setup/_components/BscSetupModal';
import { computeKpiRollup, formatScore } from '@/utils/bsc/rollup';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';
const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';

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

function horizonLabel(config?: EvaluationCycle | null): string {
  if (!config) return '—';
  if (config.setupKind === BscSetupKind.Temporary) return 'Temporary';
  if (config.setupKind === BscSetupKind.Permanent) return 'Permanent';
  return config.useCustomDates ? 'Temporary' : 'Permanent';
}

function isPermanentSetup(config: EvaluationCycle): boolean {
  if (config.setupKind === BscSetupKind.Permanent) return true;
  if (config.setupKind === BscSetupKind.Temporary) return false;
  return !config.useCustomDates;
}

function activePeriodLabel(config: EvaluationCycle): string {
  const labels = config.periodLabels || [];
  return labels[labels.length - 1] || labels[0] || '—';
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

function AssignmentSection({
  title,
  description,
  items,
  emptyText,
  dataCy,
}: {
  title: string;
  description?: string;
  items: string[];
  emptyText: string;
  dataCy: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
      data-cy={dataCy}
    >
      <div className="px-5 pb-3 pt-4">
        <h2 className="m-0 text-lg font-semibold text-[#262626]">{title}</h2>
        {description ? (
          <p className="mb-3 mt-1 text-[12px] text-[#8F94A3]">{description}</p>
        ) : (
          <div className="mb-3" />
        )}
        {!items.length ? (
          <p className="m-0 text-[13px] text-[#94A3B8]">{emptyText}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <Tag key={item} className={blueTagClassName}>
                {item}
              </Tag>
            ))}
          </div>
        )}
      </div>
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
    router.push('/bsc/my-scorecard');
  };

  useEffect(() => {
    if (!focusPersonId || !people.length) return;
    const timer = window.setTimeout(() => {
      const el = document.querySelector(
        `[data-cy="bsc-scorecard-person-row-${focusPersonId}"]`,
      );
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [focusPersonId, people]);

  const kpiColumns: ColumnsType<KpiLibraryItem> = [
    {
      title: <span className={tableHeaderClassName}>KPI</span>,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <div className="flex flex-col gap-1">
          <span className={tableCellClassName}>{name}</span>
          {row.description ? (
            <span className="text-[12px] text-[#8F94A3]">{row.description}</span>
          ) : null}
        </div>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Perspective</span>,
      dataIndex: 'perspective',
      key: 'perspective',
      width: 180,
      render: (perspective: string) => (
        <Tag className={blueTagClassName}>{perspective}</Tag>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Weight</span>,
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (weight: number) => (
        <span className={tableCellClassName}>{weight}%</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Target</span>,
      key: 'target',
      width: 140,
      render: (unused, row) => (
        <span className={tableCellClassName}>
          {row.defaultTarget != null
            ? `${row.defaultTarget}${row.measurementUnit ? ` ${row.measurementUnit}` : ''}`
            : '—'}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Avg progress</span>,
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
      title: <span className={tableHeaderClassName}>Logic</span>,
      dataIndex: 'targetLogic',
      key: 'targetLogic',
      width: 140,
      render: (logic: TargetLogic) => (
        <span className={tableCellClassName}>{targetLogicLabel(logic)}</span>
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

  return (
    <div className="w-full" data-cy="bsc-scorecard-detail-page">
      <CustomBreadcrumb
        title={config?.label || 'Scorecard'}
        subtitle={
          config
            ? [
                horizonLabel(config),
                config.cadence,
                isPermanentSetup(config)
                  ? activePeriodLabel(config)
                  : (config.periodLabels || [])[0],
              ]
                .filter(Boolean)
                .join(' · ')
            : 'Scorecard detail'
        }
      />

      <div className="mb-4" data-cy="bsc-scorecard-detail-back-wrap">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={backToBsc}
          className="!px-0 text-[#595959]"
          data-cy="bsc-scorecard-detail-back"
        >
          BSC
        </Button>
      </div>

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
        <div className="flex flex-col gap-4" data-cy="bsc-scorecard-detail-body">
          <div
            className="flex flex-wrap items-start justify-between gap-3"
            data-cy="bsc-scorecard-detail-header"
          >
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Tag className={blueTagClassName}>{horizonLabel(config)}</Tag>
                <Tag className={blueTagClassName}>{config.cadence}</Tag>
                <Tag className={blueTagClassName}>
                  {assignmentSummary.scope}
                </Tag>
              </div>
              {config.description ? (
                <p className="m-0 max-w-3xl text-[13px] text-[#8F94A3]">
                  {config.description}
                </p>
              ) : null}
            </div>
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

          <div
            className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
            data-cy="bsc-scorecard-detail-kpis"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-2 pt-4">
              <div>
                <h2 className="m-0 text-lg font-semibold text-[#262626]">
                  Scorecard KPIs
                </h2>
                <p className="mb-0 mt-1 text-[12px] text-[#8F94A3]">
                  Shared KPIs on this scorecard template.
                </p>
              </div>
              <BscSearchInput
                placeholder="Search KPIs"
                value={kpiSearch}
                onChange={setKpiSearch}
                data-cy="bsc-scorecard-detail-kpi-search"
              />
            </div>

            {!uniqueKpis.length ? (
              <div className="px-5 pb-8 pt-4">
                <Empty
                  description="No KPIs linked yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : !filteredKpis.length ? (
              <div className="px-5 pb-8 pt-4">
                <Empty
                  description="No KPIs match your search"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <Table
                className="w-full [&_.ant-table]:!border-[#D9D9D9]"
                columns={kpiColumns}
                dataSource={filteredKpis}
                pagination={false}
                rowKey="id"
                scroll={{ x: 1020 }}
                onRow={(row) => ({
                  onClick: () =>
                    router.push(
                      `/bsc/kpis/${encodeURIComponent(row.id)}?perspective=${encodeURIComponent(row.perspective)}&scorecard=${encodeURIComponent(configId)}`,
                    ),
                  className: 'cursor-pointer',
                })}
                data-cy="bsc-scorecard-detail-kpi-table"
              />
            )}
          </div>

          {assignmentSummary.scope === BscScopeTarget.Company ? (
            <div
              className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-4"
              data-cy="bsc-scorecard-detail-company"
            >
              <h2 className="m-0 text-lg font-semibold text-[#262626]">
                Company
              </h2>
              <p className="mb-0 mt-1 text-[13px] text-[#8F94A3]">
                Applies the scorecard template organization-wide.
              </p>
            </div>
          ) : (
            (() => {
              const showDepartments =
                assignmentSummary.scope === BscScopeTarget.Department ||
                assignmentSummary.departments.length > 0;
              const showRoles =
                assignmentSummary.scope === BscScopeTarget.Role ||
                assignmentSummary.roles.length > 0;
              const showEmployees =
                assignmentSummary.scope === BscScopeTarget.Individual ||
                assignmentSummary.individuals.length > 0;
              const sectionCount =
                Number(showDepartments) +
                Number(showRoles) +
                Number(showEmployees);

              if (!sectionCount) return null;

              return (
                <div
                  className={`grid grid-cols-1 gap-4 ${
                    sectionCount > 1 ? 'md:grid-cols-2' : ''
                  }`}
                  data-cy="bsc-scorecard-detail-assignments"
                >
                  {showDepartments ? (
                    <AssignmentSection
                      title="Departments"
                      description="Departments included in this scorecard scope."
                      items={assignmentSummary.departments}
                      emptyText="No departments assigned"
                      dataCy="bsc-scorecard-detail-departments"
                    />
                  ) : null}

                  {showRoles ? (
                    <AssignmentSection
                      title="Roles"
                      description="Roles included in this scorecard scope."
                      items={assignmentSummary.roles}
                      emptyText="No roles assigned"
                      dataCy="bsc-scorecard-detail-roles"
                    />
                  ) : null}

                  {showEmployees ? (
                    <AssignmentSection
                      title="Employees"
                      description="Individuals assigned directly to this scorecard."
                      items={assignmentSummary.individuals}
                      emptyText="No employees assigned"
                      dataCy="bsc-scorecard-detail-employees"
                    />
                  ) : null}
                </div>
              );
            })()
          )}

          <div
            className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
            data-cy="bsc-scorecard-detail-people"
          >
            <div className="px-5 pb-3 pt-4">
              <h2 className="m-0 text-lg font-semibold text-[#262626]">
                People
              </h2>
              <p className="mb-3 mt-1 text-[12px] text-[#8F94A3]">
                Assignees with scorecards on this program.
              </p>
              {!people.length ? (
                <p className="m-0 text-[13px] text-[#94A3B8]">
                  No employee scorecards for this program yet
                </p>
              ) : (
                <div
                  className="flex flex-wrap gap-1.5"
                  data-cy="bsc-scorecard-detail-people-list"
                >
                  {people.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className={`inline-flex max-w-[220px] items-center gap-1.5 rounded-md border border-[#91caff] bg-[#e6f4ff] py-0.5 pl-0.5 pr-2 text-left transition-opacity hover:opacity-90 ${
                        focusPersonId && person.userId === focusPersonId
                          ? 'ring-1 ring-[#1677ff]'
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
                        size={22}
                        src={profileImageByUserId.get(person.userId)}
                        icon={<UserOutlined />}
                        className="shrink-0 bg-white text-[#1677ff]"
                      >
                        {nameInitials(person.userName)}
                      </Avatar>
                      <span className="truncate text-[12px] font-medium text-[#1677ff]">
                        {person.userName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BscSetupModal />
    </div>
  );
}
