import { create } from 'zustand';

interface BenefitEntitlementTypes {
  isBenefitEntitlementSidebarOpen: boolean;
  selectedDepartment: string | null;
  departmentUsers: any[];
  benefitMode: string;
  BenefitApplicableTo: string;
  benefitDefaultAmount: number;

  currentPage: number;
  pageSize: number;

  setIsBenefitEntitlementSidebarOpen: (value: boolean) => void;
  setSelectedDepartment: (value: string | null) => void;
  setDepartmentUsers: (value: any[]) => void;
  setBenefitMode: (value: string) => void;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setBenefitDefaultAmount: (value: number) => void;
  setBenefitApplicableTo: (value: string) => void;

  resetStore: () => void;
}

const benefitEntitlementInitialState = {
  isBenefitEntitlementSidebarOpen: false,
  selectedDepartment: null,
  departmentUsers: [],
  benefitMode: '',
  BenefitApplicableTo: '',
  benefitDefaultAmount: 0,

  currentPage: 1,
  pageSize: 10,
};

interface VariablePayTypes {
  currentPage: number;
  pageSize: number;

  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  resetStore: () => void;
}

const variablePayInitialState = {
  currentPage: 1,
  pageSize: 10,
};

export const useBenefitEntitlementStore = create<BenefitEntitlementTypes>(
  (set) => ({
    ...benefitEntitlementInitialState,

    setIsBenefitEntitlementSidebarOpen: (value) =>
      set({ isBenefitEntitlementSidebarOpen: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),
    setBenefitMode: (value) => set({ benefitMode: value }),
    setBenefitApplicableTo: (value) => set({ BenefitApplicableTo: value }),
    setBenefitDefaultAmount: (value) => set({ benefitDefaultAmount: value }),

    setCurrentPage: (value) => set({ currentPage: value }),
    setPageSize: (value) => set({ pageSize: value }),

    resetStore: () => {
      set((state) => {
        const { benefitDefaultAmount, benefitMode } = state;
        return {
          ...benefitEntitlementInitialState,
          benefitDefaultAmount,
          benefitMode,
        };
      });
    },
  }),
);

export const useVariablePayStore = create<VariablePayTypes>((set) => ({
  ...variablePayInitialState,

  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),

  resetStore: () => set(variablePayInitialState),
}));
