import { create } from 'zustand';
import { Milestone } from './interface';

interface MilestoneFormState {
  milestonesByKey: Record<string, Milestone[]>;
  setMilestones: (key: string, milestones: Milestone[]) => void;
  cardViewByKey: Record<string, boolean>;
  setCardView: (key: string, isCardView: boolean) => void;
  resetMilestoneForm: () => void;
}

export const useMilestoneFormStore = create<MilestoneFormState>((set) => ({
  milestonesByKey: {},
  setMilestones: (key, milestones) =>
    set((state) => ({
      milestonesByKey: { ...state.milestonesByKey, [key]: milestones },
    })),
  cardViewByKey: {},
  setCardView: (key, isCardView) =>
    set((state) => ({
      cardViewByKey: { ...state.cardViewByKey, [key]: isCardView },
    })),
  resetMilestoneForm: () => set({ milestonesByKey: {}, cardViewByKey: {} }),
}));
