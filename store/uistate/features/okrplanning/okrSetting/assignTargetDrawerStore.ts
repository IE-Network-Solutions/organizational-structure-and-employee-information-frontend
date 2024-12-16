import { create } from 'zustand';

interface DrawerState {
  isDrawerVisible: boolean;
  currentId: string | null;
  selectedMonths: string[];
  openDrawer: (id?: string) => void;
  closeDrawer: () => void;
  setSelectedMonths: (months: string[]) => void;
  resetSelectedMonths: () => void;
}

const useDrawerStore = create<DrawerState>((set) => ({
  isDrawerVisible: false,
  currentId: null,
  selectedMonths: [],
  openDrawer: (id?: string) =>
    set({ isDrawerVisible: true, currentId: id ?? null }),
  closeDrawer: () => set({ isDrawerVisible: false, currentId: null }),
  setSelectedMonths: (months: string[]) => set({ selectedMonths: months }),
  resetSelectedMonths: () => set({ selectedMonths: [] }),
}));

export default useDrawerStore;
