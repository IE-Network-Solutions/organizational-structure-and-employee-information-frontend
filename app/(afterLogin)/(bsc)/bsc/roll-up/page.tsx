'use client';

import React, { useMemo } from 'react';
import { Button, Empty, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LeftOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useGetBscScorecards } from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { EmployeeScorecard } from '@/types/bsc';
import {
  formatScore,
  isScorecardApproved,
  isScorecardEvaluated,
  latestScorecardsByEmployee,
  scorecardTotal,
} from '@/utils/bsc/rollup';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

type ContributorRow = EmployeeScorecard & {
  kpiScore: number;
  evaluated: boolean;
};

export default function BscRollupDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);
  const scope =
    searchParams.get('scope') === 'department' ? 'department' : 'company';
  const departmentName = searchParams.get('department') || undefined;

  const { data: scorecards, isLoading } = useGetBscScorecards();

  const contributors = useMemo(() => {
    const latest = latestScorecardsByEmployee(scorecards);
    const pool =
      scope === 'department' && departmentName
        ? latest.filter((c) => c.departmentName === departmentName)
        : latest;
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
  }, [scorecards, scope, departmentName]);

  const averageScore = useMemo(() => {
    const evaluated = contributors.filter((c) => c.evaluated);
    if (!evaluated.length) return 0;
    return evaluated.reduce((sum, c) => sum + c.kpiScore, 0) / evaluated.length;
  }, [contributors]);

  const title =
    scope === 'department' && departmentName
      ? `${departmentName} roll-up`
      : 'Company-wide roll-up';

  const backToAll = () => {
    setScorecardTab('all');
    router.push('/bsc/my-scorecard');
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
      dataIndex: 'cycleLabel',
      key: 'cycleLabel',
      render: (label: string) => (
        <span className={tableCellClassName} data-cy="bsc-rollup-period-cell">
          {label || '—'}
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

  const evaluatedCount = contributors.filter((c) => c.evaluated).length;

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
          onClick={backToAll}
          className="!px-0 text-[#595959]"
          data-cy="bsc-rollup-detail-back"
        >
          All Employee KPI
        </Button>
      </div>

      {isLoading ? (
        <div
          className="py-16 text-center text-gray-400"
          data-cy="bsc-rollup-loading"
        >
          Loading…
        </div>
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
                Avg {formatScore(averageScore)}%
              </Tag>
              <Tag
                className="m-0 h-5 rounded border border-[#d9d9d9] bg-[#fafafa] px-1.5 text-[11px] font-normal leading-5 text-[#595959]"
                data-cy="bsc-rollup-count-tag"
              >
                {evaluatedCount}/{contributors.length} evaluated
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
