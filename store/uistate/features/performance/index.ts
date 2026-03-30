import { create } from 'zustand';

type PerformanceTab = 'meeting' | 'survey';

interface PerformanceUIState {
  selectedTab: PerformanceTab;
  setSelectedTab: (tab: PerformanceTab) => void;
}

export const usePerformanceUIState = create<PerformanceUIState>((set) => ({
  selectedTab: 'meeting',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));