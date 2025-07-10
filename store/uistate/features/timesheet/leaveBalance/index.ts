import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface UserState {
  selectedUserId: string;
  leaveTypeId: string;

  setUserId: (selectedUserId: string) => void;
  setLeaveTypeId: (selectedUserId: string) => void;

  isDownloading: boolean;
  setIsDownloading: (isDownloading: boolean) => void;
}
export const useLeaveBalanceStore = create<UserState>()(
  devtools((set) => ({
    isDownloading: false,
    setIsDownloading: (isDownloading: boolean) => set({ isDownloading }),
    selectedUserId: '',
    setUserId: (selectedUserId: string) => set({ selectedUserId }),

    leaveTypeId: '',
    setLeaveTypeId: (leaveTypeId: string) => set({ leaveTypeId }),
  })),
);
