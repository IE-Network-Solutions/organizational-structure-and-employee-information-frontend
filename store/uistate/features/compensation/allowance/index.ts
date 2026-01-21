import { create } from 'zustand';

export interface PayPeriodScheduleRow {
  amount: number;
  payPeriodId: string;
}

export interface AllowanceEntitlementTypes {
  isAllowanceEntitlementSidebarOpen: boolean;
  isDeductionEntitlementSidebarEditOpen: boolean;
  editDeductionData: any;
  departmentUsers: any[];
  selectedDepartment: string | null;
  isAllowanceGlobal: boolean;
  currentPage: number;
  pageSize: number;
  isRate: boolean;

  // Rate-based deduction states
  deductionPayPeriodSchedule: PayPeriodScheduleRow[];
  selectedEmployeeForDeduction: string | null;
  selectedEmployeeBasicSalary: number;
  deductionTotalAmount: number;
  deductionRate: number;

  // Edit sidebar states
  editTotalAmount: number;
  editSettlementPeriod: number;
  editPaymentsData: any[];

  setIsAllowanceEntitlementSidebarOpen: (value: boolean) => void;
  setIsDeductionEntitlementSidebarEditOpen: (value: boolean) => void;
  setEditDeductionData: (value: any) => void;
  resetStore: () => void;
  setDepartmentUsers: (value: any[]) => void;
  setSelectedDepartment: (value: string | null) => void;
  setIsAllowanceGlobal: (value: boolean) => void;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setIsRate: (value: boolean) => void;

  // Rate-based deduction actions
  setDeductionPayPeriodSchedule: (value: PayPeriodScheduleRow[]) => void;
  setSelectedEmployeeForDeduction: (value: string | null) => void;
  setSelectedEmployeeBasicSalary: (value: number) => void;
  setDeductionTotalAmount: (value: number) => void;
  setDeductionRate: (value: number) => void;
  updatePayPeriodScheduleRow: (index: number, payPeriodId: string) => void;

  // Edit sidebar actions
  setEditTotalAmount: (value: number) => void;
  setEditSettlementPeriod: (value: number) => void;
  setEditPaymentsData: (value: any[]) => void;

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

const initialState = {
  isAllowanceEntitlementSidebarOpen: false,
  isDeductionEntitlementSidebarEditOpen: false,
  editDeductionData: null,
  departmentUsers: [],
  selectedDepartment: null,
  isAllowanceGlobal: false,
  currentPage: 1,
  pageSize: 6,
  isRate: false,
  // Rate-based deduction initial state
  deductionPayPeriodSchedule: [] as PayPeriodScheduleRow[],
  selectedEmployeeForDeduction: null,
  selectedEmployeeBasicSalary: 0,
  deductionTotalAmount: 0,
  deductionRate: 0,
  // Edit sidebar initial state
  editTotalAmount: 0,
  editSettlementPeriod: 0,
  editPaymentsData: [] as any[],
};

export const useAllowanceEntitlementStore = create<AllowanceEntitlementTypes>(
  (set) => ({
    ...initialState,

    setIsAllowanceEntitlementSidebarOpen: (value) =>
      set({ isAllowanceEntitlementSidebarOpen: value }),
    setIsDeductionEntitlementSidebarEditOpen: (value) =>
      set({ isDeductionEntitlementSidebarEditOpen: value }),
    setEditDeductionData: (value) => set({ editDeductionData: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),
    setIsAllowanceGlobal: (value) => set({ isAllowanceGlobal: value }),
    setCurrentPage: (value) => set({ currentPage: value }),
    setPageSize: (value) => set({ pageSize: value }),
    setIsRate: (value) => set({ isRate: value }),

    // Rate-based deduction actions
    setDeductionPayPeriodSchedule: (value) =>
      set({ deductionPayPeriodSchedule: value }),
    setSelectedEmployeeForDeduction: (value) =>
      set({ selectedEmployeeForDeduction: value }),
    setSelectedEmployeeBasicSalary: (value) =>
      set({ selectedEmployeeBasicSalary: value }),
    setDeductionTotalAmount: (value) => set({ deductionTotalAmount: value }),
    setDeductionRate: (value) => set({ deductionRate: value }),
    updatePayPeriodScheduleRow: (index, payPeriodId) =>
      set((state) => {
        const newSchedule = [...state.deductionPayPeriodSchedule];
        if (newSchedule[index]) {
          newSchedule[index] = { ...newSchedule[index], payPeriodId };
        }
        return { deductionPayPeriodSchedule: newSchedule };
      }),

    // Edit sidebar actions
    setEditTotalAmount: (value) => set({ editTotalAmount: value }),
    setEditSettlementPeriod: (value) => set({ editSettlementPeriod: value }),
    setEditPaymentsData: (value) => set({ editPaymentsData: value }),

    resetStore: () => set(initialState),

    searchQuery: '',
    setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  }),
);

interface AllAllowanceTypes {
  currentPage: number;
  pageSize: number;
  isMobileFilterVisible: boolean;
  setIsMobileFilterVisible: (isMobileFilterVisible: boolean) => void;

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
  isMobileFilterVisible: false,
  setIsMobileFilterVisible: (isMobileFilterVisible: boolean) =>
    set({ isMobileFilterVisible }),
}));
