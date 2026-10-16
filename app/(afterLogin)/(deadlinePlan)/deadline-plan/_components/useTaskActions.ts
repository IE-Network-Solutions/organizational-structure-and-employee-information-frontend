'use client';
import { Modal } from 'antd';
import type { MenuProps } from 'antd';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import {
  useDeleteDeadlineTask,
  useLockDeadlineTasks,
  useReportDeadlineTasks,
  useUnreportDeadlineTasks,
} from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import { resolveMetricKind, resolveTaskPermissions, TaskViewer } from './utils';

export const isTaskDone = (task: DeadlineTask) =>
  task.status === 'reported' && task.outcome === 'done';

/** The same permissions and mutations used by the original task table. */
export function useTaskActions(viewer: TaskViewer) {
  const openTaskForm = useDeadlinePlanStore((state) => state.openTaskForm);
  const setReportingTask = useDeadlinePlanStore(
    (state) => state.setReportingTask,
  );
  const { mutate: reportTasks, isLoading: isReporting } =
    useReportDeadlineTasks();
  const { mutate: unreportTasks, isLoading: isUndoing } =
    useUnreportDeadlineTasks();
  const { mutate: lockTasks, isLoading: isLocking } = useLockDeadlineTasks();
  const { mutate: deleteTask } = useDeleteDeadlineTask();

  const permissionsOf = (task: DeadlineTask, parent?: DeadlineTask) =>
    resolveTaskPermissions(parent ?? task, viewer);

  const canToggle = (task: DeadlineTask, parent?: DeadlineTask) => {
    const permissions = permissionsOf(task, parent);
    return isTaskDone(task) && !task.parentTaskId
      ? permissions.canUndoReport
      : permissions.canReport;
  };

  const toggleDone = (
    task: DeadlineTask,
    onReport?: () => void,
    parent?: DeadlineTask,
  ) => {
    if (!canToggle(task, parent) || isReporting || isUndoing) return;
    if (isTaskDone(task)) {
      unreportTasks([task.id]);
    } else if (
      !task.parentTaskId &&
      resolveMetricKind(task.keyResult) === 'numeric'
    ) {
      onReport?.();
      setReportingTask(task);
    } else {
      reportTasks([{ taskId: task.id, outcome: 'done' }]);
    }
  };

  const setLock = (task: DeadlineTask, isLocked: boolean) => {
    const permissions = permissionsOf(task);
    if (isLocking || !(isLocked ? permissions.canLock : permissions.canUnlock))
      return;
    lockTasks({ taskIds: [task.id], isLocked });
  };

  const undoReport = (task: DeadlineTask) => {
    if (!permissionsOf(task).canUndoReport || isUndoing) return;
    unreportTasks([task.id]);
  };

  const menuItemsOf = (
    task: DeadlineTask,
    parent?: DeadlineTask,
    onLeave?: () => void,
  ): MenuProps['items'] => {
    const permissions = permissionsOf(task, parent);
    const confirmDelete = () =>
      Modal.confirm({
        title: task.parentTaskId ? 'Delete this subtask?' : 'Delete this task?',
        content: task.subTasks?.length
          ? 'Its subtasks will be deleted as well.'
          : undefined,
        okText: 'Delete',
        okButtonProps: { danger: true },
        onOk: () => deleteTask(task.id),
      });

    if (task.parentTaskId) {
      return permissions.canEdit
        ? [
            {
              key: 'delete',
              label: 'Delete subtask',
              danger: true,
              onClick: confirmDelete,
            },
          ]
        : [];
    }

    const items: NonNullable<MenuProps['items']> = [];
    if (permissions.canEdit) {
      items.push({
        key: 'edit',
        label: 'Edit',
        onClick: () => {
          onLeave?.();
          openTaskForm({ task });
        },
      });
    }
    if (permissions.canReport) {
      items.push({
        key: 'report',
        label: 'Report…',
        onClick: () => {
          onLeave?.();
          setReportingTask(task);
        },
      });
    }
    if (permissions.canUndoReport) {
      items.push({
        key: 'undo',
        label: task.approvalStatus === 'closed' ? 'Reopen' : 'Undo report',
        onClick: () => undoReport(task),
      });
    }
    if (permissions.canEdit) {
      items.push(
        { type: 'divider' },
        {
          key: 'delete',
          label: 'Delete',
          danger: true,
          onClick: confirmDelete,
        },
      );
    }
    return items;
  };

  return {
    permissionsOf,
    canToggle,
    toggleDone,
    undoReport,
    menuItemsOf,
    setLock,
    isLocking,
    isToggling: isReporting || isUndoing,
  };
}

export type TaskActions = ReturnType<typeof useTaskActions>;
