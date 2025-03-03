import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface UserState {
  userId: string;
  setUserId: (userId: string) => void;
}
export const useLeaveBalanceStore = create<UserState>()(
  devtools((set) => ({
    userId: '',
    setUserId: (userId: string) => set({ userId }),
  })),
);
