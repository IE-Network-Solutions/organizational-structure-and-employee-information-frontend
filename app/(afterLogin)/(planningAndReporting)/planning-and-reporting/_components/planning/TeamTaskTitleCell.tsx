'use client';

import React from 'react';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import {
  canOpenSubtasksModal,
  computeMockPlanHierarchyRowMeta,
  kindLabel,
} from './mockPlanHierarchyMeta';
import type { TeamTaskRow } from './delegatedTaskUtils';

type TeamTaskTitleCellProps = {
  row: TeamTaskRow;
  mockTask: MockPlanTask | null;
  allActiveTasks: MockPlanTask[];
  durationKind: DeadlineKind;
  onOpenSubtasks: (parent: MockPlanTask) => void;
  onOpenTaskDetail?: () => void;
  /** Checked / pre-achieved on own plan — strikethrough title. */
  markedReported?: boolean;
  /** Nesting depth when rendered in a collapsible task tree. */
  treeDepth?: number;
};

export default function TeamTaskTitleCell({
  row,
  mockTask,
  allActiveTasks,
  durationKind,
  onOpenSubtasks,
  onOpenTaskDetail,
  markedReported = false,
  treeDepth = 0,
}: TeamTaskTitleCellProps) {
  const titleClass = classNames(
    'min-w-0 font-medium',
    markedReported
      ? 'line-through text-[#6b7280]'
      : 'text-gray-900 hover:text-[#1E40AF]',
  );

  const renderTitle = () => {
    if (!onOpenTaskDetail) {
      return (
        <span
          className={classNames('min-w-0 flex-1 truncate', titleClass)}
          data-cy={`team-tasks-title-${row.id}`}
        >
          {row.title}
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={onOpenTaskDetail}
        className={classNames('min-w-0 flex-1 truncate text-left', titleClass)}
        data-cy={`team-tasks-title-${row.id}`}
      >
        {row.title}
      </button>
    );
  };

  if (!mockTask) {
    return (
      <div
        className="flex min-w-0 flex-col gap-0.5"
        data-cy={`team-tasks-title-wrap-${row.id}`}
      >
        {renderTitle()}
      </div>
    );
  }

  const meta = computeMockPlanHierarchyRowMeta(
    mockTask,
    allActiveTasks,
    durationKind,
  );

  const parentLink =
    meta.flatMode && meta.parentTask ? (
      <Tooltip title={`Under: ${meta.parentTask.title}`}>
        <button
          type="button"
          data-cy={`mock-plan-parent-link-${mockTask.id}`}
          className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-[#F3F4F6] text-[#6366F1] hover:bg-[#EEF2FF]"
          aria-label={`View parent: ${meta.parentTask.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenSubtasks(meta.parentTask!);
          }}
        >
          <LinkOutlined className="text-[12px]" />
        </button>
      </Tooltip>
    ) : (
      <span
        data-cy="mockplanhierarchy-spacer"
        className="mt-0.5 inline-block h-[18px] w-[18px] shrink-0 rounded bg-[#F3F4F6]"
      />
    );

  const opensSubtasksModal = canOpenSubtasksModal(meta);

  const afterTitle = opensSubtasksModal ? (
    <button
      type="button"
      data-cy={`mock-plan-subtask-count-${mockTask.id}`}
      className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#4338CA] hover:bg-[#E0E7FF]"
      onClick={(e) => {
        e.stopPropagation();
        onOpenSubtasks(mockTask);
      }}
      title={
        meta.childCount > 0
          ? `View ${meta.childCount} ${kindLabel(mockTask.kind)}`
          : `Manage ${kindLabel(mockTask.kind)} subtasks`
      }
    >
      {meta.childCount > 0
        ? `${meta.childCount} ${kindLabel(mockTask.kind)}`
        : `0 ${kindLabel(mockTask.kind)}`}
    </button>
  ) : null;

  return (
    <div
      className="flex min-w-0 flex-col gap-0.5"
      style={treeDepth > 0 ? { paddingLeft: treeDepth * 12 } : undefined}
      data-cy={`team-tasks-title-wrap-${row.id}`}
    >
      <div
        className="flex min-w-0 items-start gap-2"
        data-cy={`team-tasks-title-row-${row.id}`}
      >
        {parentLink}
        {renderTitle()}
        {afterTitle}
      </div>
      {meta.capacityLabel ? (
        <span
          data-cy={`mock-plan-capacity-${mockTask.id}`}
          className="pl-[26px] text-[11px] font-medium text-[#8F94A3]"
        >
          {meta.capacityLabel}
        </span>
      ) : null}
    </div>
  );
}
