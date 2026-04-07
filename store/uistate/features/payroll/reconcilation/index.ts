import { create } from 'zustand';

export interface ReconciliationState {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
  previousPayPeriodId: string;
  currentPayPeriodId: string;
  componentType: string;
  setPreviousPayPeriodId: (value: string) => void;
  setCurrentPayPeriodId: (value: string) => void;
  setComponentType: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}

export const useReconciliationState = create<ReconciliationState>((set) => ({
  currentPage: 1,
  pageSize: 10,
  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),
  previousPayPeriodId: '',
  currentPayPeriodId: '',
  componentType: '',
  setPreviousPayPeriodId: (value) => set({ previousPayPeriodId: value }),
  setCurrentPayPeriodId: (value) => set({ currentPayPeriodId: value }),
  setComponentType: (value) => set({ componentType: value }),
  search: '',
  setSearch: (value) => set({ search: value }),
}));
