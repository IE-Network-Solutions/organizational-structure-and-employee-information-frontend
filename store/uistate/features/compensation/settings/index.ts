import { create } from 'zustand';

export interface CompensationSettingTypes {
  isAllowanceOpen: boolean;
  isRateAllowance: boolean;
  isBenefitOpen: boolean;
  allEmployeeSelectedBenefit: boolean;
  isRateBenefit: boolean;
  selectedModeBenefit: string;
  benefitMode: string;
  isAllEmployee: boolean;
  selectedBenefitRecord: any | null;
  selectedDepartment: string | null;
  departmentUsers: any[];

  setIsAllowanceOpen: (value: boolean) => void;
  setIsRateAllowance: (value: boolean) => void;
  setIsBenefitOpen: (value: boolean) => void;
  setAllEmployeeSelectedBenefit: (value: boolean) => void;
  setIsRateBenefit: (value: boolean) => void;
  setSelectedModeBenefit: (selectedModeBenefit: string) => void;
  setSelectedBenefitRecord: (selectedBenefitRecord: any | null) => void;
  setBenefitMode: (value: any) => void;
  setIsAllEmployee: (value: any) => void;
  setSelectedDepartment: (value: any) => void;
  setDepartmentUsers: (value: any) => void;

  resetStore: () => void;
}

const compensationSettingInitialState = {
  isAllowanceOpen: false,
  isBenefitRecurring: false,
  isRateAllowance: false,
  isBenefitOpen: false,
  allEmployeeSelectedBenefit: false,
  isRateBenefit: false,
  selectedModeBenefit: '',
  benefitMode: '',
  isAllEmployee: true,
  selectedBenefitRecord: null,
  selectedDepartment: null,
  departmentUsers: [],
};

export const useCompensationSettingStore = create<CompensationSettingTypes>(
  (set) => ({
    ...compensationSettingInitialState,

    setIsAllowanceOpen: (value) => set({ isAllowanceOpen: value }),
    setIsRateAllowance: (value) => set({ isRateAllowance: value }),
    setIsBenefitOpen: (value) => set({ isBenefitOpen: value }),
    setAllEmployeeSelectedBenefit: (value) => set({ allEmployeeSelectedBenefit: value }),
    setIsRateBenefit: (value) => set({ isRateBenefit: value }),
    setSelectedModeBenefit: (value) => set({ selectedModeBenefit: value }),
    setBenefitMode: (value) => set({ benefitMode: value}),
    setIsAllEmployee: (value) => set({ isAllEmployee: value}),
    setSelectedBenefitRecord: (value) => set({ selectedBenefitRecord: value}),
    setSelectedDepartment: (value) => set({ selectedDepartment: value}),
    setDepartmentUsers: (value) => set({ departmentUsers: value}),

    resetStore: () => set(compensationSettingInitialState),
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