import { create } from 'zustand';

export class SettlementTrackingFilter {
  compensationId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

interface SettlementTrackingType {
  isPayPeriodSidebarVisible: boolean;
  payPeriodMode: string;
  divisions: any[];
  payPeriodError: string;
  currentPage: number;
  pageSize: number;
  searchParams: SettlementTrackingFilter;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearchParams: ({ key, value }: { key: string; value: string }) => void;
  resetStore: () => void;
}

const settlementTrackingInitialValues = {
  isPayPeriodSidebarVisible: false,
  payPeriodMode: '',
  divisions: [],
  payPeriodError: '',
  currentPage: 1,
  pageSize: 10,
  searchParams: {} as SettlementTrackingFilter,
};

const useSettlementTrackingStore = create<SettlementTrackingType>((set) => ({
  ...settlementTrackingInitialValues,

  setCurrentPage: (page: number) => set({ currentPage: page }),
  setPageSize: (pageSize: number) => set({ pageSize }),
  setSearchParams: ({ key, value }: { key: string; value: string }) =>
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: value },
    })),
  resetStore: () => set(settlementTrackingInitialValues),
}));

export default useSettlementTrackingStore;
