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


  isModalVisible:boolean;
  setIsModalVisible:(isModalVisible:boolean)=>void;

  planningPeriodName:string;
  setPlanningPeriodName:(planningPeriodName:string)=>void;

  editingPeriod:any;
  setEditingPeriod:(editingPeriod:any)=>void;


  page: number;
  setPage: (page: number) => void;
  userId: string | null;
  setUserId: (userId: string | null) => void;
}

export const useOKRSettingStore = create<OKRSettingStore>()(
  devtools((set) => ({
    selectedPlanningUser: null,
    setSelectedPlanningUser: (selectedPlanningUser: PlanningUser | null) =>
      set({ selectedPlanningUser }),
    pagePlanningPeriod: 1, // Initializing pagePlanningPeriod
    setPagePlanningPeriod: (pagePlanningPeriod: number) =>
      set({ pagePlanningPeriod }), // Setting correct naming
    pageSize: 10,
    setPageSize: (pageSize: number) => set({ pageSize }),


    isModalVisible:false,
    setIsModalVisible:(isModalVisible:boolean)=>set({isModalVisible}),

  
    planningPeriodName:'',
    setPlanningPeriodName:(planningPeriodName:string)=>set({planningPeriodName}),
  
    editingPeriod:null,
    setEditingPeriod:(editingPeriod:any)=>set({editingPeriod}),
  
    page: 1,
    setPage: (page: number) => set({ page }),
    userId: null,
    setUserId: (userId: string | null) => set({ userId }),
  })),
);
