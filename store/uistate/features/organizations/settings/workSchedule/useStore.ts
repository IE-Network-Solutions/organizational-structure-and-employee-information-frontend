import { create } from 'zustand';
import { DrawerState } from './interface';

export const useWorkScheduleDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  workingHour: '40',
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  closeDrawer: () => set({ isOpen: false }),
  openDrawer: () => set({ isOpen: true }),
  setWorkingHour: (hours) => set({ workingHour: hours }),
}));
