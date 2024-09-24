import { create } from 'zustand';

interface JobState {
  addNewDrawer: boolean;
  setAddNewDrawer: (value: boolean) => void;
}

export const useJobState = create<JobState>((set) => ({
  addNewDrawer: false,
  setAddNewDrawer: (value) => set({ addNewDrawer: value }),
}));
