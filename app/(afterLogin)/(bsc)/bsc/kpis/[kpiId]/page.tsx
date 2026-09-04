'use client';

import React, { useMemo, useState } from 'react';
import { Button, Empty, Popover, Progress, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined, LeftOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import { bscFilterButtonClassName } from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useGetBscCycle,
  useGetBscKpiLibrary,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { TargetLogic } from '@/types/bsc';
import {
  departmentRollupsForKpi,
  formatScore,
  kpiContributors,
  latestScorecardsByEmployee,
  targetScorePercent,
  type KpiContributor,
  type RollupSummary,
} from '@/utils/bsc/rollup';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

type ContributionView = 'department' | 'employee';

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

type ContributorRow = KpiContributor & {
  averageScore: number | null;
  recentScore: number | null;
};

type DepartmentRow = Omit<RollupSummary, 'averageScore'> & {
  recentScore: number | null;
  averageScore: number | null;
};

function averageOf(scores: Array<number | null>): number | null {
  const values = scores.filter((s): s is number => s != null);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function BscKpiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isMobile } = useIsMobile();
  const kpiId = decodeURIComponent(String(params?.kpiId || ''));
  const perspectiveId = searchParams.get('perspective') || '';
  const scorecardConfigId = searchParams.get('scorecard') || '';
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);

  const [view, setView] = useState<ContributionView>('department');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string | undefined>();
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: kpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: scorecardConfig } = useGetBscCycle(scorecardConfigId);
  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards(
      scorecardConfigId ? { cycleId: scorecardConfigId } : undefined,
    );

  const kpi = useMemo(
    () => (kpis || []).find((item) => item.id === kpiId) || null,
    [kpis, kpiId],
  );

  const latest = useMemo(
    () => latestScorecardsByEmployee(scorecards),
    [scorecards],
  );

  const averageScoreByUserId = useMemo(() => {
    const scoresByUser = new Map<string, number[]>();
    for (const card of scorecards || []) {
      for (const target of card.targets) {
        if (target.kpiLibraryId !== kpiId) continue;
        const score = targetScorePercent(target);
        if (score == null) continue;
        const list = scoresByUser.get(card.userId) || [];
        list.push(score);
        scoresByUser.set(card.userId, list);
      }
    }
    const averages = new Map<string, number>();
    scoresByUser.forEach((scores, userId) => {
      if (!scores.length) return;
      averages.set(
        userId,
        scores.reduce((sum, value) => sum + value, 0) / scores.length,
      );
    });
    return averages;
  }, [scorecards, kpiId]);

  const contributors = useMemo((): ContributorRow[] => {
    return kpiContributors(latest, kpiId).map((row) => ({
      ...row,
      recentScore: row.score,
      averageScore: averageScoreByUserId.get(row.scorecard.userId) ?? null,
    }));
  }, [latest, kpiId, averageScoreByUserId]);

  const departmentRows = useMemo((): DepartmentRow[] => {
    return departmentRollupsForKpi(latest, kpiId).map((rollup) => {
      const people = contributors.filter(
        (row) => row.scorecard.departmentName === rollup.departmentName,
      );
      return {
        ...rollup,
        recentScore: averageOf(people.map((p) => p.recentScore)),
        averageScore: averageOf(people.map((p) => p.averageScore)),
      };
    });
  }, [latest, kpiId, contributors]);

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    contributors.forEach((row) => {
      if (row.scorecard.departmentName) set.add(row.scorecard.departmentName);
    });
    return Array.from(set).sort();
  }, [contributors]);

  const employeeOptions = useMemo(() => {
    const byId = new Map<string, string>();
    contributors.forEach((row) => {
      byId.set(row.scorecard.userId, row.scorecard.userName);
    });
    return Array.from(byId.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [contributors]);

  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return departmentRows.filter((row) => {
      if (department && row.departmentName !== department) return false;
      if (!q) return true;
      return (row.label || '').toLowerCase().includes(q);
    });
  }, [departmentRows, search, department]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contributors
      .filter((row) => {
        if (department && row.scorecard.departmentName !== department) {
          return false;
        }
        if (employeeId && row.scorecard.userId !== employeeId) {
          return false;
        }
        if (!q) return true;
        return (
          row.scorecard.userName.toLowerCase().includes(q) ||
          (row.scorecard.positionTitle || '').toLowerCase().includes(q) ||
          (row.scorecard.departmentName || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.scorecard.userName.localeCompare(b.scorecard.userName));
  }, [contributors, search, department, employeeId]);

  const loading = kpisLoading || scorecardsLoading;

  const back = () => {
    if (scorecardConfigId) {
      router.push(`/bsc/setup/${encodeURIComponent(scorecardConfigId)}`);
      return;
    }
    if (perspectiveId) {
      router.push(`/bsc/perspectives/${encodeURIComponent(perspectiveId)}`);
      return;
    }
    setScorecardTab('kpis');
    router.push('/bsc/my-scorecard');
  };

  const openEmployee = (row: ContributorRow) => {
    router.push(
      `/bsc/employees/${encodeURIComponent(row.scorecard.userId)}?scorecard=${encodeURIComponent(row.scorecard.id)}`,
    );
  };

  const handleResetFilters = () => {
    setEmployeeId(undefined);
    setDepartment(undefined);
  };

  const handleViewChange = (next: ContributionView) => {
    setView(next);
    setSearch('');
    setEmployeeId(undefined);
    if (next === 'department') setDepartment(undefined);
  };

  const departmentColumns: ColumnsType<DepartmentRow> = [
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-kpi-col-department">
          Department
        </span>
      ),
      key: 'department',
      render: (unused: unknown, row) => (
        <div className="flex flex-col gap-0.5" data-cy="bsc-kpi-dept-cell">
          <span className={tableCellClassName} data-cy="bsc-kpi-dept-name">
            {row.label}
          </span>
          <span className="text-xs text-gray-500" data-cy="bsc-kpi-dept-meta">
            {row.totalCount} contributor{row.totalCount === 1 ? '' : 's'}
            {row.evaluatedCount
              ? ` · ${row.evaluatedCount} reported`
              : ' · none reported'}
          </span>
        </div>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-kpi-col-recent">
          Recent Score
        </span>
      ),
      key: 'recentScore',
      width: 120,
      render: (unused: unknown, row) => (
        <span className={tableCellClassName} data-cy="bsc-kpi-dept-recent">
          {row.recentScore != null ? `${formatScore(row.recentScore)}%` : '—'}
        </span>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-kpi-col-average">
          Average Score
        </span>
      ),
      key: 'averageScore',
      width: 220,
      render: (unused: unknown, row) => (
        <ScoreProgressBar
          value={row.averageScore}
          dataCy="bsc-kpi-dept-average-score"
        />
      ),
    },
  ];

  const employeeColumns: ColumnsType<ContributorRow> = [
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-kpi-col-employee">
          Employee
        </span>
      ),
      key: 'employee',
      render: (unused: unknown, row) => (
        <div className="flex flex-col gap-0.5" data-cy="bsc-kpi-employee-cell">
          <span className={tableCellClassName} data-cy="bsc-kpi-employee-name">
            {row.scorecard.userName}
          </span>
          <span
            className="text-xs text-gray-500"
            data-cy="bsc-kpi-employee-meta"
          >
            {[row.scorecard.positionTitle, row.scorecard.departmentName]
              .filter(Boolean)
              .join(' · ') || '—'}
          </span>
        </div>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-kpi-col-target">
          Target
        </span>
      ),
      key: 'target',
      width: 120,
      render: (unused: unknown, row) => (
        <span className={tableCellClassName} data-cy="bsc-kpi-target">
          {row.target.targetValue}
          {row.target.measurementUnit
            ? ` ${row.target.measurementUnit}`
            : ''}
        </span>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-kpi-col-recent">
          Recent Score
        </span>
      ),
      key: 'recentScore',
      width: 120,
      render: (unused: unknown, row) => (
        <span className={tableCellClassName} data-cy="bsc-kpi-recent-score">
          {row.recentScore != null ? `${formatScore(row.recentScore)}%` : '—'}
        </span>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-kpi-col-average">
          Average Score
        </span>
      ),
      key: 'averageScore',
      width: 220,
      render: (unused: unknown, row) => (
        <ScoreProgressBar
          value={row.averageScore}
          dataCy="bsc-kpi-average-score"
        />
      ),
    },
  ];

  const filterPopover = (
    <div className="w-[460px] max-w-[460px]" data-cy="bsc-kpi-filter-popover">
      <div className="flex flex-col gap-4" data-cy="bsc-kpi-filter-body">
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          data-cy="bsc-kpi-filter-grid"
        >
          <div className="flex flex-col gap-2" data-cy="bsc-kpi-filter-dept">
            <label className="text-sm font-medium text-gray-700">
              Department
            </label>
            <Select
              allowClear
              showSearch
              placeholder="Select department"
              className="w-full h-10 rounded-lg"
              value={department}
              onChange={setDepartment}
              options={departmentOptions.map((name) => ({
                value: name,
                label: name,
              }))}
              data-cy="bsc-kpi-filter-dept-select"
            />
          </div>
          {view === 'employee' ? (
            <div
              className="flex flex-col gap-2"
              data-cy="bsc-kpi-filter-employee"
            >
              <label className="text-sm font-medium text-gray-700">
                Employee
              </label>
              <Select
                allowClear
                showSearch
                placeholder="Select employee"
                className="w-full h-10 rounded-lg"
                value={employeeId}
                onChange={setEmployeeId}
                options={employeeOptions}
                optionFilterProp="label"
                data-cy="bsc-kpi-filter-employee-select"
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
        <Button
          onClick={handleResetFilters}
          className="h-8 px-4 rounded-lg text-xs text-gray-700 border-gray-300"
          data-cy="bsc-kpi-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => setFilterOpen(false)}
          className="h-8 px-4 rounded-lg text-xs bg-okr-primary border-okr-primary"
          data-cy="bsc-kpi-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  const hasRows =
    view === 'department'
      ? filteredDepartments.length > 0
      : filteredEmployees.length > 0;

  return (
    <div className="w-full" data-cy="bsc-kpi-detail-page">
      <CustomBreadcrumb
        title={kpi?.name || 'KPI'}
        subtitle={
          kpi
            ? [
                kpi.perspective,
                targetLogicLabel(kpi.targetLogic),
                kpi.measurementUnit || '—',
                scorecardConfigId
                  ? scorecardConfig?.label || 'This scorecard'
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')
            : 'Contributions for this KPI'
        }
      />

      <div className="mb-4" data-cy="bsc-kpi-detail-back-wrap">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={back}
          className="!px-0 text-[#595959]"
          data-cy="bsc-kpi-detail-back"
        >
          {scorecardConfigId
            ? 'Scorecard'
            : perspectiveId
              ? 'Perspective'
              : 'KPIs'}
        </Button>
      </div>

      {loading ? (
        <div
          className="py-16 text-center text-gray-400"
          data-cy="bsc-kpi-detail-loading"
        >
          Loading…
        </div>
      ) : !kpi ? (
        <div className="py-12" data-cy="bsc-kpi-detail-missing">
          <Empty description="KPI not found" />
        </div>
      ) : (
        <div className="flex flex-col gap-4" data-cy="bsc-kpi-detail-body">
          <div
            className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
            data-cy="bsc-kpi-contributors-card"
          >
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-2"
              data-cy="bsc-kpi-contributors-header"
            >
              <h2
                className="m-0 text-lg font-semibold text-[#262626]"
                data-cy="bsc-kpi-contributors-title"
              >
                Contributions
              </h2>
              {contributors.length ? (
                <div
                  className="flex flex-wrap items-center justify-end gap-2"
                  data-cy="bsc-kpi-contributors-toolbar"
                >
                  <Select
                    value={view}
                    onChange={(value) =>
                      handleViewChange(value as ContributionView)
                    }
                    className="w-44 h-10 sm:h-8"
                    options={[
                      { value: 'department', label: 'Departments' },
                      { value: 'employee', label: 'Employees' },
                    ]}
                    data-cy="bsc-kpi-contribution-view"
                  />
                  <BscSearchInput
                    placeholder={
                      view === 'department'
                        ? 'Search department'
                        : 'Search employee'
                    }
                    value={search}
                    onChange={setSearch}
                    data-cy="bsc-kpi-contributors-search"
                  />
                  <Popover
                    content={filterPopover}
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
                      data-cy="bsc-kpi-contributors-filter"
                    >
                      {!isMobile && 'Filter'}
                    </Button>
                  </Popover>
                </div>
              ) : null}
            </div>

            {!contributors.length ? (
              <div className="px-4 py-12" data-cy="bsc-kpi-contributors-empty">
                <Empty description="No employees have this KPI assigned yet" />
              </div>
            ) : !hasRows ? (
              <div
                className="px-4 py-12 text-center text-gray-400"
                data-cy="bsc-kpi-contributors-search-empty"
              >
                No contributions match your search or filters
              </div>
            ) : view === 'department' ? (
              <div
                className="overflow-x-auto mt-2"
                data-cy="bsc-kpi-department-table-wrap"
              >
                <Table
                  className="w-full"
                  columns={departmentColumns}
                  dataSource={filteredDepartments}
                  pagination={false}
                  rowKey={(row) => row.departmentName || row.label}
                  rowHoverable={false}
                  scroll={{ x: 700 }}
                  rowClassName={(unused, index) =>
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                  }
                  data-cy="bsc-kpi-department-table"
                />
              </div>
            ) : (
              <div
                className="overflow-x-auto mt-2"
                data-cy="bsc-kpi-contributors-table-wrap"
              >
                <Table
                  className="w-full cursor-pointer"
                  columns={employeeColumns}
                  dataSource={filteredEmployees}
                  pagination={false}
                  rowKey={(row) => row.target.id}
                  rowHoverable={false}
                  scroll={{ x: 900 }}
                  onRow={(row) => ({
                    onClick: () => openEmployee(row),
                  })}
                  rowClassName={(unused, index) =>
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                  }
                  data-cy="bsc-kpi-contributors-table"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
