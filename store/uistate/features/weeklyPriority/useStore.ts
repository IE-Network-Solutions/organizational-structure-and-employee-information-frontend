// useStore.ts
import create from 'zustand';
interface WeeklyPriorityState {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

export const useWeeklyPriorityStore = create<WeeklyPriorityState>((set) => ({
  activeTab: 1,
  setActiveTab: (tab) => set({ activeTab: tab }),
}));


