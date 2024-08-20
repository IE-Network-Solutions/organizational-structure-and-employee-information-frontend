import { create } from 'zustand';
import { DrawerState } from './interface';

export const useFiscalYearDrawerStore = create<DrawerState>((set) => ({
  isFiscalYearOpen: false,
  workingHour: '40',
  isEditMode: false,
  selectedFiscalYear: null,
  isDeleteMode: false,
  toggleFiscalYearDrawer: () =>
    set((state) => ({ isFiscalYearOpen: !state.isFiscalYearOpen })),
  closeFiscalYearDrawer: () => set({ isFiscalYearOpen: false }),
  openDrawer: () => set({ isFiscalYearOpen: true }),
  setWorkingHour: (hours) => set({ workingHour: hours }),
  setEditMode: (isEdit: any) => set({ isEditMode: isEdit }),
  setSelectedFiscalYear: (fiscalYear: any) =>
    set({ selectedFiscalYear: fiscalYear }),
  setDeleteMode: (isDelete) => set({ isDeleteMode: isDelete }),
}));
