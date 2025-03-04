import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  userCurrentPage: number;
  setUserCurrentPage: (userCurrentPage: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}

export const useCurrentLeaveApprovalStore = create<UserState>()(
  devtools((set) => ({
    userCurrentPage: 1,
    setUserCurrentPage: (userCurrentPage: number) => set({ userCurrentPage }),
    pageSize: 5,
    setPageSize: (pageSize: number) => set({ pageSize }),
    branchRequestSidebarData: '',
  })),
);
