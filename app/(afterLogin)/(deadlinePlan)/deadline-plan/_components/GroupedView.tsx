'use client';
import React, { useEffect, useState } from 'react';
import { Button, Segmented } from 'antd';
import {
  DeadlineTaskSearchFilter,
  DeadlineTaskStatusFilter,
} from '@/store/server/features/deadlinePlan/interface';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import PlanCard from './PlanCard';
import { PersonOption } from './useDeadlinePeople';
import { TaskViewer } from './utils';

/** Each card runs its own query, so people are revealed a batch at a time. */
const CARD_BATCH_SIZE = 8;

interface GroupedViewProps {
  /** Selected assignees with the signed-in user first. */
  assigneeIds: string[];
  filter: Omit<DeadlineTaskSearchFilter, 'assigneeIds'>;
  viewer: TaskViewer;
  getPerson: (id: string | null | undefined) => PersonOption | null;
}

/** One plan card per selected person, "My Plan" first. */
export default function GroupedView({
  assigneeIds,
  filter,
  viewer,
  getPerson,
}: GroupedViewProps) {
  const { status, duration, setStatus } = useDeadlinePlanStore();
  const [visibleCount, setVisibleCount] = useState(CARD_BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(CARD_BATCH_SIZE);
  }, [assigneeIds]);

  const visibleIds = assigneeIds.slice(0, visibleCount);
  const remaining = assigneeIds.length - visibleIds.length;

  return (
    <div
      data-cy="deadline-plan-grouped-view"
      className="flex min-w-0 flex-col gap-8"
    >
      <div
        data-cy="deadline-plan-grouped-review-controls"
        className="flex flex-wrap items-center justify-between gap-3 px-1 sm:px-4"
      >
        <span
          data-cy="deadline-plan-grouped-review-label"
          className="text-xs text-slate-500"
        >
          Plans by person
        </span>
        <Segmented<DeadlineTaskStatusFilter>
          value={duration === 'history' ? 'reported' : status}
          onChange={setStatus}
          disabled={duration === 'history'}
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Reported', value: 'reported' },
            { label: 'All', value: 'all' },
          ]}
          size="small"
          aria-label="Task status"
          data-cy="deadline-plan-grouped-status"
          className="!bg-slate-50 [&_.ant-segmented-item-selected]:!text-okr-primary"
        />
      </div>
      {visibleIds.map((assigneeId) => (
        <PlanCard
          key={assigneeId}
          assigneeId={assigneeId}
          filter={filter}
          viewer={viewer}
          getPerson={getPerson}
        />
      ))}

      {assigneeIds.length === 0 ? (
        <div
          data-cy="deadline-plan-cards-empty"
          className="rounded-xl bg-slate-50/80 p-8 text-center text-sm text-slate-500"
        >
          Choose at least one person to see their plan.
        </div>
      ) : null}

      {remaining > 0 ? (
        <div
          data-cy="deadline-plan-more-people"
          className="flex justify-center"
        >
          <Button
            type="text"
            className="!text-okr-primary"
            onClick={() => setVisibleCount((count) => count + CARD_BATCH_SIZE)}
            data-cy="deadline-plan-more-people-button"
          >
            Show {Math.min(remaining, CARD_BATCH_SIZE)} more people ({remaining}{' '}
            left)
          </Button>
        </div>
      ) : null}
    </div>
  );
}
