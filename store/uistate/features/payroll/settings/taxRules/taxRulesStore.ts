import create from 'zustand';

interface DrawerStore {
  isDrawerVisible: boolean;
  currentTaxRule: any;
  openDrawer: (id?: string) => void;
  closeDrawer: () => void;
  setCurrentTaxRule: (taxRule: any) => void;
}

const useDrawerStore = create<DrawerStore>((set) => ({
  isDrawerVisible: false,
  currentTaxRule: null,
  openDrawer: () => {
    set({ isDrawerVisible: true });
  },
  closeDrawer: () => set({ isDrawerVisible: false, currentTaxRule: null }),
  setCurrentTaxRule: (taxRule: any) => set({ currentTaxRule: taxRule }),
}));

export default useDrawerStore;
