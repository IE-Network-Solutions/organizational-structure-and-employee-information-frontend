import { create, StateCreator } from 'zustand';

type VariablePayState = {
  score: number;
  maxScore: number;
  change: number;
  timeRange: string;
  value: number;
  graphChange: number;
};
type VariablePayAction = {
  updateScore: (score: number) => void;
  setTimeRange: (range: string) => void;
  setValue: (newValue: number) => void;
  setGraphChange: (newChange: number) => void;
};

const VariablePaySlice: StateCreator<VariablePayState & VariablePayAction> = (
  set,
) => ({
  score: 0,
  maxScore: 0,
  change: 0,
  updateScore: (score) => set((state) => ({ ...state, score })),

  timeRange: 'Yearly',
  setTimeRange: (range) => set({ timeRange: range }),

  value: 0,
  graphChange: 0,
  setValue: (newValue) => set({ value: newValue }),
  setGraphChange: (newChange) => set({ change: newChange }),
});

export const useVariablePayStore = create<VariablePayState & VariablePayAction>(
  VariablePaySlice,
);
