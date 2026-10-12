'use client';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import KeyResultPanel from './KeyResultPanel';
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

export default function GroupedView({
  assigneeIds,
  filter,
  viewer,
  getPerson,
}: GroupedViewProps) {
  const [visibleCount, setVisibleCount] = useState(CARD_BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(CARD_BATCH_SIZE);
  }, [assigneeIds]);

  const visibleIds = assigneeIds.slice(0, visibleCount);
  const remaining = assigneeIds.length - visibleIds.length;

  return (
    <div
      data-cy="deadline-plan-grouped-view"
      className="flex w-full flex-col items-start gap-4 lg:flex-row"
    >
      <KeyResultPanel
        userId={viewer.userId}
        ownerIds={assigneeIds}
        getPerson={getPerson}
      />

      <div
        data-cy="deadline-plan-cards"
        className="flex min-w-0 flex-1 flex-col gap-4 self-stretch"
      >
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
            className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500"
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
              onClick={() =>
                setVisibleCount((count) => count + CARD_BATCH_SIZE)
              }
              data-cy="deadline-plan-more-people-button"
            >
              Show {Math.min(remaining, CARD_BATCH_SIZE)} more people (
              {remaining} left)
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
