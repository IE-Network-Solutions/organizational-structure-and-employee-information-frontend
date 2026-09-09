'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Input, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import KpiEvaluationFlowCompact from '@/app/(afterLogin)/(bsc)/bsc/_components/KpiEvaluationFlowCompact';
import {
  TargetMetricUnitTag,
  TargetMetricValue,
} from '@/app/(afterLogin)/(bsc)/bsc/_components/TargetValueCell';
import {
  bscTableCellClassName as tableCellClassName,
  bscTableClassName as tableClassName,
  bscTableHeaderClassName as tableHeaderClassName,
  bscTableRowClassName,
} from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  useGetBscCycles,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import {
  useAdjustBscReportedKpis,
  useFinalizeBscApprovals,
  useReportBscKpis,
  useSetBscKpiApproval,
  useSubmitBscFinal,
} from '@/store/server/features/bsc/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EvaluationCycle, KpiApprovalStatus } from '@/types/bsc';
import { formatScore } from '@/utils/bsc/rollup';
import { buildCheckinQueue, dedupeSelfCheckinItems, type CheckinItem } from '@/utils/bsc/checkin';
import type { CheckinInbox } from './CheckinInboxToggle';

function evaluationDecisionCounts(
  groups: CheckinItem[][],
  decisions: Record<string, boolean>,
) {
  let left = 0;
  let accepted = 0;
  let rejected = 0;
  for (const group of groups) {
    for (const item of group) {
      const decided = decisions[item.target.id];
      if (decided === true) accepted += 1;
      else if (decided === false) rejected += 1;
      else left += 1;
    }
  }
  return { left, accepted, rejected };
}

function EvaluationCountPills({
  left,
  accepted,
  rejected,
}: {
  left: number;
  accepted: number;
  rejected: number;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2"
      data-cy="bsc-checkin-eval-counts"
    >
      <span
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm text-slate-600"
        data-cy="bsc-checkin-eval-left"
      >
        <span className="font-semibold tabular-nums text-slate-900">{left}</span>
        left
      </span>
      <span
        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm text-emerald-700"
        data-cy="bsc-checkin-eval-accepted"
      >
        <span className="font-semibold tabular-nums text-emerald-800">
          {accepted}
        </span>
        accepted
      </span>
      <span
        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-sm text-red-600"
        data-cy="bsc-checkin-eval-rejected"
      >
        <span className="font-semibold tabular-nums text-red-700">
          {rejected}
        </span>
        rejected
      </span>
    </div>
  );
}

function groupByScorecard(list: CheckinItem[]) {
  const map = new Map<string, CheckinItem[]>();
  for (const item of list) {
    const key = item.scorecard.id;
    const arr = map.get(key) || [];
    arr.push(item);
    map.set(key, arr);
  }
  return Array.from(map.values());
}

