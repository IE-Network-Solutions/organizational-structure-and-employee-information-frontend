import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface TaskDateSpan {
  start: string;
  deadline: string;
}

interface PlanTaskDatesState {
  datesByTaskId: Record<string, TaskDateSpan>;
  setTaskDates: (taskId: string, span: TaskDateSpan) => void;
  setTaskDatesBulk: (entries: Record<string, TaskDateSpan>) => void;
}

export const usePlanTaskDatesStore = create<PlanTaskDatesState>()(
  devtools((set) => ({
    datesByTaskId: {},
    setTaskDates: (taskId, span) =>
      set((state) => ({
        datesByTaskId: { ...state.datesByTaskId, [taskId]: span },
      })),
    setTaskDatesBulk: (entries) =>
      set((state) => ({
        datesByTaskId: { ...state.datesByTaskId, ...entries },
      })),
  })),
);
