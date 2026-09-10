'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Tooltip } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  childCapForParent,
  childKindForParent,
  countChildren,
} from '../prototype/mockPlanningConstants';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import SubtasksModal from './SubtasksModal';

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
    targetValue: task.targetValue ?? task.weight ?? 0,
    status: task.done ? 'pre_achieved' : 'pre_pending',
    deadline: task.deadline,
    startDate: task.start,
    endDate: task.deadline,
    isPendingApproval: task.isPendingApproval,
    isLocked: task.isLocked,
    lockComment: task.lockComment,
    commentCount: task.comments?.length ?? 0,
    kind: task.kind,
    parentId: task.parentId,
    keyResultId: task.keyResultId ?? null,
    keyResultTitle: task.keyResultTitle ?? null,
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
      onOpen?: () => void;
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
  const flatMode = durationKind === 'daily';
  const taskIds = useMemo(() => new Set(tasks.map((t) => t.id)), [tasks]);

  /** Flat list only — children of parents in this slice live in SubtasksModal. */
  const listTasks = useMemo(() => {
    if (flatMode) return tasks;
    return tasks.filter((t) => !t.parentId || !taskIds.has(t.parentId));
  }, [tasks, taskIds, flatMode]);

  const [modalParent, setModalParent] = useState<MockPlanTask | null>(null);

  const openSubtasksModal = useCallback((parent: MockPlanTask) => {
    setModalParent(parent);
  }, []);

  const renderParentLink = (task: MockPlanTask) => {
    if (hideInteractiveMarkers) return null;
    const parentTask = task.parentId
      ? allActiveTasks.find((p) => p.id === task.parentId)
      : null;
    if (!parentTask) return null;

    return (
      <Tooltip title={`Under: ${parentTask.title}`}>
        <button
          type="button"
          data-cy={`mock-plan-parent-link-${task.id}`}
          className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-[#F3F4F6] text-[#6366F1] hover:bg-[#EEF2FF]"
          aria-label={`View parent: ${parentTask.title}`}
          onClick={() => openSubtasksModal(parentTask)}
        >
          <LinkOutlined className="text-[12px]" />
        </button>
      </Tooltip>
    );
  };

  const renderRow = (task: MockPlanTask) => {
    const kidsAll = childrenOf(allActiveTasks, task.id).filter((c) => {
      if (durationKind === 'week') return c.kind === 'daily';
      if (durationKind === 'month') return c.kind === 'week';
      return false;
    });
    const cap = childCapForParent(task.kind, task.start, task.deadline);
    const childKind = childKindForParent(task.kind);
    const canAddAtThisLevel =
      !flatMode &&
      ((durationKind === 'week' && task.kind === 'week') ||
        (durationKind === 'month' && task.kind === 'month'));
    const canHaveChildren = canAddAtThisLevel && cap > 0 && !!childKind;
    const capacityLabel = canAddAtThisLevel
      ? parentCapacitySummary(task, allActiveTasks)
      : null;
    const childCount = kidsAll.length;

    const parentLink = flatMode ? renderParentLink(task) : null;
    const prefix = parentLink ?? (
      <span
        data-cy="mockplanhierarchy-spacer"
        className="mt-0.5 inline-block h-[18px] w-[18px] shrink-0 rounded bg-[#F3F4F6]"
      />
    );

    const afterTitle =
      canHaveChildren && !hideInteractiveMarkers ? (
        <div
          data-cy="planning-and-reporting-components-cards-mockplanhierarchy-tsx-mockplanhierarchy-div-178"
          className="mt-0.5 flex shrink-0 items-center gap-1"
        >
          <button
            type="button"
            data-cy={`mock-plan-subtask-count-${task.id}`}
            className="inline-flex items-center rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#4338CA] hover:bg-[#E0E7FF]"
            onClick={(e) => {
              e.stopPropagation();
              openSubtasksModal(task);
            }}
            title={
              childCount > 0
                ? `View ${childCount} ${kindLabel(task.kind)}`
                : `Manage ${kindLabel(task.kind)} subtasks`
            }
          >
            {childCount > 0
              ? `${childCount} ${kindLabel(task.kind)}`
              : `0 ${kindLabel(task.kind)}`}
          </button>
        </div>
      ) : null;

    return (
      <div key={task.id} data-cy={`mock-plan-node-${task.id}`}>
        <div data-cy="mockplanhierarchy-row" className="relative">
          {renderTaskRow(toRowTask(task), {
            depth: 0,
            prefix,
            afterTitle,
            hideCheckbox: hideInteractiveMarkers,
            onOpen: canHaveChildren ? () => openSubtasksModal(task) : undefined,
          })}
          {capacityLabel ? (
            <div
              data-cy="mockplanhierarchy-capacity"
              className="flex flex-wrap items-center gap-2 px-2.5 pb-1 pl-[66px]"
            >
              <span
                data-cy={`mock-plan-capacity-${task.id}`}
                className="text-[11px] font-medium text-[#8F94A3]"
              >
                {capacityLabel}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  if (listTasks.length === 0) return null;

  return (
    <>
      <div className="space-y-[2px]" data-cy="mock-plan-hierarchy">
        {listTasks.map((t) => renderRow(t))}
      </div>
      <SubtasksModal
        open={!!modalParent}
        parent={modalParent}
        ownerUserId={ownerUserId}
        allActiveTasks={allActiveTasks}
        canAdd={canAddSubtasks && !isTeammatePlan && !hideInteractiveMarkers}
        onClose={() => setModalParent(null)}
      />
    </>
  );
}
