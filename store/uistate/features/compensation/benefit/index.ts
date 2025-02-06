import { create } from 'zustand';

interface SearchParams {
  employeeName: string;
  selectedSession: any;
  selectedMonth: any;
}

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
  pageSize: 6,
};

interface VariablePayTypes {
  currentPage: number;
  pageSize: number;

  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  resetStore: () => void;

  openModal: boolean;
  setOpenModal: (value: boolean) => void;

  searchValue: { [key: string]: string };
  setSearchValue: (key: string, value: string) => void;

  searchParams: SearchParams;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;
}

const variablePayInitialState = {
  currentPage: 1,
  pageSize: 6,
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

  openModal: false,
  setOpenModal: (openModal) => set({ openModal }),

  searchValue: {},
  setSearchValue: (key, value) =>
    set((state) => ({
      searchValue: { ...state.searchValue, [key]: value },
    })),

  searchParams: {
    employeeName: '',
    selectedSession: [],
    selectedMonth: [],
  },
  setSearchParams: (key, value) => {
    const stringValue = typeof value === 'boolean' ? String(value) : value;
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: stringValue },
    }));
  },
}));
