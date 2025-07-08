import { create } from 'zustand';

interface SearchParams {
  employeeName: string;
  selectedSession: any;
  selectedMonth: any;
}

interface BenefitEntitlementTypes {
  isBenefitEntitlementSidebarOpen: boolean;
  isBenefitEntitlementSidebarUpdateOpen: boolean;
  selectedDepartment: string | null;
  departmentUsers: any[];
  benefitMode: string;
  BenefitApplicableTo: string;
  benefitDefaultAmount: number;
  benefitData: any;
  employeeBenefitData: any;
  employeeSettlementData: any;
  currentPage: number;
  pageSize: number;
  totalAmount: number;
  setTotalAmount: (value: number) => void;
  settlementPeriod: number;
  setSettlementPeriod: (value: number) => void;
  data: any[];
  setData: (value: any[]) => void;
  detailCurrentPage: number;
  setDetailCurrentPage: (value: number) => void;
  detailPageSize: number;
  setDetailPageSize: (value: number) => void;
  setEmployeeSettlementData: (value: any) => void;
  setIsBenefitEntitlementSidebarOpen: (value: boolean) => void;
  setIsBenefitEntitlementSidebarUpdateOpen: (value: boolean) => void;
  setSelectedDepartment: (value: string | null) => void;
  setDepartmentUsers: (value: any[]) => void;
  setBenefitMode: (value: string) => void;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setBenefitDefaultAmount: (value: number) => void;
  setBenefitApplicableTo: (value: string) => void;
  setEditBenefitData: (value: any) => void;
  setEmployeeBenefitData: (value: any) => void;
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

type Month = {
  id: string;
  name: string;
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

  sessionMonths: Month[];
  setSessionMonths: (months: Month[]) => void;
}

const variablePayInitialState = {
  currentPage: 1,
  pageSize: 6,
};

export const useBenefitEntitlementStore = create<BenefitEntitlementTypes>(
  (set) => ({
    ...benefitEntitlementInitialState,
    isBenefitEntitlementSidebarUpdateOpen: false,
    setIsBenefitEntitlementSidebarOpen: (value) =>
      set({ isBenefitEntitlementSidebarOpen: value }),
    employeeBenefitData: null,
    employeeSettlementData: null,
    setEmployeeSettlementData: (value) =>
      set({ employeeSettlementData: value }),
    setEmployeeBenefitData: (value) => set({ employeeBenefitData: value }),
    setIsBenefitEntitlementSidebarUpdateOpen: (value) =>
      set({ isBenefitEntitlementSidebarUpdateOpen: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),
    setBenefitMode: (value) => set({ benefitMode: value }),
    setBenefitApplicableTo: (value) => set({ BenefitApplicableTo: value }),
    setBenefitDefaultAmount: (value) => set({ benefitDefaultAmount: value }),

    setCurrentPage: (value) => set({ currentPage: value }),
    setPageSize: (value) => set({ pageSize: value }),
    benefitData: null,
    setEditBenefitData: (value) => set({ benefitData: value }),
    data: [],
    setData: (value) => set({ data: value }),
    totalAmount: 0,
    setTotalAmount: (value) => set({ totalAmount: value }),
    settlementPeriod: 0,
    setSettlementPeriod: (value) => set({ settlementPeriod: value }),
    detailCurrentPage: 1,
    setDetailCurrentPage: (value) => set({ detailCurrentPage: value }),
    detailPageSize: 5,
    setDetailPageSize: (value) => set({ detailPageSize: value }),
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
  sessionMonths: [],
  setSessionMonths: (months) => set({ sessionMonths: months }),
}));
