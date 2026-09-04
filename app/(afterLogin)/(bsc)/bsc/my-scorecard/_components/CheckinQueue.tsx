'use client';

import React, { useMemo, useState } from 'react';
import { Button, Empty, Input, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import { IoCheckmarkSharp } from 'react-icons/io5';
import CustomButton from '@/components/common/buttons/customButton';
import KpiEvaluationFlowCompact from '@/app/(afterLogin)/(bsc)/bsc/_components/KpiEvaluationFlowCompact';
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
import {
  buildCheckinQueue,
  type CheckinItem,
} from '@/utils/bsc/checkin';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

function SelfCheckinGroup({
  items,
}: {
  items: CheckinItem[];
}) {
  const scorecard = items[0].scorecard;
  const [drafts, setDrafts] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      items.map((i) => [i.target.id, i.target.actualValue ?? null]),
    ),
  );
  const { mutateAsync: reportAsync, isLoading: reporting } = useReportBscKpis();
  const { mutateAsync: submitAsync, isLoading: submitting } =
    useSubmitBscFinal();
  const saving = reporting || submitting;

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
    await reportAsync({
      scorecardId: scorecard.id,
      reports: items.map((item) => ({
        targetId: item.target.id,
        actualValue: drafts[item.target.id] as number,
        evidenceFileName: `${item.target.kpiName.replace(/\s+/g, '-')}.pdf`,
        evidenceUrl: `https://mock.evidence/${scorecard.id}/${item.target.id}`,
      })),
    });
    await submitAsync(scorecard.id);
    NotificationMessage.success({
      message: 'Check-in submitted',
      description: 'Sent to the next evaluator.',
    });
  };

  const columns: ColumnsType<CheckinItem> = [
    {
      title: <span className={tableHeaderClassName}>KPI</span>,
      key: 'kpi',
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <span className={tableCellClassName}>{row.target.kpiName}</span>
          <KpiEvaluationFlowCompact
            flow={row.flow}
            dataCy={`bsc-checkin-self-flow-${row.target.id}`}
          />
        </div>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Target</span>,
      key: 'target',
      width: 100,
      render: (_, row) => (
        <span className={tableCellClassName}>
          {row.target.targetValue}
          {row.target.measurementUnit
            ? ` ${row.target.measurementUnit}`
            : ''}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Actual</span>,
      key: 'actual',
      width: 130,
      render: (_, row) => {
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
      title: <span className={tableHeaderClassName}>Period</span>,
      key: 'period',
      width: 140,
      render: (_, row) => (
        <span className={tableCellClassName}>{row.periodLabel}</span>
      ),
    },
  ];

  return (
    <div
      className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white"
      data-cy={`bsc-checkin-self-group-${scorecard.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
        <div>
          <h3 className="mb-0 text-base font-semibold text-gray-900">
            My Evaluation
          </h3>
          <p className="mb-0 mt-1 text-sm text-gray-500">
            {items[0].contextLabel}
          </p>
        </div>
        <CustomButton
          title="Submit check-in"
          id={`bsc-checkin-self-submit-${scorecard.id}`}
          size="small"
          loading={saving}
          onClick={() => {
            void submit();
          }}
          className="!h-8 !rounded-md !bg-[#1E40AF] !px-3 !text-white hover:!bg-[#1E3A8A]"
        />
      </div>
      <Table
        rowKey="key"
        columns={columns}
        dataSource={items}
        pagination={false}
        scroll={{ x: 640 }}
        data-cy={`bsc-checkin-self-table-${scorecard.id}`}
      />
    </div>
  );
}

function ReviewCheckinGroup({
  ownerName,
  items,
}: {
  ownerName: string;
  items: CheckinItem[];
}) {
  const scorecard = items[0].scorecard;
  const [drafts, setDrafts] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      items.map((i) => [i.target.id, i.target.actualValue ?? null]),
    ),
  );
  const { mutate: adjust } = useAdjustBscReportedKpis();
  const { mutateAsync: setApprovalAsync, isLoading: approving } =
    useSetBscKpiApproval();
  const { mutateAsync: finalizeAsync, isLoading: finalizing } =
    useFinalizeBscApprovals();
  const busy = approving || finalizing;

  const saveEdits = (onDone?: () => void) => {
    const adjustments = items
      .filter((i) => {
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

  const decide = (targetId: string, approved: boolean) => {
    saveEdits(async () => {
      const latest = await setApprovalAsync({
        scorecardId: scorecard.id,
        targetId,
        approved,
        rejectionReason: approved ? undefined : 'Needs revision',
      });
      if (!approved) {
        NotificationMessage.success({
          message: 'Returned for resubmit',
        });
        return;
      }
      const stillPending = latest.targets.filter(
        (t) => t.approvalStatus === KpiApprovalStatus.Pending,
      );
      if (stillPending.length === 0) {
        await finalizeAsync(scorecard.id);
        NotificationMessage.success({
          message: 'Check-in closed',
          description: 'Final scores now reflect on the scorecard.',
        });
      } else {
        NotificationMessage.success({
          message: 'Passed to next evaluator',
        });
      }
    });
  };

  const decideAll = async (approved: boolean) => {
    saveEdits(async () => {
      let latest = scorecard;
      for (const item of items) {
        latest = await setApprovalAsync({
          scorecardId: scorecard.id,
          targetId: item.target.id,
          approved,
          rejectionReason: approved ? undefined : 'Needs revision',
        });
      }
      const stillPending = latest.targets.filter(
        (t) => t.approvalStatus === KpiApprovalStatus.Pending,
      );
      if (approved && stillPending.length === 0) {
        await finalizeAsync(scorecard.id);
        NotificationMessage.success({
          message: 'Check-in closed',
          description: 'Final scores now reflect on the scorecard.',
        });
      }
    });
  };

  const columns: ColumnsType<CheckinItem> = [
    {
      title: <span className={tableHeaderClassName}>KPI</span>,
      key: 'kpi',
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <span className={tableCellClassName}>{row.target.kpiName}</span>
          <KpiEvaluationFlowCompact
            flow={row.flow}
            dataCy={`bsc-checkin-review-flow-${row.target.id}`}
          />
        </div>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Reported</span>,
      key: 'reported',
      width: 110,
      render: (_, row) => (
        <span className={tableCellClassName}>
          {row.target.actualValue == null
            ? '—'
            : `${row.target.actualValue}${
                row.target.measurementUnit
                  ? ` ${row.target.measurementUnit}`
                  : ''
              }`}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Score</span>,
      key: 'score',
      width: 90,
      render: (_, row) => (
        <span className={tableCellClassName}>
          {row.score == null ? '—' : `${formatScore(row.score)}%`}
        </span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Adjust</span>,
      key: 'adjust',
      width: 120,
      render: (_, row) => {
        const value = drafts[row.target.id];
        return (
          <Input
            className="!w-[96px] h-8 text-sm"
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
            data-cy={`bsc-checkin-review-actual-${row.target.id}`}
          />
        );
      },
    },
    {
      title: <span className={tableHeaderClassName}>Action</span>,
      key: 'action',
      width: 160,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Approve / pass to next (or close if final)">
            <Button
              type="text"
              size="small"
              className="!text-green-600"
              icon={<IoCheckmarkSharp />}
              disabled={busy}
              onClick={() => decide(row.target.id, true)}
              data-cy={`bsc-checkin-approve-${row.target.id}`}
            />
          </Tooltip>
          <Tooltip title="Reject back to employee">
            <Button
              type="text"
              size="small"
              danger
              icon={<CloseOutlined />}
              disabled={busy}
              onClick={() => decide(row.target.id, false)}
              data-cy={`bsc-checkin-reject-${row.target.id}`}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div
      className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white"
      data-cy={`bsc-checkin-review-group-${scorecard.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
        <div>
          <h3 className="mb-0 text-base font-semibold text-gray-900">
            {ownerName}
          </h3>
          <p className="mb-0 mt-1 text-sm text-gray-500">
            {items[0].contextLabel} · prior check-in result shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            className="!text-green-700"
            icon={<IoCheckmarkSharp />}
            loading={busy}
            onClick={() => {
              void decideAll(true);
            }}
            data-cy={`bsc-checkin-approve-all-${scorecard.id}`}
          >
            Approve all
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            loading={busy}
            onClick={() => {
              void decideAll(false);
            }}
            data-cy={`bsc-checkin-reject-all-${scorecard.id}`}
          >
            Reject all
          </Button>
        </div>
      </div>
      <Table
        rowKey="key"
        columns={columns}
        dataSource={items}
        pagination={false}
        scroll={{ x: 720 }}
        data-cy={`bsc-checkin-review-table-${scorecard.id}`}
      />
    </div>
  );
}

function resolveCheckinActorId(userId?: string): string {
  return userId || 'demo-user';
}

export default function CheckinQueue() {
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
    // Demo fallback when signed-in user has no mock inbox yet.
    return buildCheckinQueue(scorecards, 'demo-user', cycleById);
  }, [scorecards, preferredActor, cycleById]);

  const selfItems = queue.filter((i) => i.role === 'self');
  const reviewItems = queue.filter((i) => i.role === 'evaluator');

  const groupByScorecard = (list: CheckinItem[]) => {
    const map = new Map<string, CheckinItem[]>();
    for (const item of list) {
      const key = item.scorecard.id;
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    }
    return Array.from(map.values());
  };

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

  return (
    <div data-cy="bsc-checkin-queue">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tag color="blue">My Evaluation · {selfItems.length}</Tag>
        <Tag color="purple">To review · {reviewItems.length}</Tag>
      </div>

      {/* My Evaluation always first */}
      <section data-cy="bsc-checkin-self-section" className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          My Evaluation
        </h2>
        {selfItems.length ? (
          groupByScorecard(selfItems).map((group) => (
            <SelfCheckinGroup key={group[0].scorecard.id} items={group} />
          ))
        ) : (
          <div
            className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400"
            data-cy="bsc-checkin-self-empty"
          >
            No self check-ins waiting
          </div>
        )}
      </section>

      {reviewItems.length ? (
        <section data-cy="bsc-checkin-review-section">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Assigned to me (prior result visible)
          </h2>
          {groupByScorecard(reviewItems).map((group) => (
            <ReviewCheckinGroup
              key={group[0].scorecard.id}
              ownerName={group[0].scorecard.userName}
              items={group}
            />
          ))}
        </section>
      ) : !selfItems.length ? (
        <div className="flex justify-center py-6" data-cy="bsc-checkin-empty">
          <Empty description="No check-ins waiting for you" />
        </div>
      ) : null}
    </div>
  );
}
