import { create } from 'zustand';

interface DrawerState {
  isDrawerVisible: boolean;
  currentId: string | null; // currentId can be a string or null
  openDrawer: (id?: string) => void; // id is optional and can be a string or undefined
  closeDrawer: () => void;
}

const useDrawerStore = create<DrawerState>((set) => ({
  isDrawerVisible: false,
  currentId: null, // Initially no id is selected
  openDrawer: (id?: string) =>
    set({ isDrawerVisible: true, currentId: id ?? null }), // If id is undefined, set it as null
  closeDrawer: () => set({ isDrawerVisible: false, currentId: null }), // Reset id when closing the drawer
}));

export default useDrawerStore;
