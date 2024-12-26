import { create } from 'zustand';

export interface BenefitEntitlementTypes {
    isBenefitEntitlementSidebarOpen: boolean;
    selectedDepartment: string | null;
    departmentUsers: any[];

    setIsBenefitEntitlementSidebarOpen: (value: boolean) => void;
    setSelectedDepartment: (value: string | null) => void;
    setDepartmentUsers: (value: any[]) => void;

    resetStore: () => void;
}

const initialState = {
    isBenefitEntitlementSidebarOpen: false,
    selectedDepartment: null,
    departmentUsers: [],
};

export const useBenefitEntitlementStore = create<BenefitEntitlementTypes>(
  (set) => ({
    ...initialState,

    setIsBenefitEntitlementSidebarOpen: (value) => set({ isBenefitEntitlementSidebarOpen: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),

    resetStore: () => set(initialState),
  })
);