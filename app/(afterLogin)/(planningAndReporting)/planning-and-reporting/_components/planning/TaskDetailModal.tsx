'use client';

import { useMemo } from 'react';
import { Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  useUserPlanRepositoryMock,
  type MockPlanTask,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import {
  childCapForParent,
  childKindForParent,
  resolveHierarchyParentKind,
} from '../prototype/mockPlanningConstants';
import { computeMockPlanHierarchyRowMeta } from './mockPlanHierarchyMeta';

function childKindLabel(kind: DeadlineKind | null): string {
  if (kind === 'daily') return 'daily';
  if (kind === 'week') return 'weekly';
  return 'subtask';
}

type TaskDetailModalProps = {
  open: boolean;
  task: MockPlanTask | null;
  fallbackTitle?: string;
  fallbackDescription?: string;
  ownerUserId: string;
  allActiveTasks: MockPlanTask[];
  durationKind: DeadlineKind;
  canAddSubtasks?: boolean;
  onClose: () => void;
  onOpenSubtasks?: (parent: MockPlanTask) => void;
};

function formatPriorityLabel(priority: string | undefined): string {
  const key = (priority ?? 'medium').toLowerCase();
  if (key === 'priority') return 'Urgent';
  if (key === 'high') return 'High';
  if (key === 'medium') return 'Medium';
  if (key === 'low') return 'Low';
  return priority ?? 'Medium';
}

export default function TaskDetailModal({
  open,
  task,
  fallbackTitle = '',
  fallbackDescription = '',
  ownerUserId,
  allActiveTasks,
  durationKind,
  canAddSubtasks = false,
  onClose,
  onOpenSubtasks,
}: TaskDetailModalProps) {
  const activeTasks = useUserPlanRepositoryMock((s) =>
    ownerUserId ? s.getActiveTasks(ownerUserId) : [],
  );
  const archivedTasks = useUserPlanRepositoryMock((s) =>
    ownerUserId ? (s.plansByUserId[ownerUserId]?.archivedTasks ?? []) : [],
  );

  const liveTask = useMemo(() => {
    if (!task) return null;
    return (
      activeTasks.find((t) => t.id === task.id) ??
      archivedTasks.find((t) => t.id === task.id) ??
      task
    );
  }, [activeTasks, archivedTasks, task]);

  const displayTitle = liveTask?.title ?? fallbackTitle;
  const description =
    liveTask?.description?.trim() || fallbackDescription.trim() || '';

  const meta = liveTask
    ? computeMockPlanHierarchyRowMeta(liveTask, allActiveTasks, durationKind)
    : null;

  const hierarchyKind = liveTask ? resolveHierarchyParentKind(liveTask) : null;
  const expectedChildKind = hierarchyKind
    ? childKindForParent(hierarchyKind)
    : null;
  const childCap =
    hierarchyKind && liveTask
      ? childCapForParent(hierarchyKind, liveTask.start, liveTask.deadline)
      : 0;
  const subtaskLabel = childKindLabel(expectedChildKind);
  const showAddSubtasks =
    !!liveTask &&
    !!onOpenSubtasks &&
    canAddSubtasks &&
    !!expectedChildKind &&
    childCap > 0;

  const dateRange = liveTask
    ? liveTask.kind === 'daily'
      ? liveTask.start
      : `${liveTask.start} → ${liveTask.deadline}`
    : null;

  return (
    <Modal
      title={
        <div className="pr-6" data-cy="task-detail-modal-title-wrap">
          <p
            className="m-0 text-[16px] font-semibold text-[#161A2C]"
            data-cy="task-detail-modal-title"
          >
            Task details
          </p>
          <p
            className="m-0 mt-1 truncate text-[12px] font-normal text-[#8F94A3]"
            data-cy="task-detail-modal-subtitle"
          >
            {displayTitle}
          </p>
        </div>
      }
      open={open && !!displayTitle}
      onCancel={onClose}
      destroyOnClose
      centered
      width={520}
      data-cy="task-detail-modal"
      footer={
        <div
          className="flex items-center justify-between gap-2"
          data-cy="task-detail-modal-footer"
        >
          {showAddSubtasks ? (
            <Button
              type="link"
              icon={<PlusOutlined />}
              className="!px-0 !text-[#574CFF]"
              onClick={() => {
                onOpenSubtasks?.(liveTask!);
                onClose();
              }}
              data-cy="task-detail-modal-add-subtask"
            >
              Add {subtaskLabel} subtask
              {meta && meta.childCount > 0
                ? ` (${meta.childCount} existing)`
                : ''}
            </Button>
          ) : (
            <span data-cy="task-detail-modal-footer-spacer" />
          )}
          <Button onClick={onClose} data-cy="task-detail-modal-close">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4" data-cy="task-detail-modal-body">
        <div data-cy="task-detail-modal-description-section">
          <p
            className="m-0 mb-1.5 text-[12px] font-semibold text-[#575B7A]"
            data-cy="task-detail-modal-description-label"
          >
            Description
          </p>
          {description ? (
            <p
              className="m-0 whitespace-pre-wrap rounded-lg border border-[#F1F2F6] bg-[#FAFBFC] px-3 py-2.5 text-[13px] text-[#2D2F45]"
              data-cy="task-detail-modal-description"
            >
              {description}
            </p>
          ) : (
            <p
              className="m-0 rounded-lg border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-3 py-4 text-center text-[13px] text-[#8F94A3]"
              data-cy="task-detail-modal-description-empty"
            >
              No description provided.
            </p>
          )}
        </div>

        {liveTask ? (
          <div
            className="grid grid-cols-2 gap-3 text-[12px]"
            data-cy="task-detail-modal-meta"
          >
            {dateRange ? (
              <div data-cy="task-detail-modal-dates">
                <p
                  className="m-0 mb-0.5 font-semibold text-[#575B7A]"
                  data-cy="task-detail-modal-dates-label"
                >
                  Dates
                </p>
                <p
                  className="m-0 tabular-nums text-[#2D2F45]"
                  data-cy="task-detail-modal-dates-value"
                >
                  {dateRange}
                </p>
              </div>
            ) : null}
            <div data-cy="task-detail-modal-priority">
              <p
                className="m-0 mb-0.5 font-semibold text-[#575B7A]"
                data-cy="task-detail-modal-priority-label"
              >
                Priority
              </p>
              <p
                className="m-0 text-[#2D2F45]"
                data-cy="task-detail-modal-priority-value"
              >
                {formatPriorityLabel(liveTask.priority)}
              </p>
            </div>
            {liveTask.keyResultTitle ? (
              <div
                className="col-span-2"
                data-cy="task-detail-modal-key-result"
              >
                <p
                  className="m-0 mb-0.5 font-semibold text-[#575B7A]"
                  data-cy="task-detail-modal-key-result-label"
                >
                  Key result
                </p>
                <p
                  className="m-0 text-[#2D2F45]"
                  data-cy="task-detail-modal-key-result-value"
                >
                  {liveTask.keyResultTitle}
                </p>
              </div>
            ) : null}
            {meta?.capacityLabel ? (
              <div className="col-span-2" data-cy="task-detail-modal-capacity">
                <p
                  className="m-0 mb-0.5 font-semibold text-[#575B7A]"
                  data-cy="task-detail-modal-capacity-label"
                >
                  Subtask capacity
                </p>
                <p
                  className="m-0 text-[#2D2F45]"
                  data-cy="task-detail-modal-capacity-value"
                >
                  {meta.capacityLabel}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
