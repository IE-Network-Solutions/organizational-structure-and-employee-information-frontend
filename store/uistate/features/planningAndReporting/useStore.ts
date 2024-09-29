// useStore.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PlanningAndReporting {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: number;
  setActiveTab: (activeTab: number) => void;

  activePlanPeriod: number;
  setActivePlanPeriod: (activePlanPeriod: number) => void;

  selectedUser: string[];
  setSelectedUser: (selectedUser: string[]) => void;
}
export const PlanningAndReportingStore = create<PlanningAndReporting>()(
  devtools((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),

    activeTab: 1,
    setActiveTab: (activeTab: number) => set({ activeTab }),

    activePlanPeriod: 1,
    setActivePlanPeriod: (activePlanPeriod: number) =>
      set({ activePlanPeriod }),

    selectedUser: [''],
    setSelectedUser: (selectedUser: string[]) => set({ selectedUser }),
  })),
);
