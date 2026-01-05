import { create } from 'zustand';

export const useTalentResourceStore = create<TalentResourceState>((set) => ({
  activeTab: 1,
  setActiveTab: (activeTab: number) => set({ activeTab }),
}));

export interface TalentResourceState {
  activeTab: number;
  setActiveTab: (activeTab: number) => void;
}
