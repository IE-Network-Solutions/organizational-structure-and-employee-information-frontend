'use client';

import React, { useMemo } from 'react';
import { Button, Empty, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LeftOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useGetBscScorecards } from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardKpiTarget,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import { computeCompositeScore } from '@/utils/bsc/scoring';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

function targetLogicLabel(logic: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function approvalTag(status: KpiApprovalStatus) {
  if (status === KpiApprovalStatus.Approved) {
    return <Tag color="green">Approved</Tag>;
  }
  if (status === KpiApprovalStatus.Rejected) {
    return <Tag color="red">Rejected</Tag>;
  }
  return <Tag>Pending</Tag>;
}

function scorecardTotal(scorecard: EmployeeScorecard): number {
  const evaluated =
    scorecard.status === ScorecardStatus.Scored ||
    scorecard.status === ScorecardStatus.Completed ||
    scorecard.finalEvaluation?.compositeScore != null;
  if (!evaluated) return 0;
  const result = computeCompositeScore(scorecard.targets);
  let total = 0;
  for (const t of scorecard.targets) {
    const item = result.items.find((b) => b.targetId === t.id);
    const ratio = item ? Math.min(item.ratio, 1) : 0;
    total += ratio * t.weightPercentage;
  }
  return Math.min(total, 100);
}

function formatScore(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.abs(value % 1) < 1e-9
    ? String(Math.round(value))
    : value.toFixed(1);
}

function isScorecardApproved(scorecard: EmployeeScorecard): boolean {
  if (
    scorecard.status === ScorecardStatus.Scored ||
    scorecard.status === ScorecardStatus.Completed
  ) {
    return true;
  }
  return (
    scorecard.targets.length > 0 &&
    scorecard.targets.every(
      (t) => t.approvalStatus === KpiApprovalStatus.Approved,
    )
  );
}

export default function EmployeeKpiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);
  const userId = decodeURIComponent(String(params?.userId || ''));
  const preferredScorecardId = searchParams.get('scorecard') || undefined;

  const { data: scorecards, isLoading } = useGetBscScorecards();

  const scorecard = useMemo(() => {
    const list = (scorecards || []).filter((card) => card.userId === userId);
    if (!list.length) return null;
    if (preferredScorecardId) {
      const preferred = list.find((card) => card.id === preferredScorecardId);
      if (preferred) return preferred;
    }
    return list.reduce((latest, card) =>
      (card.updatedAt || '') > (latest.updatedAt || '') ? card : latest,
    );
  }, [scorecards, userId, preferredScorecardId]);

  const backToAll = () => {
    setScorecardTab('all');
    router.push('/bsc/my-scorecard');
  };

  const columns: ColumnsType<ScorecardKpiTarget> = [
    {
      title: <span className={tableHeaderClassName}>KPI</span>,
      dataIndex: 'kpiName',
      key: 'kpiName',
      render: (name: string, row) => (
        <div className="flex flex-col gap-1">
          <span className={tableCellClassName}>{name}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {row.assignmentSource === 'individual' ? (
              <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                Individual
              </Tag>
            ) : null}
            <span className="text-xs text-gray-500">{row.perspective}</span>
          </div>
        </div>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Direction</span>,
      dataIndex: 'targetLogic',
      key: 'targetLogic',
      width: 140,
      render: (logic: TargetLogic) => (
        <span className={tableCellClassName}>{targetLogicLabel(logic)}</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Weight</span>,
      dataIndex: 'weightPercentage',
      key: 'weightPercentage',
      width: 90,
      render: (weight: number) => (
        <span className={tableCellClassName}>{weight}%</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Target</span>,
      dataIndex: 'targetValue',
      key: 'targetValue',
      width: 100,
      render: (value: number) => (
        <span className={tableCellClassName}>
          {value == null ? '—' : String(value)}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Metric</span>,
      dataIndex: 'measurementUnit',
      key: 'measurementUnit',
      width: 120,
      render: (unit: string) => (
        <span className={tableCellClassName}>{unit?.trim() || '—'}</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Actual</span>,
      dataIndex: 'actualValue',
      key: 'actualValue',
      width: 100,
      render: (value: number | null) => (
        <span className={tableCellClassName}>
          {value == null ? '—' : String(value)}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Status</span>,
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 110,
      render: (status: KpiApprovalStatus) => approvalTag(status),
    },
  ];

  const score = scorecard ? scorecardTotal(scorecard) : 0;

  return (
    <div className="w-full" data-cy="bsc-employee-kpi-detail-page">
      <CustomBreadcrumb
        title={scorecard?.userName || 'Employee KPI'}
        subtitle={
          scorecard
            ? [
                scorecard.positionTitle,
                scorecard.departmentName,
                scorecard.cycleLabel,
              ]
                .filter(Boolean)
                .join(' · ') || 'Scorecard detail'
            : 'Scorecard detail'
        }
      />

      <div className="mb-4">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={backToAll}
          className="!px-0 text-[#595959]"
          data-cy="bsc-employee-kpi-detail-back"
        >
          All Employee KPI
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-400">Loading…</div>
      ) : !scorecard ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-12">
          <Empty description="No scorecard found for this employee" />
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-[#F0F0F0]">
            <div>
              <h2 className="m-0 text-lg font-semibold text-[#262626]">
                {scorecard.userName}
              </h2>
              <p className="m-0 mt-1 text-sm text-[#8F94A3]">
                {[
                  scorecard.positionTitle,
                  scorecard.departmentName,
                  scorecard.cycleLabel,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                {scorecard.targets.length} KPI
                {scorecard.targets.length === 1 ? '' : 's'}
              </Tag>
              <Tag className="m-0 h-5 rounded border border-[#d9d9d9] bg-[#fafafa] px-1.5 text-[11px] font-normal leading-5 text-[#595959]">
                Score {formatScore(score)}%
              </Tag>
              {isScorecardApproved(scorecard) ? (
                <Tag color="green">Approved</Tag>
              ) : (
                <Tag>Pending</Tag>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
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
    </div>
  );
}
