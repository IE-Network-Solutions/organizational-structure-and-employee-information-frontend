import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface UserState {
  userId: string;
  leaveTypeId: string;

  setUserId: (userId: string) => void;
  setLeaveTypeId: (userId: string) => void;
}
export const useLeaveBalanceStore = create<UserState>()(
  devtools((set) => ({
    userId: '',
    setUserId: (userId: string) => set({ userId }),

    leaveTypeId: '',
    setLeaveTypeId: (leaveTypeId: string) => set({ leaveTypeId }),
  })),
);
