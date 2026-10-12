import { create } from 'zustand';
import {
  DeadlineTask,
  DeadlineTaskStatusFilter,
} from '@/store/server/features/deadlinePlan/interface';

export type DeadlineViewMode = 'list' | 'grouped';
export type DeadlineDuration =
  | 'upcoming'
  | 'today'
  | 'week'
  | 'month'
  | 'history';

interface DeadlinePlanState {
  viewMode: DeadlineViewMode;
  duration: DeadlineDuration;
  /** Custom [from, to] (YYYY-MM-DD) used by the History duration. */
  historyRange: [string, string] | null;
  /** 'all' or a department id. */
  department: string;
  status: DeadlineTaskStatusFilter;
  /** Null until the default scope (me + direct reports) has been applied. */
  assigneeIds: string[] | null;
  isKeyResultPanelOpen: boolean;

  isTaskFormOpen: boolean;
  editingTask: DeadlineTask | null;
  /** Pre-selects the key result when adding a task from the KR panel. */
  taskFormKeyResult: { id: string; ownerId: string } | null;
  /** Pre-selects a person when adding a task from their grouped plan. */
  taskFormAssigneeId: string | null;
  reportingTask: DeadlineTask | null;

  setViewMode: (viewMode: DeadlineViewMode) => void;
  setDuration: (duration: DeadlineDuration) => void;
  setHistoryRange: (range: [string, string] | null) => void;
  setDepartment: (department: string) => void;
  setStatus: (status: DeadlineTaskStatusFilter) => void;
  setAssigneeIds: (assigneeIds: string[]) => void;
  setKeyResultPanelOpen: (open: boolean) => void;
  openTaskForm: (options?: {
    task?: DeadlineTask;
    keyResult?: { id: string; ownerId: string };
    assigneeId?: string;
  }) => void;
  closeTaskForm: () => void;
  setReportingTask: (task: DeadlineTask | null) => void;
}

export const useDeadlinePlanStore = create<DeadlinePlanState>((set) => ({
  viewMode: 'list',
  duration: 'upcoming',
  historyRange: null,
  department: 'all',
  status: 'active',
  assigneeIds: null,
  isKeyResultPanelOpen: true,

  isTaskFormOpen: false,
  editingTask: null,
  taskFormKeyResult: null,
  taskFormAssigneeId: null,
  reportingTask: null,

  setViewMode: (viewMode) => set({ viewMode }),
  setDuration: (duration) => set({ duration }),
  setHistoryRange: (historyRange) => set({ historyRange }),
  setDepartment: (department) => set({ department }),
  setStatus: (status) => set({ status }),
  setAssigneeIds: (assigneeIds) => set({ assigneeIds }),
  setKeyResultPanelOpen: (isKeyResultPanelOpen) =>
    set({ isKeyResultPanelOpen }),
  openTaskForm: (options) =>
    set({
      isTaskFormOpen: true,
      editingTask: options?.task ?? null,
      taskFormKeyResult: options?.keyResult ?? null,
      taskFormAssigneeId: options?.assigneeId ?? null,
    }),
  closeTaskForm: () =>
    set({
      isTaskFormOpen: false,
      editingTask: null,
      taskFormKeyResult: null,
      taskFormAssigneeId: null,
    }),
  setReportingTask: (reportingTask) => set({ reportingTask }),
}));