function SelfCheckinTable({ items }: { items: CheckinItem[] }) {
  const [drafts, setDrafts] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      items.map((i) => [i.target.id, i.target.actualValue ?? null]),
    ),
  );
  const { mutateAsync: reportAsync, isLoading: reporting } = useReportBscKpis();
  const { mutateAsync: submitAsync, isLoading: submitting } =
    useSubmitBscFinal();
  const saving = reporting || submitting;

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (!(item.target.id in next)) {
          next[item.target.id] = item.target.actualValue ?? null;
        }
      }
      return next;
    });
  }, [items]);

  const submit = async () => {
    for (const item of items) {
      const actual = drafts[item.target.id];
      if (actual == null || !Number.isFinite(actual)) {
        NotificationMessage.error({
          message: `Enter an actual for ${item.target.kpiName}`,
        });
        return;
      }
    }
    for (const group of groupByScorecard(items)) {
      const scorecard = group[0].scorecard;
      await reportAsync({
        scorecardId: scorecard.id,
        reports: group.map((item) => ({
          targetId: item.target.id,
          actualValue: drafts[item.target.id] as number,
          evidenceFileName: `${item.target.kpiName.replace(/\s+/g, '-')}.pdf`,
          evidenceUrl: `https://mock.evidence/${scorecard.id}/${item.target.id}`,
        })),
      });
      await submitAsync(scorecard.id);
    }
    NotificationMessage.success({
      message: 'Check-in submitted',
      description: 'Sent to the next evaluator.',
    });
  };

  const columns: ColumnsType<CheckinItem> = [
    {
      title: (
        <span data-cy="checkinqueue-span-72" className={tableHeaderClassName}>
          KPI
        </span>
      ),
      key: 'kpi',
      render: (unused, row) => (
        <div data-cy="checkinqueue-div-75" className="flex flex-col gap-1">
          <span data-cy="checkinqueue-span-76" className={tableCellClassName}>
            {row.target.kpiName}
          </span>
          <span className="text-xs text-gray-500 leading-snug">
            {row.contextLabel}
          </span>
          <KpiEvaluationFlowCompact
            flow={row.flow}
            dataCy={`bsc-checkin-self-flow-${row.target.id}`}
          />
        </div>
      ),
    },
    {
      title: (
        <span data-cy="checkinqueue-span-85" className={tableHeaderClassName}>
          Target
        </span>
      ),
      key: 'target',
      width: 90,
      render: (unused, row) => (
        <TargetMetricValue
          value={row.target.targetValue}
          unit={row.target.measurementUnit}
          worstCase={row.target.worstCase}
          bestCase={row.target.bestCase}
          dataCy={`bsc-checkin-self-target-${row.target.id}`}
        />
      ),
    },
    {
      title: (
        <span data-cy="checkinqueue-span-99" className={tableHeaderClassName}>
          Unit
        </span>
      ),
      key: 'unit',
      width: 100,
      render: (unused, row) => (
        <TargetMetricUnitTag
          value={row.target.targetValue}
          unit={row.target.measurementUnit}
          worstCase={row.target.worstCase}
          bestCase={row.target.bestCase}
          dataCy={`bsc-checkin-self-unit-${row.target.id}`}
        />
      ),
    },
    {
      title: (
        <span data-cy="checkinqueue-span-113" className={tableHeaderClassName}>
          Actual
        </span>
      ),
      key: 'actual',
      width: 130,
      render: (unused, row) => {
        const value = drafts[row.target.id];
        return (
          <Input
            className="!w-[110px] h-8 text-sm"
            placeholder={String(row.target.targetValue ?? 'Enter')}
            value={value == null ? '' : String(value)}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.-]/g, '');
              if (raw === '' || raw === '-') {
                setDrafts((prev) => ({ ...prev, [row.target.id]: null }));
                return;
              }
              const next = Number(raw);
              if (!Number.isFinite(next)) return;
              setDrafts((prev) => ({ ...prev, [row.target.id]: next }));
            }}
            data-cy={`bsc-checkin-self-actual-${row.target.id}`}
          />
        );
      },
    },
    {
      title: (
        <span data-cy="checkinqueue-span-139" className={tableHeaderClassName}>
          Period
        </span>
      ),
      key: 'period',
      width: 140,
      render: (unused, row) => (
        <span data-cy="checkinqueue-span-143" className={tableCellClassName}>
          {row.periodLabel}
        </span>
      ),
    },
  ];

  return (
    <div data-cy="bsc-checkin-self-table-wrap">
      <div
        data-cy="checkinqueue-div-153"
        className="mb-2 flex flex-wrap items-center justify-end gap-3"
      >
        <CustomButton
          title="Submit check-in"
          id="bsc-checkin-self-submit"
          size="small"
          loading={saving}
          onClick={() => {
            void submit();
          }}
          className="!h-8 !rounded-md !bg-[#1E40AF] !px-3 !text-white hover:!bg-[#1E3A8A]"
        />
      </div>
      <Table
        className={tableClassName}
        rowKey="key"
        columns={columns}
        dataSource={items}
        pagination={false}
        scroll={{ x: 720 }}
        rowClassName={(unused, index) => bscTableRowClassName(index)}
        data-cy="bsc-checkin-self-table"
      />
    </div>
  );
}

