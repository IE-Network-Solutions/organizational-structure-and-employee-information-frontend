import create from 'zustand';
import {
  AverageOkrRuleAssignment,
  AverageOkrRuleAssignmentState,
} from './interface';

export const useAverageOkrRuleAssignmentStore =
  create<AverageOkrRuleAssignmentState>((set) => ({
    open: false,
    openDeleteModal: false,
    deletedId: '',
    assignment: null,
    setOpen: (value: boolean) => set({ open: value }),
    setOpenDeleteModal: (value: boolean) => set({ openDeleteModal: value }),
    setDeletedId: (value: string) => set({ deletedId: value }),
    setAssignment: (value: AverageOkrRuleAssignment | null) =>
      set({ assignment: value }),
  }));
