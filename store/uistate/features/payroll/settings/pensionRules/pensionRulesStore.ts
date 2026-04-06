import create from 'zustand';

interface DrawerStore {
  isDrawerVisible: boolean;
  isPensionAddDisabled: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setPensionAddDisabled: (disabled: boolean) => void;
}

const useDrawerStore = create<DrawerStore>((set) => ({
  isDrawerVisible: false,
  isPensionAddDisabled: false,
  openDrawer: () => {
    set({ isDrawerVisible: true });
  },
  closeDrawer: () => set({ isDrawerVisible: false }),
  setPensionAddDisabled: (disabled: boolean) =>
    set({ isPensionAddDisabled: disabled }),
}));

export default useDrawerStore;
