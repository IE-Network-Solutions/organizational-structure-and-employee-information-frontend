import { create } from 'zustand';
import {
  DEMO_LOGGED_IN_EMPLOYEE_ID,
  WorkScheduleInnerView,
} from '@/types/timesheet/workSchedule';

type WorkScheduleUiState = {
  innerView: WorkScheduleInnerView;
  isBlueprintModalOpen: boolean;
  isBlueprintEditMode: boolean;
  selectedBlueprintId: string | null;
  isAssignDrawerOpen: boolean;
  isDeleteModalOpen: boolean;
  isInstanceDrawerOpen: boolean;
  selectedInstanceId: string | null;
  rosterMonth: string;
  rosterEmployeeId: string | null;
  rosterBlueprintId: string | null;
  isSwapModalOpen: boolean;
  selectedSwapRequesterShiftId: string | null;
  demoPersonaId: string;
  searchQuery: string;
};

type WorkScheduleUiActions = {
  setInnerView: (innerView: WorkScheduleInnerView) => void;
  openCreateBlueprintModal: () => void;
  openEditBlueprintModal: (id: string) => void;
  closeBlueprintModal: () => void;
  openAssignDrawer: (blueprintId: string) => void;
  closeAssignDrawer: () => void;
  openDeleteModal: (blueprintId: string) => void;
  closeDeleteModal: () => void;
  openInstanceDrawer: (instanceId: string) => void;
  closeInstanceDrawer: () => void;
  setRosterMonth: (month: string) => void;
  setRosterEmployeeId: (id: string | null) => void;
  setRosterBlueprintId: (id: string | null) => void;
  openSwapModal: (requesterShiftId: string) => void;
  closeSwapModal: () => void;
  setDemoPersonaId: (id: string) => void;
  setSearchQuery: (query: string) => void;
};

const currentMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}-01`;
};

export const useWorkScheduleUiStore = create<
  WorkScheduleUiState & WorkScheduleUiActions
>((set) => ({
  innerView: 'blueprints',
  isBlueprintModalOpen: false,
  isBlueprintEditMode: false,
  selectedBlueprintId: null,
  isAssignDrawerOpen: false,
  isDeleteModalOpen: false,
  isInstanceDrawerOpen: false,
  selectedInstanceId: null,
  rosterMonth: currentMonth(),
  rosterEmployeeId: null,
  rosterBlueprintId: null,
  isSwapModalOpen: false,
  selectedSwapRequesterShiftId: null,
  demoPersonaId: DEMO_LOGGED_IN_EMPLOYEE_ID,
  searchQuery: '',

  setInnerView: (innerView) => set({ innerView }),
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
  openInstanceDrawer: (instanceId) =>
    set({
      isInstanceDrawerOpen: true,
      selectedInstanceId: instanceId,
    }),
  closeInstanceDrawer: () =>
    set({
      isInstanceDrawerOpen: false,
      selectedInstanceId: null,
    }),
  setRosterMonth: (rosterMonth) => set({ rosterMonth }),
  setRosterEmployeeId: (rosterEmployeeId) => set({ rosterEmployeeId }),
  setRosterBlueprintId: (rosterBlueprintId) => set({ rosterBlueprintId }),
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
