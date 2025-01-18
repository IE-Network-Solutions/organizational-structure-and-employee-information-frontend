import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  userCurrentPage: number;
  setUserCurrentPage: (userCurrentPage: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  branchRequestSidebarData: string;
  setBranchRequestSidebarData: (branchRequestSidebarData: string) => void;
  isShowBranchRequestDetail: boolean;
  setIsShowBranchRequestDetail: (isShowBranchRequestDetail: boolean) => void;
}

export const useMyBranchApprovalStore = create<UserState>()(
  devtools((set) => ({
    userCurrentPage: 1,
    setUserCurrentPage: (userCurrentPage: number) => set({ userCurrentPage }),
    pageSize: 10,
    setPageSize: (pageSize: number) => set({ pageSize }),
    branchRequestSidebarData: '',
    setBranchRequestSidebarData: (branchRequestSidebarData: string) =>
      set({ branchRequestSidebarData }),
    isShowBranchRequestDetail: false,
    setIsShowBranchRequestDetail: (isShowBranchRequestDetail: boolean) =>
      set({ isShowBranchRequestDetail }),
  })),
);
