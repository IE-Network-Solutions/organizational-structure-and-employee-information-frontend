import { create } from 'zustand';
import { DEMO_LOGGED_IN_EMPLOYEE_ID } from '@/types/timesheet/workSchedule';

type WorkScheduleUiState = {
  isBlueprintModalOpen: boolean;
  isBlueprintEditMode: boolean;
  selectedBlueprintId: string | null;
  isAssignDrawerOpen: boolean;
  isDeleteModalOpen: boolean;
  isSwapModalOpen: boolean;
  selectedSwapRequesterShiftId: string | null;
  demoPersonaId: string;
  searchQuery: string;
};

type WorkScheduleUiActions = {
  openCreateBlueprintModal: () => void;
  openEditBlueprintModal: (id: string) => void;
  closeBlueprintModal: () => void;
  openAssignDrawer: (blueprintId: string) => void;
  closeAssignDrawer: () => void;
  openDeleteModal: (blueprintId: string) => void;
  closeDeleteModal: () => void;
  openSwapModal: (requesterShiftId: string) => void;
  closeSwapModal: () => void;
  setDemoPersonaId: (id: string) => void;
  setSearchQuery: (query: string) => void;
};

export const useWorkScheduleUiStore = create<
  WorkScheduleUiState & WorkScheduleUiActions
>((set) => ({
  isBlueprintModalOpen: false,
  isBlueprintEditMode: false,
  selectedBlueprintId: null,
  isAssignDrawerOpen: false,
  isDeleteModalOpen: false,
  isSwapModalOpen: false,
  selectedSwapRequesterShiftId: null,
  demoPersonaId: DEMO_LOGGED_IN_EMPLOYEE_ID,
  searchQuery: '',

  openCreateBlueprintModal: () =>
    set({
      isBlueprintModalOpen: true,
      isBlueprintEditMode: false,
      selectedBlueprintId: null,
    }),
  openEditBlueprintModal: (id) =>
    set({
      isBlueprintModalOpen: true,
      isBlueprintEditMode: true,
      selectedBlueprintId: id,
    }),
  closeBlueprintModal: () =>
    set({
      isBlueprintModalOpen: false,
      isBlueprintEditMode: false,
      selectedBlueprintId: null,
    }),
  openAssignDrawer: (blueprintId) =>
    set({
      isAssignDrawerOpen: true,
      selectedBlueprintId: blueprintId,
    }),
  closeAssignDrawer: () =>
    set({
      isAssignDrawerOpen: false,
    }),
  openDeleteModal: (blueprintId) =>
    set({
      isDeleteModalOpen: true,
      selectedBlueprintId: blueprintId,
    }),
  closeDeleteModal: () =>
    set({
      isDeleteModalOpen: false,
    }),
  openSwapModal: (requesterShiftId) =>
    set({
      isSwapModalOpen: true,
      selectedSwapRequesterShiftId: requesterShiftId,
    }),
  closeSwapModal: () =>
    set({
      isSwapModalOpen: false,
      selectedSwapRequesterShiftId: null,
    }),
  setDemoPersonaId: (demoPersonaId) => set({ demoPersonaId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
