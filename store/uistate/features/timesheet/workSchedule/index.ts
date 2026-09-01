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
  selectedSwapTargetShiftId: string | null;
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
  openSwapModal: (
    requesterShiftId?: string | null,
    targetShiftId?: string | null,
  ) => void;
  setSelectedSwapRequesterShiftId: (id: string | null) => void;
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
  selectedSwapTargetShiftId: null,
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
  openSwapModal: (requesterShiftId = null, targetShiftId = null) =>
    set({
      isSwapModalOpen: true,
      selectedSwapRequesterShiftId: requesterShiftId,
      selectedSwapTargetShiftId: targetShiftId,
    }),
  setSelectedSwapRequesterShiftId: (selectedSwapRequesterShiftId) =>
    set({ selectedSwapRequesterShiftId }),
  closeSwapModal: () =>
    set({
      isSwapModalOpen: false,
      selectedSwapRequesterShiftId: null,
      selectedSwapTargetShiftId: null,
    }),
  setDemoPersonaId: (demoPersonaId) => set({ demoPersonaId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
