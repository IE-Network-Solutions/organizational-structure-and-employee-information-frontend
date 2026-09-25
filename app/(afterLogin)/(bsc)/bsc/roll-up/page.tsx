'use client';

import React, { useMemo } from 'react';
import { Button, Empty, Progress, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useGetBscResultsScorecards } from '@/store/server/features/bsc/queries';
import {
  useGetAllUsers,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { EmployeeScorecard } from '@/types/bsc';
import {
  RollupSummary,
  computeRollup,
  departmentRollups,
  formatScore,
  isScorecardApproved,
  isScorecardEvaluated,
  latestScorecardsByEmployee,
  scorecardTotal,
} from '@/utils/bsc/rollup';
import {
  buildOrgEmployees,
  enrichScorecardPeople,
  namesById,
} from '@/utils/bsc/orgUsers';
import { periodLabel } from '@/utils/bsc/series';
import {
  bscRollupCompanyDetailHref,
  bscRollupDepartmentDetailHref,
  bscRollupHubHref,
  parseResultsScope,
  parseRollupView,
  scorecardResultsHref,
} from '@/utils/bsc/scorecardTab';
import type { ResultsScope } from '@/utils/bsc/scorecardTab';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';
const UNASSIGNED_DEPARTMENT = 'No department';

type ContributorRow = EmployeeScorecard & {
  kpiScore: number;
  evaluated: boolean;
};

function RollupCard({
  summary,
  onOpen,
  highlight = false,
  dataCy,
}: {
  summary: RollupSummary;
  onOpen: () => void;
  highlight?: boolean;
  dataCy: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full cursor-pointer flex-col gap-3 rounded-xl border p-5 text-left transition-shadow hover:shadow-sm ${
        highlight
          ? 'border-[#91caff] bg-[#F0F7FF]'
          : 'border-[#E5E7EB] bg-white'
      }`}
      data-cy={dataCy}
    >
      <div
        className="flex items-start justify-between gap-2"
        data-cy={`${dataCy}-header`}
      >
        <span
          className="text-[15px] font-semibold text-[#262626]"
          data-cy={`${dataCy}-label`}
        >
          {summary.label}
        </span>
        <RightOutlined
          className="mt-1 text-xs text-[#8c8c8c]"
          data-cy={`${dataCy}-open-icon`}
        />
      </div>
      <div className="flex items-end gap-2" data-cy={`${dataCy}-score-row`}>
        <span
          className="text-3xl font-bold leading-none text-[#1E40AF]"
          data-cy={`${dataCy}-avg`}
        >
          {summary.evaluatedCount ? `${formatScore(summary.averageScore)}%` : '—'}
        </span>
        <span
          className="pb-0.5 text-xs text-[#8F94A3]"
          data-cy={`${dataCy}-avg-caption`}
        >
          avg performance
        </span>
      </div>
      <Progress
        percent={Math.max(0, Math.min(100, summary.averageScore))}
        showInfo={false}
        size="small"
        strokeColor="#1E40AF"
        data-cy={`${dataCy}-progress`}
      />
      <div
        className="flex flex-wrap gap-2 text-xs text-[#595959]"
        data-cy={`${dataCy}-tags`}
      >
        <Tag className="m-0" data-cy={`${dataCy}-evaluated`}>
          {summary.evaluatedCount}/{summary.totalCount} evaluated
        </Tag>
        {summary.pendingCount > 0 ? (
          <Tag className="m-0" color="orange" data-cy={`${dataCy}-pending`}>
            {summary.pendingCount} pending
          </Tag>
        ) : null}
      </div>
    </button>
  );
}

export default function BscRollupDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);

  // Hub links carry ?resultsScope=; default the roll-up to company-wide data.
  const resultsScope: ResultsScope = searchParams.get('resultsScope')
    ? parseResultsScope(searchParams)
    : 'all';
  // Legacy links used ?scope=company|department.
  const legacyScope = searchParams.get('scope');
  const parsedView = parseRollupView(searchParams);
  const view =
    parsedView === 'hub' && legacyScope === 'company' ? 'company' : parsedView;
  const departmentName = searchParams.get('department') || undefined;

  const { data: scorecards, isLoading } =
    useGetBscResultsScorecards(resultsScope);
  const { data: allUsersData } = useGetAllUsersData();
  const { data: allUsers } = useGetAllUsers();
  const { data: departmentsData } = useGetDepartments();
  const { data: positionsData } = useGetAllPositions();

  // BE scorecards only carry ids — resolve people/department names so the
  // company and department roll-ups can group and label contributors.
  const latestCards = useMemo(() => {
    const employeeById = new Map(
      buildOrgEmployees(allUsersData, allUsers).map((e) => [e.id, e]),
    );
    const lookups = {
      employeeById,
      departmentNameById: namesById(departmentsData),
      positionNameById: namesById(positionsData),
    };
    const enriched = (scorecards || []).map((card) => {
      const withNames = enrichScorecardPeople(card, lookups);
      return {
        ...withNames,
        departmentName: withNames.departmentName || UNASSIGNED_DEPARTMENT,
      };
    });
    return latestScorecardsByEmployee(enriched);
  }, [scorecards, allUsersData, allUsers, departmentsData, positionsData]);

  const companySummary = useMemo(
    () => computeRollup(latestCards, { scope: 'company' }),
    [latestCards],
  );
  const departmentSummaries = useMemo(
    () => departmentRollups(latestCards),
    [latestCards],
  );

  const contributors = useMemo<ContributorRow[]>(() => {
    const pool =
      view === 'department' && departmentName
        ? latestCards.filter((c) => c.departmentName === departmentName)
        : latestCards;
    return pool
      .map((card) => ({
        ...card,
        kpiScore: scorecardTotal(card),
        evaluated: isScorecardEvaluated(card),
      }))
      .sort((a, b) => {
        if (a.evaluated !== b.evaluated) return a.evaluated ? -1 : 1;
        return b.kpiScore - a.kpiScore;
      });
  }, [latestCards, view, departmentName]);

  const detailSummary = useMemo(
    () =>
      view === 'department' && departmentName
        ? computeRollup(latestCards, {
            scope: 'department',
            departmentName,
          })
        : companySummary,
    [view, departmentName, latestCards, companySummary],
  );

  const title =
    view === 'department' && departmentName
      ? `${departmentName} roll-up`
      : view === 'company'
        ? 'Company-wide roll-up'
        : 'Scorecard roll-up';

  const back = () => {
    if (view !== 'hub') {
      router.push(bscRollupHubHref(resultsScope));
      return;
    }
    setScorecardTab('results');
    router.push(scorecardResultsHref(resultsScope));
  };

  const openEmployee = (row: ContributorRow) => {
    router.push(
      `/bsc/employees/${encodeURIComponent(row.userId)}?scorecard=${encodeURIComponent(row.id)}`,
    );
  };

  const columns: ColumnsType<ContributorRow> = [
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-rollup-col-employee"
        >
          Employee
        </span>
      ),
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string, row) => (
        <div
          className="flex flex-col gap-0.5"
          data-cy="bsc-rollup-employee-cell"
        >
          <span
            className={tableCellClassName}
            data-cy="bsc-rollup-employee-name"
          >
            {name}
          </span>
          <span
            className="text-xs text-gray-500"
            data-cy="bsc-rollup-employee-meta"
          >
            {[row.positionTitle, row.departmentName]
              .filter(Boolean)
              .join(' · ') || '—'}
          </span>
        </div>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-rollup-col-period">
          Period
        </span>
      ),
      key: 'period',
      render: (unused: unknown, row) => (
        <span className={tableCellClassName} data-cy="bsc-rollup-period-cell">
          {periodLabel(row) || '—'}
        </span>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-rollup-col-kpis">
          KPIs
        </span>
      ),
      key: 'kpiCount',
      width: 90,
      render: (unused: unknown, row) => (
        <span className={tableCellClassName} data-cy="bsc-rollup-kpi-count">
          {row.targets.length}
        </span>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-rollup-col-score">
          Score
        </span>
      ),
      dataIndex: 'kpiScore',
      key: 'kpiScore',
      width: 110,
      render: (score: number, row) => (
        <span className={tableCellClassName} data-cy="bsc-rollup-score-cell">
          {row.evaluated ? `${formatScore(score)}%` : '—'}
        </span>
      ),
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-rollup-col-status">
          Status
        </span>
      ),
      key: 'status',
      width: 120,
      render: (unused: unknown, row) =>
        isScorecardApproved(row) ? (
          <Tag color="green" data-cy="bsc-rollup-status-approved">
            Approved
          </Tag>
        ) : row.evaluated ? (
          <Tag color="blue" data-cy="bsc-rollup-status-scored">
            Scored
          </Tag>
        ) : (
          <Tag data-cy="bsc-rollup-status-pending">Pending</Tag>
        ),
    },
  ];

  return (
    <div className="w-full" data-cy="bsc-rollup-detail-page">
      <CustomBreadcrumb
        title={title}
        subtitle="Average of evaluated employee scorecards in this scope"
      />

      <div className="mb-4" data-cy="bsc-rollup-back-wrap">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={back}
          className="!px-0 text-[#595959]"
          data-cy="bsc-rollup-detail-back"
        >
          {view === 'hub' ? 'All Employee KPI' : 'Scorecard roll-up'}
        </Button>
      </div>

      {isLoading ? (
        <div
          className="py-16 text-center text-gray-400"
          data-cy="bsc-rollup-loading"
        >
          Loading…
        </div>
      ) : view === 'hub' ? (
        !latestCards.length ? (
          <div
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-12"
            data-cy="bsc-rollup-empty"
          >
            <Empty description="No employee scorecards in this scope yet" />
          </div>
        ) : (
          <div className="flex flex-col gap-6" data-cy="bsc-rollup-hub">
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              data-cy="bsc-rollup-company-grid"
            >
              <RollupCard
                summary={companySummary}
                highlight
                onOpen={() =>
                  router.push(bscRollupCompanyDetailHref(resultsScope))
                }
                dataCy="bsc-rollup-company-card"
              />
            </div>
            <div data-cy="bsc-rollup-departments">
              <h3
                className="mb-3 text-base font-semibold text-[#262626]"
                data-cy="bsc-rollup-departments-title"
              >
                Departments
              </h3>
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                data-cy="bsc-rollup-department-grid"
              >
                {departmentSummaries.map((summary) => (
                  <RollupCard
                    key={summary.label}
                    summary={summary}
                    onOpen={() =>
                      router.push(
                        bscRollupDepartmentDetailHref(
                          summary.departmentName || summary.label,
                          resultsScope,
                        ),
                      )
                    }
                    dataCy={`bsc-rollup-department-card-${summary.label}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        <div
          className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
          data-cy="bsc-rollup-card"
        >
          <div
            className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-[#F0F0F0]"
            data-cy="bsc-rollup-card-header"
          >
            <div data-cy="bsc-rollup-card-title-block">
              <h2
                className="m-0 text-lg font-semibold text-[#262626]"
                data-cy="bsc-rollup-card-title"
              >
                {title}
              </h2>
              <p
                className="m-0 mt-1 text-sm text-[#8F94A3]"
                data-cy="bsc-rollup-card-subtitle"
              >
                Click a person to open their KPI score detail.
              </p>
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
              data-cy="bsc-rollup-summary-tags"
            >
              <Tag
                className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]"
                data-cy="bsc-rollup-avg-tag"
              >
                Avg {formatScore(detailSummary.averageScore)}%
              </Tag>
              <Tag
                className="m-0 h-5 rounded border border-[#d9d9d9] bg-[#fafafa] px-1.5 text-[11px] font-normal leading-5 text-[#595959]"
                data-cy="bsc-rollup-count-tag"
              >
                {detailSummary.evaluatedCount}/{detailSummary.totalCount}{' '}
                evaluated
              </Tag>
            </div>
          </div>

          {!contributors.length ? (
            <div className="px-4 py-12" data-cy="bsc-rollup-empty">
              <Empty description="No contributing employees in this scope" />
            </div>
          ) : (
            <div className="overflow-x-auto" data-cy="bsc-rollup-table-wrap">
              <Table
                className="w-full cursor-pointer"
                columns={columns}
                dataSource={contributors}
                pagination={false}
                rowKey="id"
                rowHoverable={false}
                scroll={{ x: 800 }}
                onRow={(row) => ({
                  onClick: () => openEmployee(row),
                })}
                rowClassName={(unused, index) =>
                  index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                }
                data-cy="bsc-rollup-contributors-table"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
