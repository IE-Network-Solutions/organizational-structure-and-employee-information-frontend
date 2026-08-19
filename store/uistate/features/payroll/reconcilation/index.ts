import { create } from 'zustand';

const pairKey = (previousPayPeriodId: string, currentPayPeriodId: string) =>
  `${previousPayPeriodId}::${currentPayPeriodId}`;

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
  reconciledKeys: Record<string, boolean>;
  markReconciled: (
    previousPayPeriodId: string,
    currentPayPeriodId: string,
  ) => void;
  isPairReconciled: (
    previousPayPeriodId: string,
    currentPayPeriodId: string,
  ) => boolean;
}

export const useReconciliationState = create<ReconciliationState>(
  (set, get) => ({
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
    reconciledKeys: {},
    markReconciled: (previousPayPeriodId, currentPayPeriodId) => {
      if (!previousPayPeriodId || !currentPayPeriodId) return;
      set({
        reconciledKeys: {
          ...get().reconciledKeys,
          [pairKey(previousPayPeriodId, currentPayPeriodId)]: true,
        },
      });
    },
    isPairReconciled: (previousPayPeriodId, currentPayPeriodId) =>
      Boolean(
        previousPayPeriodId &&
          currentPayPeriodId &&
          get().reconciledKeys[pairKey(previousPayPeriodId, currentPayPeriodId)],
      ),
  }),
);
