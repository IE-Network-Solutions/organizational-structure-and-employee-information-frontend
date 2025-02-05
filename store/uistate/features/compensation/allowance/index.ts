import { create } from 'zustand';

export interface AllowanceEntitlementTypes {
  isAllowanceEntitlementSidebarOpen: boolean;
  departmentUsers: any[];
  selectedDepartment: string | null;
  isAllowanceGlobal: boolean;
  currentPage: number;
  pageSize: number;
  isRate: boolean;

  setIsAllowanceEntitlementSidebarOpen: (value: boolean) => void;
  resetStore: () => void;
  setDepartmentUsers: (value: any[]) => void;
  setSelectedDepartment: (value: string | null) => void;
  setIsAllowanceGlobal: (value: boolean) => void;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setIsRate: (value: boolean) => void;
}

const initialState = {
  isAllowanceEntitlementSidebarOpen: false,
  departmentUsers: [],
  selectedDepartment: null,
  isAllowanceGlobal: false,
  currentPage: 1,
  pageSize: 6,
  isRate: false,
};

export const useAllowanceEntitlementStore = create<AllowanceEntitlementTypes>(
  (set) => ({
    ...initialState,

    setIsAllowanceEntitlementSidebarOpen: (value) =>
      set({ isAllowanceEntitlementSidebarOpen: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),
    setIsAllowanceGlobal: (value) => set({ isAllowanceGlobal: value }),
    setCurrentPage: (value) => set({ currentPage: value }),
    setPageSize: (value) => set({ pageSize: value }),
    setIsRate: (value) => set({ isRate: value }),

    resetStore: () => set(initialState),
  }),
);

interface AllAllowanceTypes {
  currentPage: number;
  pageSize: number;

  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  resetStore: () => void;
}

const allAllowanceTypesInitialState = {
  currentPage: 1,
  pageSize: 6,
};

export const useAllAllowanceStore = create<AllAllowanceTypes>((set) => ({
  ...allAllowanceTypesInitialState,

  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),

  resetStore: () => set(allAllowanceTypesInitialState),
}));
