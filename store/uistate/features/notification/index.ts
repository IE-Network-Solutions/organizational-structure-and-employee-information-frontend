import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NotificationState {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notificationCount: 0,
    setNotificationCount: (count: number) => set({ notificationCount: count }),
  })),
);