function ReviewCheckinGroup({
  ownerName,
  items,
  decisions,
  onDecision,
  counts,
}: {
  ownerName: string;
  items: CheckinItem[];
  decisions: Record<string, boolean>;
  onDecision: (targetId: string, approved: boolean) => void;
  counts: { left: number; accepted: number; rejected: number };
}) {
  const scorecard = items[0].scorecard;
  const [drafts, setDrafts] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      items.map((i) => [i.target.id, i.target.actualValue ?? null]),
    ),
  );
  const [actingId, setActingId] = useState<string | null>(null);
  const { mutate: adjust } = useAdjustBscReportedKpis();
  const { mutateAsync: setApprovalAsync } = useSetBscKpiApproval();
  const { mutateAsync: finalizeAsync } = useFinalizeBscApprovals();
  const busy = actingId != null;

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (!(item.target.id in next)) {
          next[item.target.id] = item.target.actualValue ?? null;
        }
      }
      return next;
    });
  }, [items]);

  const saveEdits = (onDone?: () => void) => {
    const adjustments = items
      .filter((i) => {
        if (decisions[i.target.id] != null) return false;
        const next = drafts[i.target.id];
        return next != null && next !== i.target.actualValue;
      })
      .map((i) => ({
        targetId: i.target.id,
        actualValue: drafts[i.target.id] as number,
      }));
    if (!adjustments.length) {
      onDone?.();
      return;
    }
    adjust({ scorecardId: scorecard.id, adjustments }, { onSuccess: onDone });
  };

  const decide = (targetId: string) => {
    saveEdits(async () => {
      setActingId(targetId);
      try {
        const latest = await setApprovalAsync({
          scorecardId: scorecard.id,
          targetId,
          approved: true,
        });
        onDecision(targetId, true);
        const stillPending = latest.targets.filter(
          (t) => t.approvalStatus === KpiApprovalStatus.Pending,
        );
        if (stillPending.length === 0) {
          await finalizeAsync(scorecard.id);
          NotificationMessage.success({
            message: 'Check-in closed',
            description: 'Final scores now reflect on the scorecard.',
          });
        }
      } finally {
        setActingId(null);
      }
    });
  };

  const columns: ColumnsType<CheckinItem> = [
    {
      title: (
        <span data-cy="checkinqueue-span-248" className={tableHeaderClassName}>
          KPI
        </span>
      ),
      key: 'kpi',
      render: (unused, row) => (
        <div data-cy="checkinqueue-div-251" className="flex flex-col gap-1">
          <span data-cy="checkinqueue-span-252" className={tableCellClassName}>
            {row.target.kpiName}
          </span>
          <KpiEvaluationFlowCompact
            flow={row.flow}
            dataCy={`bsc-checkin-review-flow-${row.target.id}`}
          />
        </div>
      ),
    },
    {
      title: (
        <span data-cy="checkinqueue-span-261" className={tableHeaderClassName}>
          Reported
        </span>
      ),
      key: 'reported',
      width: 90,
      render: (unused, row) => (
        <TargetMetricValue
          value={row.target.actualValue}
          unit={row.target.measurementUnit}
          worstCase={row.target.worstCase}
          bestCase={row.target.bestCase}
          dataCy={`bsc-checkin-review-reported-${row.target.id}`}
        />
      ),
    },
    {
      title: (
        <span data-cy="checkinqueue-span-275" className={tableHeaderClassName}>
          Unit
        </span>
      ),
      key: 'unit',
      width: 100,
      render: (unused, row) => (
        <TargetMetricUnitTag
          value={row.target.actualValue}
          unit={row.target.measurementUnit}
          worstCase={row.target.worstCase}
          bestCase={row.target.bestCase}
          dataCy={`bsc-checkin-review-unit-${row.target.id}`}
        />
      ),
    },
    {
      title: (
        <span data-cy="checkinqueue-span-289" className={tableHeaderClassName}>
          Score
        </span>
      ),
      key: 'score',
      width: 90,
      render: (unused, row) => (
        <span data-cy="checkinqueue-span-293" className={tableCellClassName}>
          {row.score == null ? '—' : `${formatScore(row.score)}%`}
        </span>
      ),
    },
    {
      title: (
        <span data-cy="checkinqueue-span-299" className={tableHeaderClassName}>
          Adjust
        </span>
      ),
      key: 'adjust',
      width: 120,
      render: (unused, row) => {
        const decided = decisions[row.target.id];
        const value = drafts[row.target.id];
        if (decided != null) {
          return (
            <TargetMetricValue
              value={drafts[row.target.id] ?? row.target.actualValue}
              unit={row.target.measurementUnit}
              worstCase={row.target.worstCase}
              bestCase={row.target.bestCase}
              dataCy={`bsc-checkin-review-actual-${row.target.id}`}
            />
          );
        }
        return (
          <Input
            className="!w-[96px] h-8 text-sm"
            value={value == null ? '' : String(value)}
            disabled={busy}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.-]/g, '');
              if (raw === '' || raw === '-') {
                setDrafts((prev) => ({ ...prev, [row.target.id]: null }));
                return;
              }
              const next = Number(raw);
              if (!Number.isFinite(next)) return;
              setDrafts((prev) => ({ ...prev, [row.target.id]: next }));
            }}
            data-cy={`bsc-checkin-review-actual-${row.target.id}`}
          />
        );
      },
    },
    {
      title: (
        <span data-cy="checkinqueue-span-324" className={tableHeaderClassName}>
          Action
        </span>
      ),
      key: 'action',
      width: 120,
      className: 'whitespace-nowrap',
      render: (unused, row) => {
        const decided = decisions[row.target.id];
        if (decided === true) {
          return <Tag color="green">Approved</Tag>;
        }
        const rowBusy = actingId === row.target.id;
        return (
          <CustomButton
            title="Approve"
            id={`bsc-checkin-approve-${row.target.id}`}
            size="small"
            disabled={busy}
            loading={rowBusy}
            onClick={() => decide(row.target.id)}
            className="!h-8 !shrink-0 !rounded-md !bg-[#1E40AF] !px-3 !text-white hover:!bg-[#1E3A8A]"
            textClassName="text-sm font-medium"
          />
        );
      },
    },
  ];

  return (
    <div data-cy={`bsc-checkin-review-group-${scorecard.id}`}>
      <div
        data-cy="checkinqueue-div-346"
        className="mb-2 flex flex-wrap items-center justify-between gap-3"
      >
        <div data-cy="checkinqueue-div-347">
          <h3
            data-cy="checkinqueue-h3-348"
            className="mb-0 text-base font-semibold text-gray-900"
          >
            {ownerName}
          </h3>
          <p
            data-cy="checkinqueue-p-351"
            className="mb-0 mt-1 text-sm text-gray-500"
          >
            {items[0].contextLabel}
          </p>
        </div>
        <EvaluationCountPills
          left={counts.left}
          accepted={counts.accepted}
          rejected={counts.rejected}
        />
      </div>
      <Table
        className={tableClassName}
        rowKey="key"
        columns={columns}
        dataSource={items}
        pagination={false}
        scroll={{ x: 1020 }}
        rowClassName={(unused, index) => bscTableRowClassName(index)}
        data-cy={`bsc-checkin-review-table-${scorecard.id}`}
      />
    </div>
  );
}

