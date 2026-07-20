import create from 'zustand';
import { PlanningAssignation, PlanningAssignationState } from './interface';

export const usePlanningAssignationStore = create<PlanningAssignationState>(
  (set) => ({
    open: false,
    openDeleteModal: false,
    deletedId: '',
    setOpen: (value: boolean) => set({ open: value }),
    setOpenDeleteModal: (value: boolean) => set({ openDeleteModal: value }),
    setDeletedId: (value: string) => set({ deletedId: value }),
    planningAssignation: null,
    setPlanningAssignation: (value: PlanningAssignation | null) =>
      set({ planningAssignation: value }),
    searchTerm: '',
    debouncedSearch: '',
    setSearchTerm: (searchTerm: string) => set({ searchTerm }),
    setDebouncedSearch: (debouncedSearch: string) => set({ debouncedSearch }),
    resetPlanningAssignationSearch: () =>
      set({ searchTerm: '', debouncedSearch: '' }),
  }),
);
