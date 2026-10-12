'use client';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, Progress, Skeleton, Tooltip } from 'antd';
import {
  KeyOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { DeadlineKeyResult } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlineKeyResults } from '@/store/server/features/deadlinePlan/queries';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import { UserAvatar } from './TaskBadges';
import { PersonOption } from './useDeadlinePeople';
import { averageProgress, progressPercent, resolveMetricKind } from './utils';

/** Owners beyond this are left out of the panel to keep it readable. */
export const KEY_RESULT_PANEL_OWNER_LIMIT = 20;

interface KeyResultPanelProps {
  userId: string;
  ownerIds: string[];
  getPerson: (id: string | null | undefined) => PersonOption | null;
}

function ProgressPill({ value }: { value: number }) {
  return (
    <span
      data-cy="deadline-kr-progress-pill"
      className={classNames(
        'inline-flex min-w-[44px] justify-center rounded-md px-2 py-0.5 text-xs font-semibold',
        value >= 100
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500',
      )}
    >
      {value}%
    </span>
  );
}

function KeyResultRow({
  keyResult,
  onAddTask,
}: {
  keyResult: DeadlineKeyResult;
  onAddTask: () => void;
}) {
  const progress = progressPercent(keyResult.progress);
  const isNumeric = resolveMetricKind(keyResult) === 'numeric';

  return (
    <div
      data-cy={`deadline-kr-row-${keyResult.id}`}
      className="rounded-xl border border-slate-100 bg-white p-3"
    >
      <div
        data-cy="deadline-kr-row-head"
        className="flex items-start justify-between gap-2"
      >
        <span
          data-cy="deadline-kr-title"
          className="line-clamp-2 text-sm text-slate-800"
          title={keyResult.title}
        >
          {keyResult.title}
        </span>
        <span
          data-cy="deadline-kr-row-actions"
          className="inline-flex shrink-0 items-center gap-1"
        >
          <ProgressPill value={progress} />
          <Tooltip title="Add a task for this key result">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              aria-label="Add a task for this key result"
              onClick={onAddTask}
              data-cy={`deadline-kr-add-task-${keyResult.id}`}
            />
          </Tooltip>
        </span>
      </div>
      <Progress
        percent={Math.min(progress, 100)}
        showInfo={false}
        size="small"
        strokeColor="#10b981"
        className="!mb-0 !mt-2"
      />
      <div
        data-cy="deadline-kr-meta"
        className="mt-1 flex items-center gap-2 text-xs text-slate-500"
      >
        <span data-cy="deadline-kr-metric">
          {keyResult.metricType?.name ?? 'Key result'}
        </span>
        {isNumeric ? (
          <span data-cy="deadline-kr-values">
            {Number(keyResult.currentValue ?? 0)}/
            {Number(keyResult.targetValue ?? 0)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function KeyResultPanel({
  userId,
  ownerIds,
  getPerson,
}: KeyResultPanelProps) {
  const isOpen = useDeadlinePlanStore((state) => state.isKeyResultPanelOpen);
  const setOpen = useDeadlinePlanStore((state) => state.setKeyResultPanelOpen);
  const openTaskForm = useDeadlinePlanStore((state) => state.openTaskForm);
  const [expandedOwnerIds, setExpandedOwnerIds] = useState<string[]>([]);

  const shownOwnerIds = ownerIds.slice(0, KEY_RESULT_PANEL_OWNER_LIMIT);
  const queries = useDeadlineKeyResults(shownOwnerIds);

  const groups = shownOwnerIds.map((ownerId, index) => ({
    ownerId,
    person: getPerson(ownerId),
    keyResults: (queries[index]?.data ?? []) as DeadlineKeyResult[],
    isLoading: !!queries[index]?.isLoading,
  }));
  const isLoading = groups.some((group) => group.isLoading);
  const ownersWithKeyResults = groups.filter(
    (group) => group.keyResults.length > 0,
  );
  const total = groups.reduce(
    (count, group) => count + group.keyResults.length,
    0,
  );

  const toggleOwner = (ownerId: string) =>
    setExpandedOwnerIds((ids) =>
      ids.includes(ownerId)
        ? ids.filter((id) => id !== ownerId)
        : [...ids, ownerId],
    );

  if (!isOpen) {
    return (
      <div data-cy="deadline-kr-panel-collapsed" className="shrink-0">
        <Tooltip title="Show key results" placement="right">
          <Button
            icon={<KeyOutlined />}
            onClick={() => setOpen(true)}
            aria-label="Show key results"
            data-cy="deadline-kr-panel-expand"
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <aside
      data-cy="deadline-kr-panel"
      className="flex w-full shrink-0 flex-col gap-3 lg:w-[360px]"
    >
      <div
        data-cy="deadline-kr-panel-header"
        className="flex items-center gap-2"
      >
        <span
          data-cy="deadline-kr-panel-icon"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
        >
          <KeyOutlined />
        </span>
        <span
          data-cy="deadline-kr-panel-title"
          className="text-sm font-semibold text-slate-900"
        >
          Key Results
        </span>
        <span
          data-cy="deadline-kr-panel-summary"
          className="min-w-0 flex-1 truncate text-sm text-slate-500"
        >
          {total} key result{total === 1 ? '' : 's'} ·{' '}
          {ownersWithKeyResults.length} owner
          {ownersWithKeyResults.length === 1 ? '' : 's'}
        </span>
        <Button
          type="text"
          size="small"
          icon={<LeftOutlined />}
          onClick={() => setOpen(false)}
          aria-label="Hide key results"
          data-cy="deadline-kr-panel-collapse"
        />
      </div>

      <div
        data-cy="deadline-kr-panel-body"
        className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-2"
      >
        {isLoading && total === 0 ? (
          <div data-cy="deadline-kr-panel-loading" className="p-3">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : null}

        {!isLoading && total === 0 ? (
          <div
            data-cy="deadline-kr-panel-empty"
            className="p-4 text-sm text-slate-500"
          >
            No key results for the selected people in the current session.
          </div>
        ) : null}

        {ownersWithKeyResults.map((group) => {
          const expanded = expandedOwnerIds.includes(group.ownerId);
          const name = group.person?.name ?? 'Unknown user';
          const isSelf = group.ownerId === userId;

          return (
            <div
              key={group.ownerId}
              data-cy={`deadline-kr-owner-${group.ownerId}`}
              className="rounded-xl bg-white"
            >
              <button
                type="button"
                data-cy={`deadline-kr-owner-toggle-${group.ownerId}`}
                onClick={() => toggleOwner(group.ownerId)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50"
              >
                <UserAvatar name={name} size="lg" />
                <span
                  data-cy="deadline-kr-owner-text"
                  className="flex min-w-0 flex-1 flex-col"
                >
                  <span
                    data-cy="deadline-kr-owner-name"
                    className="truncate text-sm font-semibold text-slate-900"
                  >
                    {isSelf ? 'Your Key Results' : name}
                  </span>
                  <span
                    data-cy="deadline-kr-owner-meta"
                    className="truncate text-xs text-slate-500"
                  >
                    {!isSelf && group.person?.departmentName
                      ? `${group.person.departmentName} · `
                      : ''}
                    {group.keyResults.length} KR
                    {group.keyResults.length === 1 ? '' : 's'}
                  </span>
                </span>
                <ProgressPill value={averageProgress(group.keyResults)} />
                <RightOutlined
                  className={classNames(
                    'text-xs text-slate-400 transition-transform',
                    expanded && 'rotate-90',
                  )}
                />
              </button>

              {expanded ? (
                <div
                  data-cy="deadline-kr-owner-list"
                  className="flex flex-col gap-2 px-2 pb-2"
                >
                  {group.keyResults.map((keyResult) => (
                    <KeyResultRow
                      key={keyResult.id}
                      keyResult={keyResult}
                      onAddTask={() =>
                        openTaskForm({
                          keyResult: {
                            id: keyResult.id,
                            ownerId: group.ownerId,
                          },
                        })
                      }
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        {ownerIds.length > shownOwnerIds.length ? (
          <div
            data-cy="deadline-kr-panel-limit"
            className="px-2 py-1 text-xs text-slate-500"
          >
            Showing key results for the first {shownOwnerIds.length} of{' '}
            {ownerIds.length} selected people.
          </div>
        ) : null}
      </div>
    </aside>
  );
}
