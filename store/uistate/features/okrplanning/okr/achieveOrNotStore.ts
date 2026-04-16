import { create } from 'zustand';

interface AchieveOrNotState {
  cardViewByKey: Record<string, boolean>;
  setCardView: (key: string, isCardView: boolean) => void;
  resetAchieveOrNot: () => void;
}

export const useAchieveOrNotStore = create<AchieveOrNotState>((set) => ({
  cardViewByKey: {},
  setCardView: (key, isCardView) =>
    set((state) => ({
      cardViewByKey: { ...state.cardViewByKey, [key]: isCardView },
    })),
  resetAchieveOrNot: () => set({ cardViewByKey: {} }),
}));
