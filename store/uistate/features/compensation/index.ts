import { create } from 'zustand';

export interface AllowanceEntitlementTypes {
    isAllowanceEntitlementSidebarOpen: boolean;
    departmentUsers: any[];
    selectedDepartment: string | null;

    setIsAllowanceEntitlementSidebarOpen: (value: boolean) => void;
    resetStore: () => void;
    setDepartmentUsers: (value: any[]) => void;
    setSelectedDepartment: (value: string | null) => void;
}

const initialState = {
    isAllowanceEntitlementSidebarOpen: false,
    departmentUsers: [],
    selectedDepartment: null,
};

export const useAllowanceEntitlementStore = create<AllowanceEntitlementTypes>(
  (set) => ({
    ...initialState,

    setIsAllowanceEntitlementSidebarOpen: (value) => set({ isAllowanceEntitlementSidebarOpen: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),

    resetStore: () => set(initialState),
  })
);