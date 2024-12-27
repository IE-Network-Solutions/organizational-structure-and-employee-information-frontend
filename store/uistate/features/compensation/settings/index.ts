import { create } from 'zustand';

export interface CompensationSettingTypes {
  isAllowanceOpen: boolean;
  isAllowanceRecurring: boolean;
  isBenefitRecurring: boolean;
  isRateAllowance: boolean;
  isBenefitOpen: boolean;
  allEmployeeSelectedBenefit: boolean;
  isRateBenefit: boolean;
  selectedModeBenefit: string;
  benefitMode: string;
  isAllEmployee: boolean;

  setIsAllowanceOpen: (value: boolean) => void;
  setIsAllowanceRecurring: (value: boolean) => void;
  setIsBenefitRecurring: (value: boolean) => void;
  setIsRateAllowance: (value: boolean) => void;
  setIsBenefitOpen: (value: boolean) => void;
  setAllEmployeeSelectedBenefit: (value: boolean) => void;
  setIsRateBenefit: (value: boolean) => void;
  setSelectedModeBenefit: (selectedModeBenefit: string) => void;

  resetStore: () => void; // Reset function
  setBenefitMode: (value: any) => void;
  setIsAllEmployee: (value: any) => void;
}

const initialState = {
  isAllowanceOpen: false,
  isAllowanceRecurring: false,
  isBenefitRecurring: false,
  isRateAllowance: false,
  isBenefitOpen: false,
  allEmployeeSelectedBenefit: false,
  isRateBenefit: false,
  selectedModeBenefit: '',
  benefitMode: '',
  isAllEmployee: true,
};

export const useCompensationSettingStore = create<CompensationSettingTypes>(
  (set) => ({
    ...initialState,

    setIsAllowanceOpen: (value) => set({ isAllowanceOpen: value }),
    setIsAllowanceRecurring: (value) => set({ isAllowanceRecurring: value }),
    setIsBenefitRecurring: (value) => set({ isBenefitRecurring: value }),
    setIsRateAllowance: (value) => set({ isRateAllowance: value }),
    setIsBenefitOpen: (value) => set({ isBenefitOpen: value }),
    setAllEmployeeSelectedBenefit: (value) => set({ allEmployeeSelectedBenefit: value }),
    setIsRateBenefit: (value) => set({ isRateBenefit: value }),
    setSelectedModeBenefit: (value) => set({ selectedModeBenefit: value }),
    resetStore: () => set(initialState),
    setBenefitMode: (value) => set({ benefitMode: value}),
    setIsAllEmployee: (value) => set({ isAllEmployee: value}),
  })
);

interface CompensationTypeTables {
  benefitCurrentPage: number;
  allowancePageSize: number;
  allowanceCurrentPage: number;
  benefitPageSize: number;

  setBenefitCurrentPage: (value: number) => void;
  setAllowanceCurrentPage: (value: number) => void;
  setBenefitPageSize: (value: number) => void;
  setAllowancePageSize: (value: number) => void;

  resetStore: () => void;
}

const compensationTypeTablesInitialState = {
  benefitCurrentPage: 1,
  allowancePageSize: 10,
  allowanceCurrentPage: 1,
  benefitPageSize: 10,
};

export const useCompensationTypeTablesStore = create<CompensationTypeTables>(
  (set) => ({
    ...compensationTypeTablesInitialState,

    setBenefitCurrentPage: (value) => set({ benefitCurrentPage: value }),
    setAllowanceCurrentPage: (value) => set({ allowanceCurrentPage: value }),

    setAllowancePageSize: (value) => set({ allowancePageSize: value }),
    setBenefitPageSize: (value) => set({ benefitPageSize: value }),

    resetStore: () => set(compensationTypeTablesInitialState),
  })
);