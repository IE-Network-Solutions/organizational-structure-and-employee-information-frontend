import create from 'zustand';
import {
  AssignAverageOkrRuleEditContext,
  AssignAverageOkrRuleState,
} from './interface';

export const useAssignAverageOkrRuleStore = create<AssignAverageOkrRuleState>(
  (set) => ({
    open: false,
    setOpen: (value: boolean) => set({ open: value }),
    editContext: null,
    setEditContext: (value: AssignAverageOkrRuleEditContext | null) =>
      set({ editContext: value }),
  }),
);
