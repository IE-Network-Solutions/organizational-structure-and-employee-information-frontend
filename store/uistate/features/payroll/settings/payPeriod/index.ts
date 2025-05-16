import create from 'zustand';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';


interface PayPeriodType {
  isPayPeriodSidebarVisible: boolean;
  payPeriodMode: string;
  divisions: any[];
  payPeriodError: string;
  currentPage: number;
  pageSize: number;

  selectedFiscalYear: FiscalYear | null;
  setSelectedFiscalYear: (selectedFiscalYear: FiscalYear | null) => void;

  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  setIsPayPeriodSidebarVisible: (isPayPeriodSidebarVisible: boolean) => void;
  setPayPeriodMode: (payPeriodMode: string) => void;
  setDivisions: (divisions: any[]) => void;
  setPayPeriodError: (payPeriodError: string) => void;

  resetStore: () => void;
}
const payPeriodInitialValues = {
  isPayPeriodSidebarVisible: false,
  payPeriodMode: '',
  divisions: [],
  payPeriodError: '',
  currentPage: 1,
  pageSize: 10,
};

const usePayPeriodStore = create<PayPeriodType>((set) => ({
  ...payPeriodInitialValues,

  setIsPayPeriodSidebarVisible: (value: boolean) =>
    set({ isPayPeriodSidebarVisible: value }),
  setPayPeriodMode: (value: string) => set({ payPeriodMode: value }),
  setDivisions: (value: any[]) => set({ divisions: value }),
  setPayPeriodError: (value: string) => set({ payPeriodError: value }),
  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),

  selectedFiscalYear: null,
  setSelectedFiscalYear: (value: FiscalYear | null) => set({ selectedFiscalYear: value }),

  resetStore: () => set(payPeriodInitialValues),
}));

export default usePayPeriodStore;
