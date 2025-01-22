import { create, StateCreator } from 'zustand';

export interface AllIncentiveData {
  recognition: string;
  employee_name: string;
  role: string;
  criteria: string;
  bonus: string;
  status: string;
}

export interface ProjectIncentiveData {
  recognition: string;
  employee_name: string;
  criteria: string;
  milestone_amount: number;
  project: string;
  earned_scheduled: number;
  at: number;
  spi: number;
}

export interface ProjectIncentiveSettingParams {
  id?: string;
  name: string;
  recognition_criteria: string;
  action?: JSX.Element;
}
export interface OtherIncentiveSettingParams {
  id?: string;
  name: string;
  recognition_criteria: string;
  action?: JSX.Element;
}

export interface RockStarOfTheWeekProps {
  title?: string;
  criteriaOptions?: string[];
  onSubmit?: (values: any) => void;
}

export interface RecordType {
  id: string;
  fiscalYear: string;
  status: string;
  categories: string[];
  totalAmount: string;
  employeeCount: number;
}
export interface Records {
  Records: RecordType[];
}

// export type Records = RecordType[];

interface SearchParams {
  employee_name: string;
  byProject: string;
  byRecognition: string;
  byYear: string;
  bySession: string;
  byMonth: string;
}

type IncentiveState = {
  searchParams: SearchParams;
  currentPage: number;
  pageSize: number;
  openProjectDrawer: boolean;
  file: any;
  activeKey: string;
  isPayrollView: boolean;
  showGenerateModal: boolean;
  projectIncentiveDrawer: boolean;
  deleteIncentiveDrawer: boolean;
  projectIncentiveId: string;
  rockStarDrawer: boolean;
  criteria: string[];
  operands: string[];
  otherIncentive: any;
  projectIncentive: any;
};

type IncentiveActions = {
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (pageSize: number) => void;
  setOpenProjectDrawer: (open: boolean) => void;
  setFile: (file: string) => void;
  setActiveKey: (key: string) => void;
  setIsPayrollView: (value: boolean) => void;
  setShowGenerateModal: (value: boolean) => void;
  setProjectIncentiveDrawer: (value: boolean) => void;
  setDeleteIncentiveDrawer: (value: boolean) => void;
  setProjectIncentiveId: (value: string) => void;
  setRockStarDrawer: (value: boolean) => void;
  addCriteria: (item: string) => void;
  addOperand: (item: string) => void;
  clearFormula: () => void;
  removeItem: (index: number) => void;
  setOtherIncentive: (item: any) => void;
  setProjectIncentive: (item: any) => void;
};

const incentiveSlice: StateCreator<IncentiveState & IncentiveActions> = (
  set,
) => ({
  searchParams: {
    employee_name: '',
    byProject: '',
    byRecognition: '',
    byYear: '',
    bySession: '',
    byMonth: '',
  },
  setSearchParams: (key, value) =>
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: value },
    })),

  currentPage: 1,
  setCurrentPage: (currentPage) => set({ currentPage }),

  pageSize: 10,
  setPageSize: (pageSize) => set({ pageSize }),

  openProjectDrawer: false,
  setOpenProjectDrawer: (openProjectDrawer) => set({ openProjectDrawer }),

  file: null,
  setFile: (file) => set({ file }),

  activeKey: '1',
  setActiveKey: (activeKey) => set({ activeKey }),

  isPayrollView: false,
  setIsPayrollView: (isPayrollView) => set({ isPayrollView }),

  showGenerateModal: false,
  setShowGenerateModal: (showGenerateModal) => set({ showGenerateModal }),

  projectIncentiveDrawer: false,
  setProjectIncentiveDrawer: (projectIncentiveDrawer) =>
    set({ projectIncentiveDrawer }),

  deleteIncentiveDrawer: false,
  setDeleteIncentiveDrawer: (deleteIncentiveDrawer) =>
    set({ deleteIncentiveDrawer }),

  projectIncentiveId: '',
  setProjectIncentiveId: (projectIncentiveId) => set({ projectIncentiveId }),

  rockStarDrawer: false,
  setRockStarDrawer: (rockStarDrawer) => set({ rockStarDrawer }),

  criteria: [],
  operands: [],
  addCriteria: (item) =>
    set((state) => ({
      criteria: [...state.criteria, item],
    })),
  addOperand: (item) =>
    set((state) => ({
      operands: [...state.operands, item],
    })),
  clearFormula: () =>
    set(() => ({
      criteria: [],
      operands: [],
    })),
  removeItem: (index) =>
    set((state) => {
      const updatedItems = [...state.criteria, ...state.operands];
      updatedItems.splice(index, 1);
      return {
        criteria: updatedItems.filter((item) => state.criteria.includes(item)),
        operands: updatedItems.filter((item) => state.operands.includes(item)),
      };
    }),

  otherIncentive: null,
  setOtherIncentive: (otherIncentive) => set({ otherIncentive }),

  projectIncentive: null,
  setProjectIncentive: (projectIncentive) => set({ projectIncentive }),
});

export const useIncentiveStore = create<IncentiveState & IncentiveActions>(
  incentiveSlice,
);
