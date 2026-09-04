'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LeftOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BscScoreDonut from '@/app/(afterLogin)/(bsc)/bsc/_components/BscScoreDonut';
import BscScoreMetricCard from '@/app/(afterLogin)/(bsc)/bsc/_components/BscScoreMetricCard';
import BscKpiCadenceLineChart from '@/app/(afterLogin)/(bsc)/bsc/_components/BscKpiCadenceLineChart';
import BscKpiActualVsTargetChart from '@/app/(afterLogin)/(bsc)/bsc/_components/BscKpiActualVsTargetChart';
import ScoreProgressBar from '@/app/(afterLogin)/(bsc)/bsc/_components/ScoreProgressBar';
import BscStatusTag from '@/app/(afterLogin)/(bsc)/bsc/_components/BscStatusTag';
import KpiEvaluationFlowCompact from '@/app/(afterLogin)/(bsc)/bsc/_components/KpiEvaluationFlowCompact';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  EmployeeScorecard,
  EvaluationCycle,
  ScorecardKpiTarget,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import { formatScore, targetScorePercent } from '@/utils/bsc/rollup';
import {
  filterScorecardsInSeries,
  periodLabel,
  periodSortKey,
  scorecardContextLabel,
  scorecardProgramName,
  scorecardSeriesKey,
} from '@/utils/bsc/series';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';
const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';

type PeriodRow = {
  key: string;
  scorecardId: string;
  periodLabel: string;
  cadence?: string;
  programName: string;
  status: ScorecardStatus;
  target: ScorecardKpiTarget | null;
  score: number | null;
  assigned: boolean;
  sortKey: number;
};

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function shortPeriodLabel(label: string): string {
  const parts = label.split(/\s+/);
  if (parts.length >= 2) return parts[0].slice(0, 3);
  return label.slice(0, 8);
}

