import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PayrollView } from './view';

interface UserState {
  currentPage: number;
  setCurrentPage: (page: number) => void;

  pageSize: number;
  setPageSize: (size: number) => void;

  /** List / status filter. Default = payroll-only rows. */
  payrollView: PayrollView;
  setPayrollView: (view: PayrollView) => void;
}

export const usePayrollStore = create<UserState>()(
  devtools((set) => ({
    currentPage: 1,
    setCurrentPage: (page: number) => set({ currentPage: page }),

    pageSize: 10,
    setPageSize: (size: number) => set({ pageSize: size }),

    payrollView: 'payroll',
    setPayrollView: (view: PayrollView) => set({ payrollView: view }),
  })),
);
