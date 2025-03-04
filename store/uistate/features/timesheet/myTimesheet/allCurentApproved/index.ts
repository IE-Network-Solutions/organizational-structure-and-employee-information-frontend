import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  allUserCurrentPage: number;
  setAllUserCurrentPage: (allUserCurrentPage: number) => void;
  allPageSize: number;
  setAllPageSize: (allPageSize: number) => void;
}

export const useAllCurrentLeaveApprovedStore = create<UserState>()(
  devtools((set) => ({
    allUserCurrentPage: 1,
    setAllUserCurrentPage: (allUserCurrentPage: number) =>
      set({ allUserCurrentPage }),
    allPageSize: 1000,
    setAllPageSize: (allPageSize: number) => set({ allPageSize }),
    branchRequestSidebarData: '',
  })),
);
