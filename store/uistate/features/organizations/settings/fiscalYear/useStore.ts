import { create } from 'zustand';
import { DrawerState } from './interface';

export const useDrawerStore = create<DrawerState>((set) => ({
  isFiscalYearOpen: false,
  workingHour: '40',
  toggleFiscalYearDrawer: () =>
    set((state) => ({ isFiscalYearOpen: !state.isFiscalYearOpen })),
  closeFiscalYearDrawer: () => set({ isFiscalYearOpen: false }),
  openDrawer: () => set({ isFiscalYearOpen: true }),
  setWorkingHour: (hours) => set({ workingHour: hours }),
}));
