import { create } from 'zustand';

interface MilestoneFormState {
  milestonesByKey: Record<string, { title?: string; weight?: number }[]>;
  setMilestones: (key: string, milestones: { title?: string; weight?: number }[]) => void;
  resetMilestoneForm: () => void;
}

export const useMilestoneFormStore = create<MilestoneFormState>((set) => ({
  milestonesByKey: {},
  setMilestones: (key, milestones) =>
    set((state) => ({
      milestonesByKey: { ...state.milestonesByKey, [key]: milestones },
    })),
  resetMilestoneForm: () => set({ milestonesByKey: {} }),
}));