function AssignedCheckinQueue({ groups }: { groups: CheckinItem[][] }) {
  const ANIM_MS = 340;
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, CheckinItem[]>>(
    {},
  );
  const [decisions, setDecisions] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [anim, setAnim] = useState<'in' | 'out' | 'from'>('in');
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const animatingRef = useRef(false);
  const advancedFromRef = useRef<Set<string>>(new Set());
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    setOrderIds((prev) => {
      const next = [...prev];
      for (const group of groups) {
        const id = group[0].scorecard.id;
        if (!next.includes(id)) next.push(id);
      }
      return next;
    });
    setSnapshots((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        const id = group[0].scorecard.id;
        if (!next[id]) next[id] = group;
      }
      return next;
    });
  }, [groups]);

  const displayGroups = useMemo(
    () =>
      orderIds
        .map((id) => snapshots[id])
        .filter((group): group is CheckinItem[] => Boolean(group?.length)),
    [orderIds, snapshots],
  );

  const pendingIds = useMemo(
    () => new Set(groups.map((group) => group[0].scorecard.id)),
    [groups],
  );

  const goToPage = useCallback((nextPage: number, dir: 'next' | 'prev') => {
    if (animatingRef.current) return;
    if (nextPage === pageRef.current) return;
    animatingRef.current = true;
    setAnimDir(dir);
    setAnim('out');
    window.setTimeout(() => {
      setPage(nextPage);
      setAnim('from');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnim('in');
          window.setTimeout(() => {
            animatingRef.current = false;
          }, ANIM_MS);
        });
      });
    }, ANIM_MS);
  }, []);

  useEffect(() => {
    if (!displayGroups.length) {
      setPage(1);
      return;
    }
    if (page > displayGroups.length) setPage(displayGroups.length);
  }, [displayGroups.length, page]);

  const current = displayGroups[page - 1];
  const counts = useMemo(
    () => evaluationDecisionCounts(displayGroups, decisions),
    [displayGroups, decisions],
  );

  useEffect(() => {
    if (!current?.length || animatingRef.current) return;
    const id = current[0].scorecard.id;
    if (advancedFromRef.current.has(id)) return;
    const allDecided = current.every(
      (item) => decisions[item.target.id] != null,
    );
    if (!allDecided) return;

    advancedFromRef.current.add(id);
    const n = orderIds.length;
    let nextPage: number | null = null;
    for (let step = 1; step < n; step += 1) {
      const idx = (page - 1 + step) % n;
      if (pendingIds.has(orderIds[idx])) {
        nextPage = idx + 1;
        break;
      }
    }
    if (nextPage != null) goToPage(nextPage, 'next');
  }, [current, decisions, goToPage, orderIds, page, pendingIds]);

  if (!displayGroups.length || !current?.length) {
    return (
      <div
        className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400"
        data-cy="bsc-checkin-review-empty"
      >
        No assigned evaluations waiting
      </div>
    );
  }

  const slideOut =
    animDir === 'next' ? '-translate-x-8' : 'translate-x-8';
  const slideFrom =
    animDir === 'next' ? 'translate-x-8' : '-translate-x-8';
  const slideClass =
    anim === 'in'
      ? 'opacity-100 translate-x-0 scale-100'
      : anim === 'out'
        ? `opacity-0 ${slideOut} scale-[0.98]`
        : `opacity-0 ${slideFrom} scale-[0.98]`;

  return (
    <div data-cy="bsc-checkin-review-section">
      <div
        className={[
          'origin-top motion-reduce:transform-none motion-reduce:transition-none',
          anim === 'from'
            ? 'transition-none'
            : 'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          slideClass,
        ].join(' ')}
        data-cy="bsc-checkin-assigned-stage"
      >
        <ReviewCheckinGroup
          key={current[0].scorecard.id}
          ownerName={current[0].scorecard.userName}
          items={current}
          decisions={decisions}
          counts={counts}
          onDecision={(targetId, approved) =>
            setDecisions((prev) => ({ ...prev, [targetId]: approved }))
          }
        />
      </div>
      {displayGroups.length > 1 ? (
        <div
          className="mt-3 flex items-center justify-end gap-2"
          data-cy="bsc-checkin-assigned-pagination"
        >
          <button
            type="button"
            aria-label="Previous approval"
            disabled={page <= 1 || anim !== 'in'}
            onClick={() => goToPage(page - 1, 'prev')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            data-cy="bsc-checkin-assigned-prev"
          >
            <LeftOutlined />
          </button>
          <span className="min-w-[4.5rem] text-center text-sm text-gray-600">
            {page} of {displayGroups.length}
          </span>
          <button
            type="button"
            aria-label="Next approval"
            disabled={page >= displayGroups.length || anim !== 'in'}
            onClick={() => goToPage(page + 1, 'next')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            data-cy="bsc-checkin-assigned-next"
          >
            <RightOutlined />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function resolveCheckinActorId(userId?: string): string {
  return userId || 'demo-user';
}

export default function CheckinQueue({ inbox }: { inbox: CheckinInbox }) {
  const { userId } = useAuthenticationStore();
  const preferredActor = resolveCheckinActorId(userId);
  const { data: scorecards, isLoading } = useGetBscScorecards();
  const { data: cycles } = useGetBscCycles();

  const cycleById = useMemo(() => {
    const map = new Map<string, EvaluationCycle>();
    for (const cycle of cycles || []) map.set(cycle.id, cycle);
    return map;
  }, [cycles]);

  const queue = useMemo(() => {
    const primary = buildCheckinQueue(scorecards, preferredActor, cycleById);
    if (primary.length || preferredActor === 'demo-user') return primary;
    return buildCheckinQueue(scorecards, 'demo-user', cycleById);
  }, [scorecards, preferredActor, cycleById]);

  const selfItems = dedupeSelfCheckinItems(
    queue.filter((i) => i.role === 'self'),
  );
  const reviewGroups = groupByScorecard(
    queue.filter((i) => i.role === 'evaluator'),
  );

  if (isLoading) {
    return (
      <div
        className="py-16 text-center text-gray-400"
        data-cy="bsc-checkin-loading"
      >
        Loading…
      </div>
    );
  }

  if (inbox === 'assigned') {
    return (
      <div data-cy="bsc-checkin-queue">
        <AssignedCheckinQueue groups={reviewGroups} />
      </div>
    );
  }

  return (
    <div data-cy="bsc-checkin-queue">
      {selfItems.length ? (
        <SelfCheckinTable items={selfItems} />
      ) : (
        <div
          className="flex justify-center py-6"
          data-cy="bsc-checkin-self-empty"
        >
          <Empty description="No self check-ins waiting" />
        </div>
      )}
    </div>
  );
}
