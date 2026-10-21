'use client';
import React, { useCallback, useMemo } from 'react';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlineTasks } from '@/store/server/features/deadlinePlan/queries';
import LoadMore from './LoadMore';
import TaskList from './TaskList';
import { PersonOption } from './useDeadlinePeople';
import { flattenTaskPages, TaskViewer } from './utils';

interface ListViewProps {
  filter: DeadlineTaskSearchFilter;
  viewer: TaskViewer;
  getPerson: (id: string | null | undefined) => PersonOption | null;
}

/** One date-grouped list of every selected person's tasks. */
export default function ListView({ filter, viewer, getPerson }: ListViewProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useDeadlineTasks(filter);

  const tasks = useMemo(() => flattenTaskPages(data?.pages), [data]);
  const loadMore = useCallback(() => fetchNextPage(), [fetchNextPage]);

  return (
    <section
      data-cy="deadline-plan-list-view"
      className="w-full min-w-0 bg-white px-1 py-2 sm:px-4"
    >
      <TaskList
        tasks={tasks}
        viewer={viewer}
        getPerson={getPerson}
        loading={isLoading}
        emptyText="No tasks to show for the selected people and dates."
      />
      <LoadMore
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={loadMore}
      />
    </section>
  );
}
