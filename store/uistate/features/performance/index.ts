import { create } from 'zustand';

type PerformanceTab = 'meeting' | 'survey' | null;

interface PerformanceUIState {
  selectedTab: PerformanceTab;
  setSelectedTab: (tab: PerformanceTab) => void;
}

export const usePerformanceUIState = create<PerformanceUIState>((set) => ({
  selectedTab: null,
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));
