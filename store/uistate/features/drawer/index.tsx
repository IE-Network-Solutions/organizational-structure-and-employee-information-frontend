import { create } from 'zustand';

interface StoreState {
  isClient: boolean;
  setIsClient: (value: boolean) => void;
  currentWidth: string;
  setCurrentWidth: (value: string) => void;
}

const useDrawerStore = create<StoreState>((set) => ({
  isClient: false,
  setIsClient: (value) => set({ isClient: value }),
  currentWidth: '60%',
  setCurrentWidth: (value) => set({ currentWidth: value }),
}));

export default useDrawerStore;
