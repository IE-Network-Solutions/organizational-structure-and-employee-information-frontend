import { create } from 'zustand';

interface MergeStoreState {
  mergeData: any | null; // Define the type of mergeData if available
  setMergeData: (data: any) => void;
}

export const useMergeStore = create<MergeStoreState>((set) => ({
  mergeData: null,
  setMergeData: (data) => set({ mergeData: data }),
}));
