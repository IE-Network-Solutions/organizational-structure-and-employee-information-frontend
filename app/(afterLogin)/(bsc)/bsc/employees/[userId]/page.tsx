'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Progress, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AssignIndividualKpisModal from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-setup/_components/AssignIndividualKpisModal';
import KpiEvaluationFlowCompact from '@/app/(afterLogin)/(bsc)/bsc/_components/KpiEvaluationFlowCompact';
import {
  useGetBscCycles,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  EmployeeScorecard,
  EvaluationCycle,
  ScorecardKpiTarget,
  ScorecardStatus,
} from '@/types/bsc';
import { targetScorePercent } from '@/utils/bsc/rollup';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';
const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';

function formatScore(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.abs(value % 1) < 1e-9
    ? String(Math.round(value))
    : value.toFixed(1);
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

function currentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function currentYear(): number {
  return new Date().getFullYear();
}

function periodLabel(card: EmployeeScorecard): string {
  if (card.periodMonthName) {
    return card.periodYear
      ? `${card.periodMonthName} ${card.periodYear}`
      : card.periodMonthName;
  }
  return card.cycleLabel || 'Period';
}

function scorecardOptionLabel(
  card: EmployeeScorecard,
  cycleById: Map<string, EvaluationCycle>,
): string {
  const cadence = cycleById.get(card.cycleId)?.cadence;
  const period = periodLabel(card);
  const program = (card.cycleLabel || '').trim();
  const periodLower = period.toLowerCase();
  const programLower = program.toLowerCase();
  const cadenceLower = (cadence || '').toLowerCase();

  // Prefer a short period label; only add program when it adds new info.
  const programIsRedundant =
    !program ||
    programLower === periodLower ||
    programLower.includes(periodLower) ||
    periodLower.includes(programLower.replace(/\s*\([^)]*\)\s*/g, '').trim());

  const parts: string[] = [];
  if (!programIsRedundant) parts.push(program);
  parts.push(period);
  if (
    cadence &&
    !parts.some((part) => part.toLowerCase().includes(cadenceLower))
  ) {
    parts.push(cadence);
  }
  return parts.join(' · ');
}

function pickDefaultScorecard(
  list: EmployeeScorecard[],
  preferredId?: string,
): EmployeeScorecard | null {
  if (!list.length) return null;
  if (preferredId) {
    const preferred = list.find((card) => card.id === preferredId);
    if (preferred) return preferred;
  }
  const thisMonth = currentMonthName();
  const year = currentYear();
  const currentPeriod =
    list.find(
      (s) =>
        s.periodMonthName?.toLowerCase() === thisMonth.toLowerCase() &&
        (s.periodYear == null || s.periodYear === year),
    ) || null;
  if (currentPeriod) return currentPeriod;
  const active = list.find((s) => s.status === ScorecardStatus.Active);
  if (active) return active;
  return list.reduce((latest, card) =>
    (card.updatedAt || '') > (latest.updatedAt || '') ? card : latest,
  );
}

