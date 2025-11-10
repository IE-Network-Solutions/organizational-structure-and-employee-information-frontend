import create from 'zustand';

interface DrawerStore {
  isDrawerVisible: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const useDrawerStore = create<DrawerStore>((set) => ({
  isDrawerVisible: false,
  openDrawer: () => {
    set({ isDrawerVisible: true });
  },
  closeDrawer: () => set({ isDrawerVisible: false }),
}));

export default useDrawerStore;

