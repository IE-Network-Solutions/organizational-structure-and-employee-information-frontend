import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NotificationState {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

interface NotificationDetailState {
  isNotificationDetailVisible: boolean;
  selectedNotificationId: string | null;
  setIsNotificationDetailVisible: (visible: boolean) => void;
  setSelectedNotificationId: (id: string | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notificationCount: 0,
    setNotificationCount: (count: number) => set({ notificationCount: count }),
  })),
);

export const useNotificationDetailStore = create<NotificationDetailState>()(
  devtools((set) => ({
    isNotificationDetailVisible: false,
    selectedNotificationId: null,
    setIsNotificationDetailVisible: (visible: boolean) =>
      set({ isNotificationDetailVisible: visible }),
    setSelectedNotificationId: (id: string | null) =>
      set({ selectedNotificationId: id }),
  })),
);