export default function EmployeeKpiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { setScorecardTab, setBscCatalogView } = useBscUiStore();
  const userId = decodeURIComponent(String(params?.userId || ''));
  const preferredScorecardId = searchParams.get('scorecard') || undefined;
  const fromIndividual = searchParams.get('from') === 'individual';
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    string | undefined
  >(preferredScorecardId);

  const { data: scorecards, isLoading } = useGetBscScorecards();
  const { data: cycles } = useGetBscCycles();
  const { data: allUsers } = useGetAllUsers();

  const cycleById = useMemo(() => {
    const map = new Map<string, EvaluationCycle>();
    for (const cycle of cycles || []) map.set(cycle.id, cycle);
    return map;
  }, [cycles]);

  const employeeById = useMemo(() => {
    const map = new Map<
      string,
      { label: string; initials?: string; profileImage?: string | null }
    >();
    for (const user of allUsers?.items || []) {
      const rawName =
        `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`
          .replace(/\s+/g, ' ')
          .trim();
      const label: string =
        rawName ||
        (typeof user.email === 'string' && user.email) ||
        'Employee';
      const initials = label
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');
      let profileImage: string | null = null;
      if (typeof user.profileImage === 'string') {
        try {
          const parsed = JSON.parse(user.profileImage);
          if (parsed?.url && typeof parsed.url === 'string') {
            profileImage = parsed.url;
          } else if (user.profileImage.startsWith('http')) {
            profileImage = user.profileImage;
          }
        } catch {
          if (user.profileImage.startsWith('http')) {
            profileImage = user.profileImage;
          }
        }
      }
      if (user.id) {
        map.set(user.id, {
          label,
          initials: initials || '?',
          profileImage,
        });
      }
    }
    return map;
  }, [allUsers]);

  const personScorecards = useMemo(() => {
    return [...(scorecards || [])]
      .filter((card) => card.userId === userId)
      .sort((a, b) => {
        const byCycle = (a.cycleLabel || '').localeCompare(b.cycleLabel || '');
        if (byCycle) return byCycle;
        const yearA = a.periodYear ?? 0;
        const yearB = b.periodYear ?? 0;
        if (yearA !== yearB) return yearB - yearA;
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [scorecards, userId]);

  useEffect(() => {
    if (!personScorecards.length) {
      setSelectedScorecardId(undefined);
      return;
    }
    const stillValid = personScorecards.some(
      (card) => card.id === selectedScorecardId,
    );
    if (stillValid) return;
    const fallback = pickDefaultScorecard(
      personScorecards,
      preferredScorecardId,
    );
    setSelectedScorecardId(fallback?.id);
  }, [personScorecards, preferredScorecardId, selectedScorecardId]);

  const scorecard = useMemo(() => {
    if (!personScorecards.length) return null;
    return (
      personScorecards.find((card) => card.id === selectedScorecardId) ||
      pickDefaultScorecard(personScorecards, preferredScorecardId)
    );
  }, [personScorecards, selectedScorecardId, preferredScorecardId]);

  const periodOptions = useMemo(
    () =>
      personScorecards.map((card) => ({
        value: card.id,
        label: scorecardOptionLabel(card, cycleById),
      })),
    [personScorecards, cycleById],
  );

  const averageScoreByKpiId = useMemo(() => {
    const scoresByKpi = new Map<string, number[]>();
    const cycleId = scorecard?.cycleId;
    for (const card of personScorecards) {
      if (cycleId && card.cycleId !== cycleId) continue;
      for (const target of card.targets) {
        const score = targetScorePercent(target);
        if (score == null) continue;
        const list = scoresByKpi.get(target.kpiLibraryId) || [];
        list.push(score);
        scoresByKpi.set(target.kpiLibraryId, list);
      }
    }
    const averages = new Map<string, number>();
    scoresByKpi.forEach((scores, kpiId) => {
      if (!scores.length) return;
      averages.set(
        kpiId,
        scores.reduce((sum, value) => sum + value, 0) / scores.length,
      );
    });
    return averages;
  }, [personScorecards, scorecard?.cycleId]);

  const selectPeriod = (scorecardId: string) => {
    setSelectedScorecardId(scorecardId);
    const next = new URLSearchParams(searchParams.toString());
    next.set('scorecard', scorecardId);
    router.replace(
      `/bsc/employees/${encodeURIComponent(userId)}?${next.toString()}`,
      { scroll: false },
    );
  };

  const back = () => {
    if (fromIndividual) {
      setBscCatalogView('people');
      setScorecardTab('bsc');
      router.push('/bsc/my-scorecard');
      return;
    }
    setScorecardTab('all');
    router.push('/bsc/my-scorecard');
  };

  const columns: ColumnsType<ScorecardKpiTarget> = [
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-employees-userid-page-span-1"
        >
          KPI
        </span>
      ),
      dataIndex: 'kpiName',
      key: 'kpiName',
      render: (name: string, row) => (
        <div
          className="flex flex-col gap-1"
          data-cy="-bsc-bsc-employees-userid-page-div-2"
        >
          <span
            className={tableCellClassName}
            data-cy="-bsc-bsc-employees-userid-page-span-3"
          >
            {name}
          </span>
          <div
            className="flex flex-wrap items-center gap-1.5"
            data-cy="-bsc-bsc-employees-userid-page-div-4"
          >
            {row.assignmentSource === 'individual' ? (
              <Tag className={blueTagClassName}>Individual</Tag>
            ) : null}
            <span
              className="text-xs text-gray-500"
              data-cy="-bsc-bsc-employees-userid-page-span-5"
            >
              {row.perspective}
            </span>
          </div>
          <div className="mt-1">
            <KpiEvaluationFlowCompact
              flow={row.evaluationFlow}
              employeeById={employeeById}
              dataCy={`bsc-employee-kpi-eval-${row.id}`}
            />
          </div>
        </div>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-employees-userid-page-span-8"
        >
          Weight
        </span>
      ),
      dataIndex: 'weightPercentage',
      key: 'weightPercentage',
      width: 90,
      render: (weight: number) => (
        <span
          className={tableCellClassName}
          data-cy="-bsc-bsc-employees-userid-page-span-9"
        >
          {weight}%
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-employees-userid-page-span-10"
        >
          Target
        </span>
      ),
      dataIndex: 'targetValue',
      key: 'targetValue',
      width: 100,
      render: (value: number, row) => (
        <span
          className={tableCellClassName}
          data-cy="-bsc-bsc-employees-userid-page-span-11"
        >
          {value == null
            ? '—'
            : `${value}${row.measurementUnit ? ` ${row.measurementUnit}` : ''}`}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-employees-userid-page-span-14"
        >
          Recent Score
        </span>
      ),
      key: 'recentScore',
      width: 120,
      render: (unused: unknown, row: ScorecardKpiTarget) => {
        const score = targetScorePercent(row);
        return (
          <span
            className={tableCellClassName}
            data-cy="-bsc-bsc-employees-userid-page-span-15"
          >
            {score != null ? `${formatScore(score)}%` : '—'}
          </span>
        );
      },
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-employee-col-average"
        >
          Average Score
        </span>
      ),
      key: 'averageScore',
      width: 220,
      render: (unused: unknown, row: ScorecardKpiTarget) => (
        <ScoreProgressBar
          value={averageScoreByKpiId.get(row.kpiLibraryId) ?? null}
          dataCy="bsc-employee-average-score"
        />
      ),
    },
  ];

  const selectedCadence = scorecard
    ? cycleById.get(scorecard.cycleId)?.cadence
    : undefined;

  return (
    <div className="w-full" data-cy="bsc-employee-kpi-detail-page">
      <CustomBreadcrumb
        title={scorecard?.userName || 'Employee KPI'}
        subtitle={
          scorecard
            ? [
                scorecard.positionTitle,
                scorecard.departmentName,
                periodLabel(scorecard),
                selectedCadence,
              ]
                .filter(Boolean)
                .join(' · ') || 'Scorecard detail'
            : 'Scorecard detail'
        }
      />

      <div className="mb-4" data-cy="-bsc-bsc-employees-userid-page-div-17">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={back}
          className="!px-0 text-[#595959]"
          data-cy="bsc-employee-kpi-detail-back"
        >
          {fromIndividual ? 'Individual KPIs' : 'All Employee KPI'}
        </Button>
      </div>

      {isLoading ? (
        <div
          className="py-16 text-center text-gray-400"
          data-cy="-bsc-bsc-employees-userid-page-div-18"
        >
          Loading…
        </div>
      ) : !scorecard ? (
        <div
          className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-12"
          data-cy="-bsc-bsc-employees-userid-page-div-19"
        >
          <Empty description="No scorecard found for this employee" />
        </div>
      ) : (
        <div
          className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
          data-cy="-bsc-bsc-employees-userid-page-div-20"
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F0F0F0]"
            data-cy="-bsc-bsc-employees-userid-page-div-21"
          >
            <div
              className="min-w-0 flex-1"
              data-cy="-bsc-bsc-employees-userid-page-div-22"
            >
              <h2
                className="m-0 text-lg font-semibold text-[#262626]"
                data-cy="-bsc-bsc-employees-userid-page-h2-23"
              >
                {scorecard.userName}
              </h2>
              <p
                className="m-0 mt-1 text-sm text-[#8F94A3]"
                data-cy="-bsc-bsc-employees-userid-page-p-24"
              >
                {[
                  scorecard.positionTitle,
                  scorecard.departmentName,
                  scorecard.cycleLabel,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
              data-cy="-bsc-bsc-employees-userid-page-div-25"
            >
              {periodOptions.length > 1 ? (
                <Select
                  size="small"
                  className="w-[200px]"
                  value={scorecard.id}
                  options={periodOptions}
                  onChange={selectPeriod}
                  showSearch
                  optionFilterProp="label"
                  data-cy="bsc-employee-period-select"
                />
              ) : (
                <Tag className={blueTagClassName}>
                  {[periodLabel(scorecard), selectedCadence]
                    .filter(Boolean)
                    .join(' · ')}
                </Tag>
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAssignOpen(true)}
                className="bg-[#2b54ad]"
                data-cy="bsc-employee-add-individual-kpis"
              >
                Add individual KPIs
              </Button>
            </div>
          </div>

          <div
            className="overflow-x-auto"
            data-cy="-bsc-bsc-employees-userid-page-div-26"
          >
            <Table
              className="w-full"
              columns={columns}
              dataSource={scorecard.targets}
              pagination={false}
              rowKey="id"
              rowHoverable={false}
              scroll={{ x: 960 }}
              locale={{ emptyText: 'No KPIs on this scorecard' }}
              data-cy="bsc-employee-kpi-detail-table"
            />
          </div>
        </div>
      )}

      <AssignIndividualKpisModal
        open={assignOpen}
        scorecard={scorecard}
        evaluationConfigId={scorecard?.cycleId}
        onClose={() => setAssignOpen(false)}
      />
    </div>
  );
}
