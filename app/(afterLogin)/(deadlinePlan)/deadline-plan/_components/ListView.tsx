'use client';
import React, { useCallback, useMemo } from 'react';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlineTasks } from '@/store/server/features/deadlinePlan/queries';
import LoadMore from './LoadMore';
import TaskTable from './TaskTable';
import { PersonOption } from './useDeadlinePeople';
import { flattenTaskPages, TaskViewer } from './utils';

interface ListViewProps {
  filter: DeadlineTaskSearchFilter;
  viewer: TaskViewer;
  getPerson: (id: string | null | undefined) => PersonOption | null;
}

/** One cross-team table of every selected person's tasks. */
export default function ListView({ filter, viewer, getPerson }: ListViewProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useDeadlineTasks(filter);

  const tasks = useMemo(() => flattenTaskPages(data?.pages), [data]);
  const loadMore = useCallback(() => fetchNextPage(), [fetchNextPage]);

  return (
    <section
      data-cy="deadline-plan-list-view"
      className="w-full rounded-2xl border border-slate-100 bg-white p-4"
    >
      <TaskTable
        tasks={tasks}
        mode="list"
        viewer={viewer}
        getPerson={getPerson}
        loading={isLoading}
        emptyText="No tasks for these filters."
      />
      <LoadMore
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={loadMore}
      />
    </section>
  );
}
