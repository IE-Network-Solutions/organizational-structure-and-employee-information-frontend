// import { Department } from '@/types/dashboard/organization';
import { create } from 'zustand';

export interface CompensationSettingTypes {
  isAllowanceOpen: boolean;
  isRateAllowance: boolean;
  selectedAllowanceRecord: any | null;

  isBenefitOpen: boolean;
  allEmployeeSelectedBenefit: boolean;
  isRateBenefit: boolean;
  selectedModeBenefit: string;
  benefitMode: string;
  isAllEmployee: boolean;
  selectedBenefitRecord: any | null;
  selectedDepartment: string | null;

  expandedCards: {
    [key: string]: boolean;
  };
  setExpandedCards: (expandedCards: { [key: string]: boolean }) => void;  

  selectedDepartementArray: string[];
  setSelectedDepartementArray: (selectedDepartementArray: string[]) => void;
  departmentUsers: any[];
  tableData: any[];

  setIsAllowanceOpen: (value: boolean) => void;
  setSelectedAllowanceRecord: (selectedAllowanceRecord: any | null) => void;
  setIsRateAllowance: (value: boolean) => void;

  isDeductionOpen: boolean;
  setIsDeductionOpen: (value: boolean) => void;

  selectedDeductionRecord: any;
  setSelectedDeductionRecord: (selectedDeductionRecord: any) => void;

  setIsBenefitOpen: (value: boolean) => void;
  setAllEmployeeSelectedBenefit: (value: boolean) => void;
  setIsRateBenefit: (value: boolean) => void;
  setSelectedModeBenefit: (selectedModeBenefit: string) => void;
  setSelectedBenefitRecord: (selectedBenefitRecord: any | null) => void;
  setBenefitMode: (value: any) => void;
  setSelectedDepartment: (value: any) => void;
  setDepartmentUsers: (value: any) => void;
  setTableData: (value: any) => void;

  resetStore: () => void;
  setIsAllEmployee: (value: any) => void;
}

const compensationSettingInitialState = {
  isAllowanceOpen: false,
  isRateAllowance: false,
  isDeductionOpen: false,

  selectedAllowanceRecord: null,

  isBenefitRecurring: false,
  isBenefitOpen: false,
  allEmployeeSelectedBenefit: false,
  isRateBenefit: false,
  selectedModeBenefit: '',
  benefitMode: '',
  isAllEmployee: true,
  selectedBenefitRecord: null,
  selectedDepartment: null,
  departmentUsers: [],
  tableData: [],
};

interface CompensationTypeTables {
  benefitCurrentPage: number;
  benefitPageSize: number;

  allowancePageSize: number;
  allowanceCurrentPage: number;

  setBenefitCurrentPage: (value: number) => void;
  setBenefitPageSize: (value: number) => void;

  setAllowanceCurrentPage: (value: number) => void;
  setAllowancePageSize: (value: number) => void;

  resetStore: () => void;
}

const compensationTypeTablesInitialState = {
  allowancePageSize: 10,
  allowanceCurrentPage: 1,

  benefitPageSize: 10,
  benefitCurrentPage: 1,
};

export const useCompensationSettingStore = create<CompensationSettingTypes>(
  (set) => ({
    ...compensationSettingInitialState,

    setIsAllowanceOpen: (value) => set({ isAllowanceOpen: value }),
    setIsRateAllowance: (value) => set({ isRateAllowance: value }),
    setSelectedAllowanceRecord: (value) =>
      set({ selectedAllowanceRecord: value }),

    isDeductionOpen: false,
    setIsDeductionOpen: (isDeductionOpen: boolean) => set({ isDeductionOpen }),

    selectedDeductionRecord: null,
    setSelectedDeductionRecord: (selectedDeductionRecord: any) =>
      set({ selectedDeductionRecord }),

    expandedCards: {},
    setExpandedCards: (expandedCards: { [key: string]: boolean }) =>
      set({ expandedCards }),

    selectedDepartementArray: [],
    setSelectedDepartementArray: (selectedDepartementArray: string[]) =>
      set({ selectedDepartementArray }),

    setIsBenefitOpen: (value) => set({ isBenefitOpen: value }),
    setAllEmployeeSelectedBenefit: (value) =>
      set({ allEmployeeSelectedBenefit: value }),
    setIsRateBenefit: (value) => set({ isRateBenefit: value }),
    setSelectedModeBenefit: (value) => set({ selectedModeBenefit: value }),
    setBenefitMode: (value) => set({ benefitMode: value }),
    setSelectedBenefitRecord: (value) => set({ selectedBenefitRecord: value }),
    setSelectedDepartment: (value) => set({ selectedDepartment: value }),
    setDepartmentUsers: (value) => set({ departmentUsers: value }),
    setTableData: (value) => set({ tableData: value }),

    resetStore: () => {
      set((state) => {
        const { tableData } = state;
        return {
          ...compensationSettingInitialState,
          tableData,
        };
      });
    },
    setIsAllEmployee: (value) => set({ isAllEmployee: value }),
  }),
);

export const useCompensationTypeTablesStore = create<CompensationTypeTables>(
  (set) => ({
    ...compensationTypeTablesInitialState,

    setBenefitCurrentPage: (value) => set({ benefitCurrentPage: value }),
    setBenefitPageSize: (value) => set({ benefitPageSize: value }),

    setAllowanceCurrentPage: (value) => set({ allowanceCurrentPage: value }),
    setAllowancePageSize: (value) => set({ allowancePageSize: value }),

    resetStore: () => set(compensationTypeTablesInitialState),
  }),
);
