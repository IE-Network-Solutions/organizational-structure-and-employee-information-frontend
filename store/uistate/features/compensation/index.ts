import { create } from 'zustand';

export interface AllowanceEntitlementTypes {
    isAllowanceEntitlementSidebarOpen: boolean;
    departmentUsers: any[];
    selectedDepartment: string | null;
    isAllowanceGlobal: boolean;

    setIsAllowanceEntitlementSidebarOpen: (value: boolean) => void;
    resetStore: () => void;
    setDepartmentUsers: (value: any[]) => void;
    setSelectedDepartment: (value: string | null) => void;
    setIsAllowanceGlobal: (value: boolean) => void;
}

const initialState = {
    isAllowanceEntitlementSidebarOpen: false,
    departmentUsers: [],
    selectedDepartment: null,
    isAllowanceGlobal: false,
};

export const useAllowanceEntitlementStore = create<AllowanceEntitlementTypes>(
  (set) => ({
    ...initialState,

    setIsAllowanceEntitlementSidebarOpen: (value) => set({ isAllowanceEntitlementSidebarOpen: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),
    setIsAllowanceGlobal: (value) => set({ isAllowanceGlobal: value }),

    resetStore: () => set(initialState),
  })
);