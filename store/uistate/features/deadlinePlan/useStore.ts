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
  /** Null follows the live Me & direct reports scope; an array is a custom selection. */
  assigneeIds: string[] | null;
  isKeyResultPanelOpen: boolean;

  isTaskFormOpen: boolean;
  editingTask: DeadlineTask | null;
  /** Pre-selects the key result when adding a task from the KR panel. */
  taskFormKeyResult: { id: string; ownerId: string } | null;
  /** Pre-selects a person when adding a task from their grouped plan. */
  taskFormAssigneeId: string | null;
  reportingTask: DeadlineTask | null;
  approvalRequest: { taskIds: string[]; title: string } | null;

  setViewMode: (viewMode: DeadlineViewMode) => void;
  setDuration: (duration: DeadlineDuration) => void;
  setHistoryRange: (range: [string, string] | null) => void;
  setDepartment: (department: string) => void;
  setStatus: (status: DeadlineTaskStatusFilter) => void;
  setAssigneeIds: (assigneeIds: string[] | null) => void;
  applyFilters: (
    filters: Pick<
      DeadlinePlanState,
      'duration' | 'historyRange' | 'department' | 'status' | 'assigneeIds'
    >,
  ) => void;
  setKeyResultPanelOpen: (open: boolean) => void;
  openTaskForm: (options?: {
    task?: DeadlineTask;
    keyResult?: { id: string; ownerId: string };
    assigneeId?: string;
  }) => void;
  closeTaskForm: () => void;
  setReportingTask: (task: DeadlineTask | null) => void;
  setApprovalRequest: (request: DeadlinePlanState['approvalRequest']) => void;
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
  approvalRequest: null,

  setViewMode: (viewMode) => set({ viewMode }),
  setDuration: (duration) => set({ duration }),
  setHistoryRange: (historyRange) => set({ historyRange }),
  setDepartment: (department) => set({ department }),
  setStatus: (status) => set({ status }),
  setAssigneeIds: (assigneeIds) => set({ assigneeIds }),
  applyFilters: (filters) => set(filters),
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
  setApprovalRequest: (approvalRequest) => set({ approvalRequest }),
}));
