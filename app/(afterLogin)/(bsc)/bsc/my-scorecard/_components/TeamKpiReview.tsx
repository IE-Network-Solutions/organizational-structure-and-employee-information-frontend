'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Input, Modal, Table, Tag, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined, MoreOutlined } from '@ant-design/icons';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { EmptyImage } from '@/components/emptyIndicator';
import { useGetBscScorecards } from '@/store/server/features/bsc/queries';
import {
  useAdjustBscReportedKpis,
  useFinalizeBscApprovals,
  useSetBscKpiApproval,
} from '@/store/server/features/bsc/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardKpiTarget,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

function targetLogicLabel(logic: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function latestTeamScorecards(
  scorecards: EmployeeScorecard[] | undefined,
  selfIds: string[],
): EmployeeScorecard[] {
  const skip = new Set(selfIds.filter(Boolean));
  const map = new Map<string, EmployeeScorecard>();
  for (const card of scorecards || []) {
    if (skip.has(card.userId)) continue;
    if (
      card.status !== ScorecardStatus.PendingEval &&
      card.status !== ScorecardStatus.NeedsResubmit &&
      card.status !== ScorecardStatus.Scored &&
      card.status !== ScorecardStatus.Completed
    ) {
      continue;
    }
    const existing = map.get(card.userId);
    if (!existing || (card.updatedAt || '') > (existing.updatedAt || '')) {
      map.set(card.userId, card);
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.userName.localeCompare(b.userName),
  );
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

function TeamScorecardCard({ scorecard }: { scorecard: EmployeeScorecard }) {
  const canReview = scorecard.status === ScorecardStatus.PendingEval;
  const [drafts, setDrafts] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      scorecard.targets.map((t) => [t.id, t.actualValue ?? null]),
    ),
  );
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        scorecard.targets.map((t) => [t.id, t.actualValue ?? null]),
      ),
    );
  }, [scorecard]);

  const { mutate: adjust } = useAdjustBscReportedKpis();
  const { mutateAsync: setApprovalAsync } = useSetBscKpiApproval();
  const { mutateAsync: finalizeAsync, isLoading: finalizing } =
    useFinalizeBscApprovals();

  const saveEdits = (onDone?: () => void) => {
    const adjustments = scorecard.targets
      .filter((t) => {
        const next = drafts[t.id];
        return next != null && next !== t.actualValue;
      })
      .map((t) => ({ targetId: t.id, actualValue: drafts[t.id] as number }));
    if (!adjustments.length) {
      onDone?.();
      return;
    }
    adjust({ scorecardId: scorecard.id, adjustments }, { onSuccess: onDone });
  };

  const decideAll = (approved: boolean, rejectionReason?: string) => {
    saveEdits(async () => {
      const pending = scorecard.targets.filter(
        (t) => t.approvalStatus === KpiApprovalStatus.Pending,
      );
      let latest = scorecard;
      for (const row of pending) {
        latest = await setApprovalAsync({
          scorecardId: scorecard.id,
          targetId: row.id,
          approved,
          rejectionReason,
        });
      }
      const stillPending = latest.targets.filter(
        (t) => t.approvalStatus === KpiApprovalStatus.Pending,
      );
      if (stillPending.length === 0) {
        await finalizeAsync(scorecard.id);
      }
    });
  };

  const cardApprovalMenu: MenuProps['items'] = [
    {
      key: 'approve',
      icon: <IoCheckmarkSharp />,
      label: (
        <Tooltip title="Approve reported KPIs. Once you approve, the employee cannot edit them.">
          Approve
        </Tooltip>
      ),
      onClick: () => decideAll(true),
      className: 'text-green-500',
    },
    {
      key: 'reject',
      icon: <CloseOutlined />,
      label: <Tooltip title="Reject reported KPIs">Reject</Tooltip>,
      onClick: () => {
        setRejectOpen(true);
        setRejectReason('');
      },
      className: 'text-red-400',
    },
  ];

  const columns: ColumnsType<ScorecardKpiTarget> = [
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-1"
        >
          KPI
        </span>
      ),
      dataIndex: 'kpiName',
      key: 'kpiName',
      render: (name: string, row) => (
        <div
          className="flex flex-col gap-1"
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-div-2"
        >
          <span
            className={tableCellClassName}
            data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-3"
          >
            {name}
          </span>
          <div
            className="flex flex-wrap items-center gap-1.5"
            data-cy="-bsc-bsc-my-scorecard-teamkpireview-div-4"
          >
            {row.assignmentSource === 'individual' ? (
              <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                Individual
              </Tag>
            ) : null}
            <span
              className="text-xs text-gray-500"
              data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-5"
            >
              {row.perspective}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-6"
        >
          Direction
        </span>
      ),
      dataIndex: 'targetLogic',
      key: 'targetLogic',
      width: 140,
      render: (logic: TargetLogic) => (
        <span
          className={tableCellClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-7"
        >
          {targetLogicLabel(logic)}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-8"
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
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-9"
        >
          {weight}%
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-10"
        >
          Target
        </span>
      ),
      dataIndex: 'targetValue',
      key: 'targetValue',
      width: 100,
      render: (value: number) => (
        <span
          className={tableCellClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-11"
        >
          {value == null ? '—' : String(value)}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-12"
        >
          Metric
        </span>
      ),
      dataIndex: 'measurementUnit',
      key: 'measurementUnit',
      width: 120,
      render: (unit: string) => (
        <span
          className={tableCellClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-13"
        >
          {unit?.trim() || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-14"
        >
          Actual
        </span>
      ),
      key: 'actual',
      width: 120,
      render: (unused: unknown, row: ScorecardKpiTarget) => {
        const value = drafts[row.id] ?? row.actualValue;
        if (!canReview) {
          return (
            <span
              className={tableCellClassName}
              data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-15"
            >
              {value == null ? '—' : String(value)}
            </span>
          );
        }
        return (
          <Input
            className="!w-[96px] h-8 text-sm"
            placeholder={
              row.targetValue != null ? String(row.targetValue) : 'Enter'
            }
            value={value == null ? '' : String(value)}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.-]/g, '');
              if (raw === '' || raw === '-') {
                setDrafts((prev) => ({ ...prev, [row.id]: null }));
                return;
              }
              const next = Number(raw);
              if (!Number.isFinite(next)) return;
              setDrafts((prev) => ({
                ...prev,
                [row.id]: next,
              }));
            }}
            onBlur={() => saveEdits()}
            data-cy={`bsc-team-kpi-actual-${row.id}`}
          />
        );
      },
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="-bsc-bsc-my-scorecard-teamkpireview-span-16"
        >
          Status
        </span>
      ),
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 110,
      render: (status: KpiApprovalStatus) => approvalTag(status),
    },
  ];

  return (
    <div
      className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      data-cy={`bsc-team-kpi-card-${scorecard.id}`}
    >
      <div
        data-cy="bsc-my-scorecard-components-teamkpireview-tsx-teamkpireview-div-241"
        className="px-4 pt-4 pb-3 sm:px-6 flex flex-wrap items-start justify-between gap-3"
      >
        <div data-cy="bsc-my-scorecard-components-teamkpireview-tsx-teamkpireview-div-242">
          <h2
            data-cy="bsc-my-scorecard-components-teamkpireview-tsx-teamkpireview-h2-243"
            className="mt-0 mb-0 text-base sm:text-lg font-bold text-gray-900"
          >
            {scorecard.userName}
          </h2>
          <p
            data-cy="bsc-my-scorecard-components-teamkpireview-tsx-teamkpireview-p-246"
            className="mt-1 mb-0 text-sm text-gray-500"
          >
            {scorecard.positionTitle || '—'}
            {scorecard.departmentName ? ` · ${scorecard.departmentName}` : ''}
            {scorecard.cycleLabel ? ` · ${scorecard.cycleLabel}` : ''}
          </p>
        </div>
        {canReview ? (
          <Dropdown menu={{ items: cardApprovalMenu }} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              loading={finalizing}
              className="text-green-600 hover:bg-transparent !p-0 !h-auto !w-auto text-base"
              style={{ minWidth: 'auto' }}
              data-cy={`bsc-team-kpi-card-menu-${scorecard.id}`}
            />
          </Dropdown>
        ) : null}
      </div>
      <div
        data-cy="bsc-my-scorecard-components-teamkpireview-tsx-teamkpireview-div-265"
        className="border-t border-gray-200 overflow-x-auto"
      >
        <Table
          className="w-full [&_.ant-table]:!border-[#D9D9D9]"
          columns={columns}
          dataSource={scorecard.targets}
          pagination={false}
          rowKey="id"
          rowHoverable={false}
          scroll={{ x: 960 }}
        />
      </div>
      <Modal
        title="Reject reported KPIs"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={() => {
          decideAll(false, rejectReason.trim() || 'Rejected');
          setRejectOpen(false);
        }}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <p
          data-cy="bsc-my-scorecard-components-teamkpireview-tsx-teamkpireview-p-286"
          className="text-sm text-gray-600 mb-2"
        >
          Tell the employee what to correct before they resubmit.
        </p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Rejection reason"
        />
      </Modal>
    </div>
  );
}

export default function TeamKpiReview() {
  const { userId } = useAuthenticationStore();
  const { data: scorecards, isLoading } = useGetBscScorecards();

  const team = useMemo(
    () => latestTeamScorecards(scorecards, [userId, 'demo-user']),
    [scorecards, userId],
  );

  if (isLoading) {
    return (
      <div
        data-cy="bsc-my-scorecard-components-teamkpireview-tsx-teamkpireview-div-310"
        className="py-16 text-center text-gray-400"
      >
        Loading…
      </div>
    );
  }

  if (!team.length) {
    return (
      <div className="flex justify-center py-10" data-cy="bsc-team-kpi-empty">
        <EmptyImage />
      </div>
    );
  }

  return (
    <div data-cy="bsc-team-kpi-tab-content">
      {team.map((card) => (
        <TeamScorecardCard key={card.id} scorecard={card} />
      ))}
    </div>
  );
}
