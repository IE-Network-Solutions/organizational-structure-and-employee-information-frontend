import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  isNotificationDetailVisible: boolean;
  setIsNotificationDetailVisible: (
    isNotificationDetailVisible: boolean,
  ) => void;
  selectedNotificationId: string | null;
  setSelectedNotificationId: (selectedNotificationId: string | null) => void;
}

interface NotificationState {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

export const useNotificationDetailStore = create<UserState>()(
  devtools((set) => ({
    isNotificationDetailVisible: false,
    setIsNotificationDetailVisible: (isNotificationDetailVisible: boolean) =>
      set({ isNotificationDetailVisible }),

    selectedNotificationId: null,
    setSelectedNotificationId: (selectedNotificationId: string | null) =>
      set({ selectedNotificationId }),
  })),
);

export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notificationCount: 0,
    setNotificationCount: (count: number) => set({ notificationCount: count }),
  })),
);
