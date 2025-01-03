import { create } from 'zustand';

export interface AllowanceEntitlementTypes {
  isAllowanceEntitlementSidebarOpen: boolean;
  departmentUsers: any[];
  selectedDepartment: string | null;
  isAllowanceGlobal: boolean;
  currentPage: number;
  pageSize: number;

  setIsAllowanceEntitlementSidebarOpen: (value: boolean) => void;
  resetStore: () => void;
  setDepartmentUsers: (value: any[]) => void;
  setSelectedDepartment: (value: string | null) => void;
  setIsAllowanceGlobal: (value: boolean) => void;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
}

const initialState = {
  isAllowanceEntitlementSidebarOpen: false,
  departmentUsers: [],
  selectedDepartment: null,
  isAllowanceGlobal: false,
  currentPage: 1,
  pageSize: 10,
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
  pageSize: 10,
};

export const useAllAllowanceStore = create<AllAllowanceTypes>((set) => ({
  ...allAllowanceTypesInitialState,

  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),

  resetStore: () => set(allAllowanceTypesInitialState),
}));
