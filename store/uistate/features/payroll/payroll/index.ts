import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  currentPage: number;
  setCurrentPage: (page: number) => void;

  pageSize: number;
  setPageSize: (size: number) => void;
}

export const usePayrollStore = create<UserState>()(
  devtools((set) => ({
    currentPage: 1,
    setCurrentPage: (page: number) => set({ currentPage: page }),

    pageSize: 10,
    setPageSize: (size: number) => set({ pageSize: size }),
  })),
);
