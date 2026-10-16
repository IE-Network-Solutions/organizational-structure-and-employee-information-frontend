'use client';
import React, { useId, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Skeleton } from 'antd';
import { DownOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import TaskCard from './TaskCard';
import TaskDetailsModal from './TaskDetailsModal';
import { groupTasksByDate } from './taskDateGroups';
import { PersonOption } from './useDeadlinePeople';
import { useTaskActions } from './useTaskActions';
import { TaskViewer } from './utils';

interface TaskListProps {
  tasks: DeadlineTask[];
  viewer: TaskViewer;
  getPerson: (id: string | null | undefined) => PersonOption | null;
  loading?: boolean;
  emptyText?: React.ReactNode;
  showAddTask?: boolean;
}

export default function TaskList({
  tasks,
  viewer,
  getPerson,
  loading,
  emptyText,
  showAddTask = true,
}: TaskListProps) {
  const listId = useId();
  const duration = useDeadlinePlanStore((state) => state.duration);
  const openTaskForm = useDeadlinePlanStore((state) => state.openTaskForm);
  const actions = useTaskActions(viewer);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const today = dayjs().format('YYYY-MM-DD');
  const groups = useMemo(
    () => groupTasksByDate(tasks, dayjs(today), duration !== 'history'),
    [tasks, today, duration],
  );
  // Resolve against the current query data so reports, locks, and edits refresh
  // the open detail view, and deleting a task closes it automatically.
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  if (loading) {
    return (
      <div
        data-cy="deadline-task-list-loading"
        className="space-y-3"
        aria-label="Loading tasks"
      >
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  return (
    <div data-cy="deadline-task-list" className="flex min-w-0 flex-col gap-7">
      {groups.map((group) => {
        const collapsed = collapsedGroups.includes(group.id);
        return (
          <section
            key={group.id}
            data-cy={`deadline-task-date-group-${group.id}`}
            aria-label={group.label}
          >
            <h3 data-cy="deadline-task-date-heading">
              <button
                type="button"
                data-cy={`deadline-task-date-toggle-${group.id}`}
                aria-expanded={!collapsed}
                aria-controls={`${listId}-deadline-date-tasks-${group.id}`}
                onClick={() =>
                  setCollapsedGroups((current) =>
                    collapsed
                      ? current.filter((id) => id !== group.id)
                      : [...current, group.id],
                  )
                }
                className="mb-3 flex w-full items-center gap-2 border-b border-[#F1F2F6] pb-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-okr-primary"
              >
                {collapsed ? (
                  <RightOutlined className="text-[10px] text-slate-400" />
                ) : (
                  <DownOutlined className="text-[10px] text-slate-400" />
                )}
                <span
                  data-cy="deadline-task-date-label"
                  className={classNames(
                    'text-sm font-semibold',
                    group.isOverdue
                      ? 'text-red-600'
                      : group.isToday
                        ? 'text-okr-primary'
                        : 'text-[#161A2C]',
                  )}
                >
                  {group.label}
                </span>
                <span
                  data-cy="deadline-task-date-count"
                  className="ml-1 text-xs text-slate-400"
                >
                  {group.tasks.length}
                </span>
              </button>
            </h3>
            {!collapsed ? (
              <div
                id={`${listId}-deadline-date-tasks-${group.id}`}
                data-cy="deadline-task-date-content"
                className="space-y-2"
              >
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    person={getPerson(task.assigneeId)}
                    actions={actions}
                    onOpen={() => setSelectedTaskId(task.id)}
                  />
                ))}
                {group.tasks.length === 0 ? (
                  <p
                    data-cy="deadline-task-date-empty"
                    className="px-7 py-3 text-sm text-slate-500"
                  >
                    {tasks.length === 0
                      ? (emptyText ?? 'No tasks due today.')
                      : 'No tasks due today.'}
                  </p>
                ) : null}
                {group.isToday && showAddTask ? (
                  <button
                    type="button"
                    onClick={() => openTaskForm()}
                    data-cy="deadline-task-date-add"
                    className="flex items-center gap-3 px-1 py-2 text-sm text-slate-500 transition-colors hover:text-okr-primary"
                  >
                    <PlusOutlined className="w-5 text-okr-primary" /> Add task
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
      {groups.length === 0 ? (
        <p
          data-cy="deadline-task-list-empty"
          className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500"
        >
          {emptyText ?? 'No tasks to show.'}
        </p>
      ) : null}
      <TaskDetailsModal
        task={selectedTask}
        actions={actions}
        viewer={viewer}
        getPerson={getPerson}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
