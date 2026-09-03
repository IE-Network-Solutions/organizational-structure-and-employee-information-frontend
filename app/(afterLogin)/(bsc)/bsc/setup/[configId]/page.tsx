'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Button, Collapse, Empty, Tag } from 'antd';
import {
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  useGetBscCycle,
  useGetBscKpiLibrary,
  useGetBscRolePerspectives,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useRemoveIndividualBscKpi } from '@/store/server/features/bsc/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscSetupKind,
  EmployeeScorecard,
  EvaluationCycle,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';
import BscSetupModal from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-setup/_components/BscSetupModal';
import AssignIndividualKpisModal from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-setup/_components/AssignIndividualKpisModal';

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

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function InfoChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-3"
      data-cy="-bsc-bsc-setup-configid-page-div-1"
    >
      <p
        className="m-0 text-[11px] font-normal text-[#8c8c8c]"
        data-cy="-bsc-bsc-setup-configid-page-p-2"
      >
        {label}
      </p>
      <p
        className="m-0 mt-1 text-[14px] font-semibold text-[#262626]"
        data-cy="-bsc-bsc-setup-configid-page-p-3"
      >
        {value}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  'data-cy': dataCy,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  'data-cy'?: string;
}) {
  return (
    <section className="rounded-[12px] bg-[#F9FAFB] p-5" data-cy={dataCy}>
      <h2
        className="mb-1 text-[15px] font-semibold text-[#262626]"
        data-cy="-bsc-bsc-setup-configid-page-h2-4"
      >
        {title}
      </h2>
      {description ? (
        <p
          className="mb-4 text-[12px] text-[#8F94A3]"
          data-cy="-bsc-bsc-setup-configid-page-p-5"
        >
          {description}
        </p>
      ) : (
        <div className="mb-3" data-cy="-bsc-bsc-setup-configid-page-div-6" />
      )}
      {children}
    </section>
  );
}

