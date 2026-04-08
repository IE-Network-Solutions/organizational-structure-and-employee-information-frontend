import { create } from 'zustand';

interface SearchFilterState {
  isFilterModalOpen: boolean;
  openFilterModal: () => void;
  closeFilterModal: () => void;
  setFilterModalOpen: (open: boolean) => void;
}

export const useSearchFilterStore = create<SearchFilterState>((set) => ({
  isFilterModalOpen: false,
  openFilterModal: () => set({ isFilterModalOpen: true }),
  closeFilterModal: () => set({ isFilterModalOpen: false }),
  setFilterModalOpen: (isFilterModalOpen) => set({ isFilterModalOpen }),
}));