export default function MyScorecardKpiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { userId } = useAuthenticationStore();
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);

  const kpiId = decodeURIComponent(String(params?.kpiId || ''));
  const scorecardIdParam = searchParams.get('scorecard') || '';

  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards();
  const { data: kpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: cycles } = useGetBscCycles();
  const { data: allUsers } = useGetAllUsers();

  const [seriesAnchorId, setSeriesAnchorId] = useState<string | undefined>();
  const [periodFilter, setPeriodFilter] = useState<string | undefined>();

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
      const label =
        `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`
          .replace(/\s+/g, ' ')
          .trim() ||
        user.email ||
        'Employee';
      const initials = label
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0])
        .join('')
        .toUpperCase();
      map.set(user.id, {
        label,
        initials,
        profileImage: user.profileImage || null,
      });
    }
    return map;
  }, [allUsers]);

  const catalogKpi = useMemo(
    () => (kpis || []).find((k) => k.id === kpiId) || null,
    [kpis, kpiId],
  );

  const mine = useMemo(() => {
    const list = scorecards || [];
    if (userId) {
      const matched = list.filter((s) => s.userId === userId);
      if (matched.length) return matched;
    }
    return list.filter((s) => s.userId === 'demo-user');
  }, [scorecards, userId]);

  /** Scorecards that include this KPI (any series). */
  const cardsWithKpi = useMemo(
    () =>
      mine.filter((card) =>
        card.targets.some((t) => t.kpiLibraryId === kpiId),
      ),
    [mine, kpiId],
  );

  const seriesOptions = useMemo(() => {
    const byKey = new Map<string, EmployeeScorecard>();
    const sorted = [...cardsWithKpi].sort(
      (a, b) => periodSortKey(b) - periodSortKey(a),
    );
    for (const card of sorted) {
      const key = scorecardSeriesKey(card, cycleById.get(card.cycleId));
      if (!byKey.has(key)) byKey.set(key, card);
    }
    return Array.from(byKey.entries()).map(([value, card]) => ({
      value,
      scorecardId: card.id,
      label: [
        scorecardProgramName(card, cycleById.get(card.cycleId)),
        cycleById.get(card.cycleId)?.cadence,
        card.positionTitle,
      ]
        .filter(Boolean)
        .join(' · '),
    }));
  }, [cardsWithKpi, cycleById]);

  const entryScorecard = useMemo(() => {
    if (scorecardIdParam) {
      const fromParam = mine.find((s) => s.id === scorecardIdParam);
      if (fromParam) return fromParam;
    }
    return (
      cardsWithKpi.find((s) => s.status === ScorecardStatus.Active) ||
      cardsWithKpi[0] ||
      null
    );
  }, [mine, scorecardIdParam, cardsWithKpi]);

  useEffect(() => {
    if (!entryScorecard) {
      setSeriesAnchorId(undefined);
      return;
    }
    const key = scorecardSeriesKey(
      entryScorecard,
      cycleById.get(entryScorecard.cycleId),
    );
    setSeriesAnchorId(key);
  }, [entryScorecard?.id, cycleById]);

  const seriesAnchor = useMemo(() => {
    if (seriesAnchorId) {
      const opt = seriesOptions.find((o) => o.value === seriesAnchorId);
      if (opt) {
        return (
          mine.find((c) => c.id === opt.scorecardId) || entryScorecard
        );
      }
    }
    return entryScorecard;
  }, [seriesAnchorId, seriesOptions, mine, entryScorecard]);

  const seriesCards = useMemo(() => {
    if (!seriesAnchor) return [];
    return filterScorecardsInSeries(mine, seriesAnchor, cycleById);
  }, [mine, seriesAnchor, cycleById]);

  const isIndividualKpi = useMemo(() => {
    return cardsWithKpi.some((card) =>
      card.targets.some(
        (t) =>
          t.kpiLibraryId === kpiId && t.assignmentSource === 'individual',
      ),
    );
  }, [cardsWithKpi, kpiId]);

  const periodRows = useMemo((): PeriodRow[] => {
    const rows: PeriodRow[] = [];
    for (const card of seriesCards) {
      const cycle = cycleById.get(card.cycleId);
      const target =
        card.targets.find((t) => t.kpiLibraryId === kpiId) || null;
      if (!target && !isIndividualKpi) continue;
      rows.push({
        key: `${card.id}-${target?.id || 'unassigned'}`,
        scorecardId: card.id,
        periodLabel: periodLabel(card),
        cadence: cycle?.cadence,
        programName: scorecardProgramName(card, cycle),
        status: card.status,
        target,
        score: target ? targetScorePercent(target) : null,
        assigned: !!target,
        sortKey: periodSortKey(card),
      });
    }
    return rows.sort((a, b) => a.sortKey - b.sortKey);
  }, [seriesCards, kpiId, cycleById, isIndividualKpi]);

  const currentRow = useMemo(() => {
    if (!periodRows.length) return null;
    if (entryScorecard) {
      const match = periodRows.find(
        (r) => r.scorecardId === entryScorecard.id && r.assigned,
      );
      if (match) return match;
    }
    const assigned = [...periodRows].reverse().find((r) => r.assigned);
    return assigned || periodRows[periodRows.length - 1];
  }, [periodRows, entryScorecard]);

  const currentScore = currentRow?.assigned ? currentRow.score : null;
  const averageScore = useMemo(() => {
    const scored = periodRows
      .filter((r) => r.assigned && r.score != null)
      .map((r) => r.score as number);
    if (!scored.length) return null;
    return scored.reduce((sum, v) => sum + v, 0) / scored.length;
  }, [periodRows]);

  const displayCurrent = currentScore ?? averageScore ?? 0;
  const displayAverage = averageScore ?? currentScore ?? 0;

  const seriesCadence = seriesAnchor
    ? cycleById.get(seriesAnchor.cycleId)?.cadence
    : undefined;
  const seriesProgram = seriesAnchor
    ? scorecardProgramName(seriesAnchor, cycleById.get(seriesAnchor.cycleId))
    : '';

  const donutSegments = useMemo(() => {
    const scored = periodRows.filter((r) => r.assigned && r.score != null);
    if (scored.length >= 2) {
      return scored.map((r) => ({
        label: shortPeriodLabel(r.periodLabel),
        value: r.score as number,
      }));
    }
    const achieved = displayAverage;
    return [
      { label: 'Achieved', value: achieved, color: '#1c3ca5' },
      {
        label: 'Remaining',
        value: Math.max(0, 100 - achieved),
        color: '#e5e7eb',
      },
    ];
  }, [periodRows, displayAverage]);

  const linePoints = useMemo(
    () =>
      periodRows.map((r) => ({
        label: shortPeriodLabel(r.periodLabel),
        score: r.assigned ? r.score : null,
      })),
    [periodRows],
  );

  const barPoints = useMemo(
    () =>
      periodRows.map((r) => ({
        label: shortPeriodLabel(r.periodLabel),
        actual: r.assigned ? (r.target?.actualValue ?? null) : null,
        target: r.assigned ? (r.target?.targetValue ?? null) : null,
      })),
    [periodRows],
  );

  const unit =
    currentRow?.target?.measurementUnit ||
    catalogKpi?.measurementUnit ||
    undefined;

  const kpiName =
    currentRow?.target?.kpiName || catalogKpi?.name || 'KPI detail';
  const perspective =
    currentRow?.target?.perspective || catalogKpi?.perspective || '';
  const weight =
    currentRow?.target?.weightPercentage ?? catalogKpi?.weight ?? null;
  const logic =
    currentRow?.target?.targetLogic ||
    catalogKpi?.targetLogic ||
    TargetLogic.HigherBetter;

  const periodFilterOptions = useMemo(
    () =>
      periodRows.map((row) => ({
        value: row.scorecardId,
        label: [row.periodLabel, row.cadence].filter(Boolean).join(' · '),
      })),
    [periodRows],
  );

  const filteredPeriodRows = useMemo(() => {
    if (!periodFilter) return periodRows;
    return periodRows.filter((row) => row.scorecardId === periodFilter);
  }, [periodRows, periodFilter]);

  const selectSeries = (key: string) => {
    setSeriesAnchorId(key);
    setPeriodFilter(undefined);
    const opt = seriesOptions.find((o) => o.value === key);
    if (!opt) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('scorecard', opt.scorecardId);
    router.replace(
      `/bsc/my-scorecard/kpis/${encodeURIComponent(kpiId)}?${next.toString()}`,
      { scroll: false },
    );
  };

  const columns: ColumnsType<PeriodRow> = [
    {
      title: <span className={tableHeaderClassName}>Period</span>,
      key: 'period',
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <span className={tableCellClassName}>{row.periodLabel}</span>
          <span className="text-xs text-gray-500">
            {[row.cadence, row.programName].filter(Boolean).join(' · ')}
          </span>
        </div>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Actual</span>,
      key: 'actual',
      width: 110,
      render: (_, row) => (
        <span className={tableCellClassName}>
          {!row.assigned
            ? '—'
            : row.target?.actualValue == null
              ? '—'
              : `${row.target.actualValue}${unit ? ` ${unit}` : ''}`}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Target</span>,
      key: 'target',
      width: 110,
      render: (_, row) => (
        <span className={tableCellClassName}>
          {!row.assigned
            ? '—'
            : row.target?.targetValue == null
              ? '—'
              : `${row.target.targetValue}${unit ? ` ${unit}` : ''}`}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Score</span>,
      key: 'score',
      width: 200,
      render: (_, row) =>
        !row.assigned ? (
          <span className="text-sm text-gray-400" data-cy={`bsc-my-kpi-unassigned-${row.key}`}>
            Not assigned
          </span>
        ) : (
          <ScoreProgressBar
            value={row.score}
            dataCy={`bsc-my-kpi-period-score-${row.key}`}
          />
        ),
    },
    {
      title: <span className={tableHeaderClassName}>Status</span>,
      key: 'status',
      width: 120,
      render: (_, row) =>
        !row.assigned ? (
          <Tag className="m-0">Not assigned</Tag>
        ) : (
          <BscStatusTag status={row.status} />
        ),
    },
  ];

  const loading = scorecardsLoading || kpisLoading;

  const back = () => {
    setScorecardTab('mine');
    router.push('/bsc/my-scorecard');
  };

  return (
    <div className="w-full" data-cy="bsc-my-scorecard-kpi-detail-page">
      <CustomBreadcrumb
        title={kpiName}
        subtitle={[
          perspective,
          weight != null ? `${weight}% weight` : null,
          seriesCadence,
        ]
          .filter(Boolean)
          .join(' · ')}
      />

      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
        data-cy="bsc-my-scorecard-kpi-detail-back-wrap"
      >
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={back}
          className="!px-0 text-[#595959]"
          data-cy="bsc-my-scorecard-kpi-detail-back"
        >
          My Scorecard
        </Button>
        {seriesOptions.length > 1 ? (
          <Select
            className="w-full min-w-[220px] sm:w-[320px]"
            value={seriesAnchorId}
            options={seriesOptions.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            onChange={selectSeries}
            placeholder="Scorecard series"
            data-cy="bsc-my-scorecard-kpi-detail-series-select"
          />
        ) : seriesAnchor ? (
          <Tag className={blueTagClassName} data-cy="bsc-my-scorecard-kpi-series-tag">
            {scorecardContextLabel(
              seriesAnchor,
              cycleById.get(seriesAnchor.cycleId),
            )}
          </Tag>
        ) : null}
      </div>

      {loading ? (
        <div
          className="py-16 text-center text-gray-400"
          data-cy="bsc-my-scorecard-kpi-detail-loading"
        >
          Loading…
        </div>
      ) : !periodRows.length ? (
        <div className="flex justify-center py-10">
          <Empty description="No scorecard history for this KPI in this series" />
        </div>
      ) : (
        <div
          className="flex flex-col gap-6"
          data-cy="bsc-my-scorecard-kpi-detail-body"
        >
          <div
            className="flex flex-col gap-4 lg:flex-row lg:items-stretch"
            data-cy="bsc-my-scorecard-kpi-detail-hero"
          >
            <div
              className="flex h-auto min-h-[190px] flex-col self-stretch rounded-lg border border-gray-200 bg-white p-4 sm:p-6 lg:min-w-[320px] lg:max-w-md lg:flex-none"
              data-cy="bsc-my-scorecard-kpi-detail-donut-card"
            >
              <div
                className="flex flex-1 flex-col items-center gap-3 sm:flex-row sm:items-start"
                data-cy="bsc-my-scorecard-kpi-detail-donut-block"
              >
                <BscScoreDonut
                  centerValue={displayAverage}
                  segments={donutSegments}
                  dataCy="bsc-my-scorecard-kpi-detail-donut"
                />
                <div className="min-w-0 flex-1 sm:pt-2">
                  <h2 className="mb-1 text-lg font-semibold text-gray-900">
                    {kpiName}
                  </h2>
                  <p className="mb-2 text-sm text-gray-500">
                    {[
                      perspective,
                      targetLogicLabel(logic),
                      unit ? `Unit: ${unit}` : null,
                      seriesCadence,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {isIndividualKpi ||
                    currentRow?.target?.assignmentSource === 'individual' ? (
                      <Tag className={blueTagClassName}>Individual</Tag>
                    ) : (
                      <Tag className="m-0 h-5 rounded border border-gray-200 bg-white px-1.5 text-[11px] font-normal leading-5 text-gray-600">
                        Shared
                      </Tag>
                    )}
                    {seriesCadence ? (
                      <Tag className="m-0 h-5 rounded border border-gray-200 bg-white px-1.5 text-[11px] font-normal leading-5 text-gray-600">
                        {seriesCadence}
                      </Tag>
                    ) : null}
                  </div>
                  {currentRow?.target?.evaluationFlow ? (
                    <KpiEvaluationFlowCompact
                      flow={currentRow.target.evaluationFlow}
                      employeeById={employeeById}
                      dataCy="bsc-my-scorecard-kpi-detail-eval-flow"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <div
              className="grid min-w-0 flex-1 grid-cols-1 gap-3 self-stretch sm:grid-cols-2 lg:h-auto lg:min-h-full"
              data-cy="bsc-my-scorecard-kpi-detail-metrics"
            >
              <BscScoreMetricCard
                label="Current score"
                percent={displayCurrent}
                dataCy="bsc-my-scorecard-kpi-metric-current"
              />
              <BscScoreMetricCard
                label="Average score"
                percent={displayAverage}
                dataCy="bsc-my-scorecard-kpi-metric-average"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div
              className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5"
              data-cy="bsc-my-scorecard-kpi-detail-line-card"
            >
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                Score over {seriesCadence || 'periods'}
              </h3>
              <p className="mb-3 text-xs text-gray-400">
                {seriesProgram || 'Current scorecard series'}
              </p>
              <BscKpiCadenceLineChart
                points={linePoints}
                dataCy="bsc-my-scorecard-kpi-detail-line"
              />
            </div>
            <div
              className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5"
              data-cy="bsc-my-scorecard-kpi-detail-bar-card"
            >
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                Actual vs target
              </h3>
              <p className="mb-3 text-xs text-gray-400">
                Same cadence series only
              </p>
              <BscKpiActualVsTargetChart
                points={barPoints}
                unit={unit}
                dataCy="bsc-my-scorecard-kpi-detail-bar"
              />
            </div>
          </div>

          <div
            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            data-cy="bsc-my-scorecard-kpi-detail-table-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
              <h3 className="mb-0 text-base font-semibold text-gray-900">
                Reporting periods
              </h3>
              <Select
                allowClear
                placeholder="All periods"
                className="w-full min-w-[180px] sm:w-[240px]"
                value={periodFilter}
                options={periodFilterOptions}
                onChange={(value) => setPeriodFilter(value)}
                showSearch
                optionFilterProp="label"
                data-cy="bsc-my-scorecard-kpi-detail-period-filter"
              />
            </div>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={filteredPeriodRows}
              pagination={false}
              scroll={{ x: 640 }}
              locale={{
                emptyText: periodFilter
                  ? 'No rows for this period'
                  : 'No reporting periods',
              }}
              data-cy="bsc-my-scorecard-kpi-detail-table"
            />
          </div>
        </div>
      )}
    </div>
  );
}