function ChipList({
  items,
  emptyText,
}: {
  items: string[];
  emptyText: string;
}) {
  if (!items.length) {
    return (
      <p
        className="m-0 text-[13px] text-[#94A3B8]"
        data-cy="-bsc-bsc-setup-configid-page-p-7"
      >
        {emptyText}
      </p>
    );
  }
  return (
    <div
      className="flex flex-wrap gap-2"
      data-cy="-bsc-bsc-setup-configid-page-div-8"
    >
      {items.map((item) => (
        <span
          key={item}
          className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
          data-cy="-bsc-bsc-setup-configid-page-span-9"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <Tag className="m-0 rounded-md border border-[#d9d9d9] bg-[#fafafa] px-3 py-0.5 text-xs font-normal text-[#595959]">
      {children}
    </Tag>
  );
}

export default function BscScorecardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const configId = String(params?.configId || '');
  const searchParams = useSearchParams();
  const focusPersonId = searchParams?.get('person') || '';
  const { openEditSetup, setScorecardTab } = useBscUiStore();
  const focusedPersonRef = useRef<HTMLDivElement | null>(null);
  const [individualTarget, setIndividualTarget] =
    useState<EmployeeScorecard | null>(null);

  const { data: config, isLoading: configLoading } = useGetBscCycle(configId);
  const { data: allKpis, isLoading: kpisLoading } = useGetBscKpiLibrary({
    evaluationConfigId: configId,
  });
  const { data: allocations } = useGetBscRolePerspectives({
    evaluationConfigId: configId,
  });
  const { data: peopleScorecards, isLoading: peopleLoading } =
    useGetBscScorecards({ cycleId: configId });
  const { data: allUsers } = useGetAllUsers();
  const removeIndividualKpi = useRemoveIndividualBscKpi();

  const profileImageByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of allUsers?.items || []) {
      const src = resolveProfileImageSrc(user?.profileImage);
      if (user?.id && src) map.set(user.id, src);
    }
    return map;
  }, [allUsers]);

  const kpis = useMemo(() => allKpis || [], [allKpis]);

  const perspectiveWeights = useMemo(() => {
    const map: Record<string, number> = {};
    for (const alloc of allocations || []) {
      for (const [name, weight] of Object.entries(alloc.weights || {})) {
        if (!weight) continue;
        // Prefer first non-zero allocation weight for this perspective
        if (map[name] == null) map[name] = Number(weight);
      }
    }
    // Fallback: derive from KPI weight totals when no allocations
    if (!Object.keys(map).length) {
      const totals: Record<string, number> = {};
      const seen = new Set<string>();
      for (const kpi of kpis) {
        const key = `${kpi.perspective}::${kpi.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        totals[kpi.perspective] =
          (totals[kpi.perspective] || 0) + Number(kpi.weight || 0);
      }
      return totals;
    }
    return map;
  }, [allocations, kpis]);

  const perspectives = useMemo(() => {
    const names = new Set<string>(Object.keys(perspectiveWeights));
    for (const kpi of kpis) names.add(kpi.perspective);
    return Array.from(names).sort();
  }, [perspectiveWeights, kpis]);

  const kpisByPerspective = useMemo(() => {
    const map = new Map<string, KpiLibraryItem[]>();
    for (const kpi of kpis) {
      const list = map.get(kpi.perspective) || [];
      list.push(kpi);
      map.set(kpi.perspective, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [kpis]);

  const loading = configLoading || kpisLoading || peopleLoading;

  const people = useMemo(
    () =>
      [...(peopleScorecards || [])].sort((a, b) =>
        (a.userName || '').localeCompare(b.userName || ''),
      ),
    [peopleScorecards],
  );

  useEffect(() => {
    if (!focusPersonId || !people.length) return;
    const timer = window.setTimeout(() => {
      focusedPersonRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [focusPersonId, people]);

  if (loading) {
    return (
      <div
        className="rounded-xl bg-white px-8 py-16 text-center text-gray-400"
        data-cy="bsc-scorecard-detail-loading"
      >
        Loading…
      </div>
    );
  }

  if (!config) {
    return (
      <div
        className="rounded-xl bg-white px-8 py-16"
        data-cy="bsc-scorecard-detail-missing"
      >
        <Empty
          description="Scorecard not found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            onClick={() => {
              setScorecardTab('bsc');
              router.push('/bsc/my-scorecard');
            }}
          >
            Back to BSC
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="w-full" data-cy="bsc-scorecard-detail-page">
      <div
        className="rounded-xl bg-white px-6 py-5 sm:px-8 sm:py-6"
        data-cy="-bsc-bsc-setup-configid-page-div-10"
      >
        <div className="mb-6" data-cy="-bsc-bsc-setup-configid-page-div-11">
          <button
            type="button"
            className="mb-3 inline-flex items-center gap-1 border-none bg-transparent p-0 text-[13px] text-[#595959] cursor-pointer hover:text-[#2b54ad]"
            onClick={() => {
              setScorecardTab('bsc');
              router.push('/bsc/my-scorecard');
            }}
            data-cy="bsc-scorecard-detail-back"
          >
            <LeftOutlined className="text-[11px]" />
            Back to scorecards
          </button>
          <div
            className="flex flex-wrap items-center justify-between gap-2"
            data-cy="-bsc-bsc-setup-configid-page-div-12"
          >
            <div
              className="flex min-w-0 flex-wrap items-center gap-2"
              data-cy="-bsc-bsc-setup-configid-page-div-13"
            >
              <h1
                className="m-0 text-xl font-bold text-[#262626]"
                data-cy="-bsc-bsc-setup-configid-page-h1-14"
              >
                {config.label}
              </h1>
              <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                {horizonLabel(config)}
              </Tag>
              <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                {config.cadence}
              </Tag>
            </div>
            <Button
              type="text"
              icon={<EditOutlined />}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-[#595959] hover:text-[#2b54ad]"
              onClick={() => openEditSetup(config)}
              aria-label="Edit scorecard"
              data-cy="bsc-scorecard-detail-edit"
            />
          </div>
          {config.description ? (
            <p
              className="m-0 mt-2 max-w-3xl text-[13px] text-[#8F94A3]"
              data-cy="-bsc-bsc-setup-configid-page-p-15"
            >
              {config.description}
            </p>
          ) : null}
        </div>

        <div
          className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-5"
          data-cy="-bsc-bsc-setup-configid-page-div-16"
        >
          <div
            className="flex flex-col gap-5 lg:col-span-5"
            data-cy="-bsc-bsc-setup-configid-page-div-17"
          >
            <SectionCard
              title={isPermanentSetup(config) ? 'Active period' : 'Overview'}
              data-cy="bsc-scorecard-detail-overview"
            >
              {isPermanentSetup(config) ? (
                <InfoChip
                  label="Current period"
                  value={activePeriodLabel(config)}
                />
              ) : (
                <div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  data-cy="-bsc-bsc-setup-configid-page-div-18"
                >
                  <InfoChip
                    label="Period"
                    value={(config.periodLabels || [])[0] || '—'}
                  />
                  <InfoChip
                    label="Dates"
                    value={`${config.startDate} → ${config.endDate}`}
                  />
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Assignment scope"
              description="Who this scorecard is assigned to."
              data-cy="bsc-scorecard-detail-scope"
            >
              <div
                className="flex flex-col gap-4"
                data-cy="-bsc-bsc-setup-configid-page-div-19"
              >
                <div data-cy="-bsc-bsc-setup-configid-page-div-20">
                  <p
                    className="mb-2 text-[13px] font-semibold text-[#262626]"
                    data-cy="-bsc-bsc-setup-configid-page-p-21"
                  >
                    Departments
                  </p>
                  <ChipList
                    items={config.departmentNames || []}
                    emptyText="No departments assigned"
                  />
                </div>
                <div data-cy="-bsc-bsc-setup-configid-page-div-22">
                  <p
                    className="mb-2 text-[13px] font-semibold text-[#262626]"
                    data-cy="-bsc-bsc-setup-configid-page-p-23"
                  >
                    Roles
                  </p>
                  <ChipList
                    items={config.positionTitles || []}
                    emptyText="No roles assigned"
                  />
                </div>
                <div data-cy="-bsc-bsc-setup-configid-page-div-24">
                  <p
                    className="mb-2 text-[13px] font-semibold text-[#262626]"
                    data-cy="-bsc-bsc-setup-configid-page-p-25"
                  >
                    Individuals
                  </p>
                  <ChipList
                    items={config.employeeNames || []}
                    emptyText="No individuals assigned"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="People & individual KPIs"
              description="Append extra KPIs to one person only. Shared scorecard KPIs for everyone else stay the same; this person's weights are rebalanced to 100%."
              data-cy="bsc-scorecard-detail-people"
            >
              {!people.length ? (
                <p
                  className="m-0 text-[13px] text-[#94A3B8]"
                  data-cy="-bsc-bsc-setup-configid-page-p-26"
                >
                  No employee scorecards for this program yet. Assign by
                  individual in Edit, or wait until role cascade creates
                  scorecards.
                </p>
              ) : (
                <div
                  className="flex flex-col gap-2"
                  data-cy="-bsc-bsc-setup-configid-page-div-27"
                >
                  {people.map((person) => {
                    const sharedCount = person.targets.filter(
                      (t) => (t.assignmentSource || 'shared') === 'shared',
                    ).length;
                    const individualTargets = person.targets.filter(
                      (t) => t.assignmentSource === 'individual',
                    );
                    return (
                      <div
                        key={person.id}
                        ref={
                          focusPersonId && person.userId === focusPersonId
                            ? focusedPersonRef
                            : undefined
                        }
                        className={`rounded-[6px] border px-3 py-3 ${
                          focusPersonId && person.userId === focusPersonId
                            ? 'border-[#1677ff] bg-[#e6f4ff] ring-2 ring-[#91caff]'
                            : 'border-[#d9d9d9] bg-[#fafafa]'
                        }`}
                        data-cy={`bsc-scorecard-person-${person.id}`}
                      >
                        <div
                          className="flex flex-wrap items-start justify-between gap-3"
                          data-cy="-bsc-bsc-setup-configid-page-div-28"
                        >
                          <div
                            className="flex min-w-0 items-start gap-3"
                            data-cy="-bsc-bsc-setup-configid-page-div-29"
                          >
                            <Avatar
                              size={40}
                              src={profileImageByUserId.get(person.userId)}
                              icon={<UserOutlined />}
                              className="shrink-0 bg-[#E6F4FF] text-[#1677ff]"
                              data-cy={`bsc-scorecard-person-avatar-${person.id}`}
                            >
                              {nameInitials(person.userName)}
                            </Avatar>
                            <div
                              className="min-w-0"
                              data-cy={`bsc-scorecard-person-info-${person.id}`}
                            >
                              <p
                                className="m-0 text-[13px] font-semibold text-[#262626]"
                                data-cy="-bsc-bsc-setup-configid-page-p-30"
                              >
                                {person.userName}
                              </p>
                              <p
                                className="m-0 mt-0.5 text-[11px] text-[#8F94A3]"
                                data-cy="-bsc-bsc-setup-configid-page-p-31"
                              >
                                {[person.positionTitle, person.departmentName]
                                  .filter(Boolean)
                                  .join(' · ') || '—'}
                              </p>
                              <div
                                className="mt-2 flex flex-wrap items-center gap-1.5"
                                data-cy="-bsc-bsc-setup-configid-page-div-32"
                              >
                                <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                                  {sharedCount} shared
                                </Tag>
                                <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                                  {individualTargets.length} individual
                                </Tag>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="default"
                            size="small"
                            icon={<PlusOutlined />}
                            className="border-[#d9d9d9] text-[#262626]"
                            onClick={() => setIndividualTarget(person)}
                            data-cy={`bsc-scorecard-person-add-kpis-${person.id}`}
                          >
                            Add KPIs
                          </Button>
                        </div>
                        {individualTargets.length ? (
                          <div
                            className="mt-3 flex flex-col gap-1.5 border-t border-[#e5e7eb] pt-3"
                            data-cy="-bsc-bsc-setup-configid-page-div-33"
                          >
                            {individualTargets.map((target) => (
                              <div
                                key={target.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#d9d9d9] bg-white px-2.5 py-2"
                                data-cy="-bsc-bsc-setup-configid-page-div-34"
                              >
                                <div
                                  className="min-w-0"
                                  data-cy="-bsc-bsc-setup-configid-page-div-35"
                                >
                                  <p
                                    className="m-0 text-[12px] font-medium text-[#262626]"
                                    data-cy="-bsc-bsc-setup-configid-page-p-36"
                                  >
                                    {target.kpiName}
                                  </p>
                                  <p
                                    className="m-0 text-[11px] text-[#8F94A3]"
                                    data-cy="-bsc-bsc-setup-configid-page-p-37"
                                  >
                                    {target.perspective} · Weight{' '}
                                    {target.weightPercentage}% · Target{' '}
                                    {target.targetValue}
                                  </p>
                                </div>
                                <Button
                                  type="link"
                                  size="small"
                                  danger
                                  className="px-0"
                                  loading={removeIndividualKpi.isLoading}
                                  onClick={() =>
                                    removeIndividualKpi.mutate({
                                      scorecardId: person.id,
                                      targetId: target.id,
                                    })
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          <div
            className="lg:col-span-7"
            data-cy="-bsc-bsc-setup-configid-page-div-38"
          >
            <SectionCard
              title="Linked perspectives & KPIs"
              description="KPIs under each perspective, with weight and target details."
              data-cy="bsc-scorecard-detail-perspectives"
            >
              {!perspectives.length ? (
                <div
                  className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-4 py-10 text-center text-[13px] text-[#94A3B8]"
                  data-cy="-bsc-bsc-setup-configid-page-div-39"
                >
                  No perspectives or KPIs linked yet.
                </div>
              ) : (
                <Collapse
                  accordion={false}
                  defaultActiveKey={[]}
                  bordered={false}
                  className="bg-transparent [&_.ant-collapse-item]:mb-2 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-item]:rounded-[6px] [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-[#d9d9d9] [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-solid [&_.ant-collapse-item]:bg-[#fafafa] [&_.ant-collapse-header]:px-3 [&_.ant-collapse-header]:py-3 [&_.ant-collapse-content]:bg-[#fafafa] [&_.ant-collapse-content-box]:px-3 [&_.ant-collapse-content-box]:pb-3 [&_.ant-collapse-content-box]:pt-0"
                  data-cy="bsc-scorecard-detail-accordion"
                >
                  {perspectives.map((perspective) => {
                    const perspectiveKpis =
                      kpisByPerspective.get(perspective) || [];
                    const weight = perspectiveWeights[perspective];
                    return (
                      <Collapse.Panel
                        key={perspective}
                        header={
                          <div
                            className="flex flex-wrap items-center justify-between gap-3 pr-2"
                            data-cy="-bsc-bsc-setup-configid-page-div-40"
                          >
                            <span
                              className="text-[14px] font-semibold text-[#262626]"
                              data-cy="-bsc-bsc-setup-configid-page-span-41"
                            >
                              {perspective}
                            </span>
                            <div
                              className="flex items-center gap-2"
                              data-cy="-bsc-bsc-setup-configid-page-div-42"
                            >
                              <span
                                className="text-[11px] font-normal text-[#8F94A3]"
                                data-cy="-bsc-bsc-setup-configid-page-span-43"
                              >
                                {perspectiveKpis.length} KPI
                                {perspectiveKpis.length === 1 ? '' : 's'}
                              </span>
                              {weight != null ? (
                                <MetaTag>{weight}%</MetaTag>
                              ) : null}
                            </div>
                          </div>
                        }
                      >
                        {!perspectiveKpis.length ? (
                          <p
                            className="m-0 text-[12px] text-[#94A3B8]"
                            data-cy="-bsc-bsc-setup-configid-page-p-44"
                          >
                            No KPIs linked under this perspective.
                          </p>
                        ) : (
                          <div
                            className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1"
                            data-cy="-bsc-bsc-setup-configid-page-div-45"
                          >
                            {perspectiveKpis.map((kpi) => (
                              <div
                                key={kpi.id}
                                className="rounded-[6px] border border-[#d9d9d9] bg-white px-3 py-3"
                                data-cy={`bsc-scorecard-detail-kpi-${kpi.id}`}
                              >
                                <div
                                  className="flex flex-wrap items-start justify-between gap-3"
                                  data-cy="-bsc-bsc-setup-configid-page-div-46"
                                >
                                  <div
                                    className="min-w-0 flex-1"
                                    data-cy="-bsc-bsc-setup-configid-page-div-47"
                                  >
                                    <p
                                      className="m-0 text-[13px] font-medium text-[#262626]"
                                      data-cy="-bsc-bsc-setup-configid-page-p-48"
                                    >
                                      {kpi.name}
                                    </p>
                                    <p
                                      className="m-0 mt-1 text-[11px] text-[#8F94A3]"
                                      data-cy="-bsc-bsc-setup-configid-page-p-49"
                                    >
                                      {kpi.measurementUnit} ·{' '}
                                      {targetLogicLabel(kpi.targetLogic)}
                                      {kpi.positionTitle
                                        ? ` · ${kpi.positionTitle}`
                                        : ''}
                                      {kpi.departmentName
                                        ? ` · ${kpi.departmentName}`
                                        : ''}
                                    </p>
                                    {kpi.description ? (
                                      <p
                                        className="m-0 mt-1 text-[12px] text-[#595959]"
                                        data-cy="-bsc-bsc-setup-configid-page-p-50"
                                      >
                                        {kpi.description}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div
                                    className="flex flex-wrap gap-2"
                                    data-cy="-bsc-bsc-setup-configid-page-div-51"
                                  >
                                    <MetaTag>Weight {kpi.weight}%</MetaTag>
                                    {kpi.defaultTarget != null ? (
                                      <MetaTag>
                                        Target {kpi.defaultTarget}
                                      </MetaTag>
                                    ) : null}
                                    {kpi.targetLogic === TargetLogic.Bounded &&
                                    (kpi.worstCase != null ||
                                      kpi.bestCase != null) ? (
                                      <MetaTag>
                                        {kpi.worstCase ?? '—'} →{' '}
                                        {kpi.bestCase ?? '—'}
                                      </MetaTag>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
      <BscSetupModal />
      <AssignIndividualKpisModal
        open={Boolean(individualTarget)}
        scorecard={individualTarget}
        evaluationConfigId={configId}
        onClose={() => setIndividualTarget(null)}
      />
    </div>
  );
}
