import create from 'zustand';

interface PayPeriodType {
  isPayPeriodSidebarVisible: boolean;
  payPeriodMode: string;
  divisions: any[];
  payPeriodError: string;
  currentPage: number;
  pageSize: number;

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
}

const usePayPeriodStore = create<PayPeriodType>((set) => ({
    ...payPeriodInitialValues,

    setIsPayPeriodSidebarVisible: (value: boolean) => set({ isPayPeriodSidebarVisible: value }),
    setPayPeriodMode: (value: string) => set({ payPeriodMode: value }),
    setDivisions: (value: any[]) => set({ divisions: value }),
    setPayPeriodError: (value: string) => set({ payPeriodError: value }),
    setCurrentPage: (value) => set({ currentPage: value }),
    setPageSize: (value) => set({ pageSize: value }),

    resetStore: () => set(payPeriodInitialValues),
}));

export default usePayPeriodStore;
