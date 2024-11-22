import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  userCurrentPage: number;
  setUserCurrentPage: (userCurrentPage: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  rejectComment: string;
  setRejectComment: (rejectComment: string) => void;
}

export const useBranchApprovalStore = create<UserState>()(
  devtools((set) => ({
    userCurrentPage: 1,
    setUserCurrentPage: (userCurrentPage: number) => set({ userCurrentPage }),
    pageSize: 10,
    setPageSize: (pageSize: number) => set({ pageSize }),
    rejectComment: '',
    setRejectComment: (value: string) => set({ rejectComment: value }),
  })),
);
