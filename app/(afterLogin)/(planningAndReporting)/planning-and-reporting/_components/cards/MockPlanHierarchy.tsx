'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Tooltip, message } from 'antd';
import {
  DownOutlined,
  RightOutlined,
  PlusOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import classNames from 'classnames';
import {
  formatDate,
  todayIso,
  validateDailySubtask,
  validateWeeklySubtask,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  childCapForParent,
  childKindForParent,
  countChildren,
} from '../prototype/mockPlanningConstants';
import {
  useUserPlanRepositoryMock,
  type MockPlanTask,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

function childrenOf(tasks: MockPlanTask[], parentId: string): MockPlanTask[] {
  return tasks.filter((t) => t.parentId === parentId);
}

function kindLabel(kind: DeadlineKind): string {
  if (kind === 'month') return 'weekly';
  if (kind === 'week') return 'daily';
  return 'sub';
}

function parentCapacitySummary(
  task: MockPlanTask,
  allTasks: MockPlanTask[],
): string | null {
  const cap = childCapForParent(task.kind, task.start, task.deadline);
  if (cap <= 0) return null;
  const direct = countChildren(allTasks, task.id);
  const childKind = childKindForParent(task.kind);
  if (task.kind === 'month') {
    const weeklyChildren = childrenOf(allTasks, task.id);
    let dailyLeft = 0;
    for (const week of weeklyChildren) {
      const wCap = childCapForParent(week.kind, week.start, week.deadline);
      dailyLeft += Math.max(0, wCap - countChildren(allTasks, week.id));
    }
    return `${direct}/${cap} weekly · ${dailyLeft} daily left`;
  }
  if (childKind) {
    return `${direct}/${cap} ${kindLabel(task.kind)}`;
  }
  return null;
}

function normalizePriority(p?: string): string {
  if (!p) return 'Low';
  const n = p.toLowerCase();
  if (n === 'high') return 'High';
  if (n === 'medium') return 'Medium';
  if (n === 'priority' || n === 'urgent') return 'Priority';
  return 'Low';
}

function toRowTask(task: MockPlanTask) {
  return {
    id: task.id,
    title: task.title,
    task: task.title,
    taskName: task.title,
    priority: normalizePriority(task.priority),
    weight: task.weight ?? 0,
    status: task.done ? 'pre_achieved' : 'pre_pending',
    deadline: task.deadline,
    startDate: task.start,
    endDate: task.deadline,
    isPendingApproval: task.isPendingApproval,
    kind: task.kind,
    parentId: task.parentId,
  };
}

export interface MockPlanHierarchyProps {
  ownerUserId: string;
  /** Confirmed (non-pending) or pending slice */
  tasks: MockPlanTask[];
  /** Full active task list for parent lookup / caps */
  allActiveTasks: MockPlanTask[];
  isTeammatePlan: boolean;
  canAddSubtasks: boolean;
  durationKind: DeadlineKind;
  hideInteractiveMarkers?: boolean;
  renderTaskRow: (
    task: any,
    opts?: {
      depth?: number;
      prefix?: React.ReactNode;
      afterTitle?: React.ReactNode;
      hideCheckbox?: boolean;
    },
  ) => React.ReactNode;
}

export default function MockPlanHierarchy({
  ownerUserId,
  tasks,
  allActiveTasks,
  isTeammatePlan,
  canAddSubtasks,
  durationKind,
  hideInteractiveMarkers = false,
  renderTaskRow,
}: MockPlanHierarchyProps) {
  const appendTask = useUserPlanRepositoryMock((s) => s.appendTask);
  const flatMode = durationKind === 'daily';
  const taskIds = useMemo(() => new Set(tasks.map((t) => t.id)), [tasks]);

  const roots = useMemo(() => {
    if (flatMode) return tasks;
    return tasks.filter((t) => !t.parentId || !taskIds.has(t.parentId));
  }, [tasks, taskIds, flatMode]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (flatMode) return new Set();
    const initial = new Set<string>();
    for (const t of tasks) {
      if (t.parentId && taskIds.has(t.parentId)) initial.add(t.parentId);
      const parent = allActiveTasks.find((p) => p.id === t.parentId);
      if (parent?.parentId && taskIds.has(parent.parentId)) {
        initial.add(parent.parentId);
      }
    }
    return initial;
  });
  const [focusParentId, setFocusParentId] = useState<string | null>(null);
  const [addingUnderId, setAddingUnderId] = useState<string | null>(null);
  const [childTitle, setChildTitle] = useState('');
  const [childStart, setChildStart] = useState<Dayjs | null>(dayjs());
  const [childDeadline, setChildDeadline] = useState<Dayjs | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const revealParent = useCallback(
    (parentId: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        const parent = allActiveTasks.find((p) => p.id === parentId);
        if (parent?.parentId) next.add(parent.parentId);
        return next;
      });
      setFocusParentId(parentId);
      window.setTimeout(() => setFocusParentId(null), 1600);
    },
    [allActiveTasks],
  );

  const startAddChild = useCallback((parent: MockPlanTask) => {
    setAddingUnderId(parent.id);
    setExpandedIds((prev) => new Set(prev).add(parent.id));
    setChildTitle('');
    setChildStart(dayjs(parent.start));
    if (childKindForParent(parent.kind) === 'daily') {
      setChildDeadline(dayjs(parent.start));
    } else {
      setChildDeadline(dayjs(parent.deadline));
    }
  }, []);

  const submitChild = useCallback(
    (parent: MockPlanTask) => {
      const title = childTitle.trim();
      if (!title) {
        message.warning('Enter a subtask title.');
        return;
      }
      const startIso = childStart ? formatDate(childStart) : todayIso();
      const childKind = childKindForParent(parent.kind);
      const deadlineIso =
        childKind === 'daily'
          ? startIso
          : childDeadline
            ? formatDate(childDeadline)
            : '';
      if (!deadlineIso) {
        message.warning('Choose an end date.');
        return;
      }
      if (childKind === 'daily') {
        const valid = validateDailySubtask(parent, startIso);
        if (!valid.ok) {
          message.warning(valid.error);
          return;
        }
      } else if (childKind === 'week') {
        const valid = validateWeeklySubtask(parent, startIso, deadlineIso);
        if (!valid.ok) {
          message.warning(valid.error);
          return;
        }
      }
      const result = appendTask(ownerUserId, {
        title,
        start: startIso,
        deadline: deadlineIso,
        parentId: parent.id,
        keyResultId: parent.keyResultId,
        priority: parent.priority ?? 'medium',
      });
      if (!result.ok) {
        message.warning(result.error);
        return;
      }
      message.success(
        childKind === 'daily'
          ? 'Daily subtask added.'
          : 'Weekly subtask added.',
      );
      setAddingUnderId(null);
      setChildTitle('');
      setExpandedIds((prev) => new Set(prev).add(parent.id));
    },
    [appendTask, childDeadline, childStart, childTitle, ownerUserId],
  );

  const renderParentLink = (task: MockPlanTask) => {
    if (hideInteractiveMarkers) return null;
    const parentTask = task.parentId
      ? allActiveTasks.find((p) => p.id === task.parentId)
      : null;
    if (!parentTask) return null;

    if (flatMode) {
      return (
        <Tooltip title={`Under: ${parentTask.title}`}>
          <span
            data-cy={`mock-plan-parent-link-${task.id}`}
            className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-[#F3F4F6] text-[#6366F1]"
            aria-label={`Parent task: ${parentTask.title}`}
          >
            <LinkOutlined className="text-[12px]" />
          </span>
        </Tooltip>
      );
    }

    return (
      <button
        type="button"
        data-cy={`mock-plan-view-parent-${task.id}`}
        className="rounded-md bg-[#EEF2FF] px-1.5 py-0.5 text-[11px] font-semibold text-[#4338CA] hover:bg-[#E0E7FF]"
        onClick={() => revealParent(parentTask.id)}
        title={`Under: ${parentTask.title}`}
      >
        Under: {parentTask.title}
      </button>
    );
  };

  const renderFlatRow = (task: MockPlanTask) => {
    const parentLink = renderParentLink(task);
    const prefix = parentLink ?? (
      <span
        data-cy="mockplanhierarchy-277"
        className="mt-0.5 inline-block h-[18px] w-[18px] shrink-0 rounded bg-[#F3F4F6]"
      />
    );
    return (
      <div key={task.id} data-cy={`mock-plan-node-${task.id}`}>
        {renderTaskRow(toRowTask(task), {
          depth: 0,
          prefix,
          hideCheckbox: hideInteractiveMarkers,
        })}
      </div>
    );
  };

  const renderNode = (task: MockPlanTask, depth: number): React.ReactNode => {
    const kidsInSlice = childrenOf(tasks, task.id);
    const kidsAll = childrenOf(allActiveTasks, task.id).filter((c) => {
      // Counts / add only for the child kind this filter shows
      if (durationKind === 'week') return c.kind === 'daily';
      if (durationKind === 'month') return c.kind === 'week';
      return true;
    });
    const cap = childCapForParent(task.kind, task.start, task.deadline);
    const childKind = childKindForParent(task.kind);
    const canAddAtThisLevel =
      (durationKind === 'week' && task.kind === 'week') ||
      (durationKind === 'month' && task.kind === 'month');
    const canHaveChildren = canAddAtThisLevel && cap > 0 && !!childKind;
    const expanded = expandedIds.has(task.id);
    const capacityLabel = canAddAtThisLevel
      ? parentCapacitySummary(task, allActiveTasks)
      : null;
    const focused = focusParentId === task.id;

    const prefix =
      kidsInSlice.length > 0 ? (
        <div
          data-cy="mockplanhierarchy-312"
          className="mt-0.5 flex shrink-0 items-center gap-0.5"
        >
          <button
            type="button"
            data-cy={`mock-plan-expand-${task.id}`}
            className="flex h-[18px] w-[18px] items-center justify-center rounded text-[#8F94A3] hover:bg-[#F1F2F6] hover:text-[#574CFF]"
            onClick={() => toggleExpanded(task.id)}
            aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {expanded ? (
              <DownOutlined className="text-[10px]" />
            ) : (
              <RightOutlined className="text-[10px]" />
            )}
          </button>
        </div>
      ) : depth > 0 ? undefined : (
        <span
          data-cy="mockplanhierarchy-328"
          className="mt-0.5 inline-block h-[18px] w-[18px] shrink-0 rounded bg-[#F3F4F6]"
        />
      );

    const addSubtaskBtn =
      canAddSubtasks && canHaveChildren && !isTeammatePlan ? (
        <Tooltip
          title={
            addingUnderId === task.id
              ? 'Cancel'
              : `Add ${kindLabel(task.kind)} (${kidsAll.length}/${cap})`
          }
        >
          <button
            type="button"
            data-cy={`mock-plan-add-subtask-${task.id}`}
            className={classNames(
              'mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-[#574CFF] hover:bg-[#EEF2FF] hover:text-[#4338CA]',
              addingUnderId === task.id && 'bg-[#EEF2FF]',
            )}
            onClick={() =>
              addingUnderId === task.id
                ? setAddingUnderId(null)
                : startAddChild(task)
            }
            aria-label={
              addingUnderId === task.id
                ? 'Cancel add subtask'
                : `Add ${kindLabel(task.kind)}`
            }
          >
            {addingUnderId === task.id ? (
              <span
                data-cy="mockplanhierarchy-359"
                className="text-[12px] font-bold leading-none"
              >
                ×
              </span>
            ) : (
              <PlusOutlined className="text-[11px]" />
            )}
          </button>
        </Tooltip>
      ) : null;

    const showMeta = Boolean(capacityLabel);

    return (
      <div
        key={task.id}
        data-cy={`mock-plan-node-${task.id}`}
        className={classNames(focused && 'rounded-lg ring-2 ring-[#574CFF]/35')}
      >
        <div data-cy="mockplanhierarchy-375" className="relative">
          {renderTaskRow(toRowTask(task), {
            depth,
            prefix,
            afterTitle: addSubtaskBtn,
            hideCheckbox: hideInteractiveMarkers,
          })}
          {showMeta ? (
            <div
              data-cy="mockplanhierarchy-383"
              className="flex flex-wrap items-center gap-2 px-2.5 pb-1 pl-[66px]"
            >
              {capacityLabel ? (
                <span
                  data-cy={`mock-plan-capacity-${task.id}`}
                  className="text-[11px] font-medium text-[#8F94A3]"
                >
                  {capacityLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {addingUnderId === task.id ? (
          <div
            data-cy={`mock-plan-subtask-form-${task.id}`}
            className="mb-2 ml-[66px] space-y-2 rounded-lg border border-[#E5E7EB] bg-white p-2.5"
          >
            <Input
              size="small"
              placeholder={
                childKind === 'daily'
                  ? 'Daily subtask title'
                  : 'Weekly subtask title'
              }
              value={childTitle}
              onChange={(e) => setChildTitle(e.target.value)}
              data-cy={`mock-plan-subtask-title-${task.id}`}
            />
            <div
              data-cy="mockplanhierarchy-412"
              className="flex flex-wrap gap-2"
            >
              <DatePicker
                size="small"
                value={childStart}
                onChange={(v) => {
                  setChildStart(v);
                  if (childKind === 'daily') setChildDeadline(v);
                }}
                placeholder="Start"
                className="min-w-[130px] flex-1"
              />
              {childKind !== 'daily' ? (
                <DatePicker
                  size="small"
                  value={childDeadline}
                  onChange={setChildDeadline}
                  placeholder="End"
                  className="min-w-[130px] flex-1"
                />
              ) : null}
              <Button
                size="small"
                type="primary"
                onClick={() => submitChild(task)}
                data-cy={`mock-plan-subtask-submit-${task.id}`}
              >
                Add
              </Button>
            </div>
            <p
              data-cy="mockplanhierarchy-441"
              className="m-0 text-[11px] text-[#8F94A3]"
            >
              Within parent {task.start} → {task.deadline}
            </p>
          </div>
        ) : null}

        {expanded && kidsInSlice.length > 0 ? (
          <div
            /* Align under parent checkbox center:
               row px-2.5(10) + chevron(18) + gap(10) + half checkbox(9) = 47 */
            className="relative ml-[47px] space-y-[2px] border-l border-[#C9CDD8] pl-4"
            data-cy={`mock-plan-children-${task.id}`}
          >
            {kidsInSlice.map((child) => (
              <div key={child.id} data-cy={`mock-plan-branch-${child.id}`}>
                {renderNode(child, depth + 1)}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  if (roots.length === 0) return null;

  return (
    <div className="space-y-[2px]" data-cy="mock-plan-hierarchy">
      {flatMode
        ? roots.map((t) => renderFlatRow(t))
        : roots.map((t) => renderNode(t, 0))}
    </div>
  );
}
