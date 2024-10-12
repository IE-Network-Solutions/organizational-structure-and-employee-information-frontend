import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PlanningUser } from './interface';

interface OKRSettingStore {
  selectedPlanningUser: PlanningUser | null;
  setSelectedPlanningUser: (selectedPlanningUser: PlanningUser | null) => void;
  pagePlanningPeriod: number; // Updated naming
  setPagePlanningPeriod: (pagePlanningPeriod: number) => void; // Updated naming
  pageSize: number;
  setPageSize: (pageSize: number) => void;

  page:number,
  setPage:(page:number)=>void,
}

export const useOKRSettingStore = create<OKRSettingStore>()(
  devtools((set) => ({
    selectedPlanningUser: null,
    setSelectedPlanningUser: (selectedPlanningUser: PlanningUser | null) => set({ selectedPlanningUser }),
    pagePlanningPeriod: 1, // Initializing pagePlanningPeriod
    setPagePlanningPeriod: (pagePlanningPeriod: number) => set({ pagePlanningPeriod }), // Setting correct naming
    pageSize: 2,
    setPageSize: (pageSize: number) => set({ pageSize }),

    page: 1,
    setPage: (page: number) => set({ page }),
  }))
);