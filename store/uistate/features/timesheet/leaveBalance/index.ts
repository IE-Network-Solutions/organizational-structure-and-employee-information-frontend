import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface UserState {
  userId: string;
  leaveTypeId: string;

  setUserId: (userId: string) => void;
  setLeaveTypeId: (userId: string) => void;

  isDownloading: boolean;
  setIsDownloading: (isDownloading: boolean) => void;
}
export const useLeaveBalanceStore = create<UserState>()(
  devtools((set) => ({
    isDownloading: false,
    setIsDownloading: (isDownloading: boolean) => set({ isDownloading }),
    userId: '',
    setUserId: (userId: string) => set({ userId }),

    leaveTypeId: '',
    setLeaveTypeId: (leaveTypeId: string) => set({ leaveTypeId }),
  })),
);
