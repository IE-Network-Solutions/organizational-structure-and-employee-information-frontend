import { create, StateCreator } from 'zustand';

interface SearchParams {
  selectedRange: string;
}

type VariablePayState = {
  score: number;
  maxScore: number;
  change: number;
  timeRange: string;
  value: number;
  graphChange: number;
  cardsPerPage: number;
  visibleIndex: number;
  searchParams: SearchParams;
};
type VariablePayAction = {
  updateScore: (score: number) => void;
  setTimeRange: (range: string) => void;
  setValue: (newValue: number) => void;
  setGraphChange: (newChange: number) => void;
  setVisibleIndex: (value: number) => void;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;
};

interface VPState {
  isUpdated: boolean;
  setIsUpdated: (value: boolean) => void;
}

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

  cardsPerPage: 3,
  visibleIndex: 0,
  setVisibleIndex: (value: number) => set({ visibleIndex: value }),

  searchParams: {
    selectedRange: 'monthly',
  },
  setSearchParams: (key, value) => {
    const stringValue = typeof value === 'boolean' ? String(value) : value;
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: stringValue },
    }));
  },
});

export const useVariablePayStore = create<VariablePayState & VariablePayAction>(
  VariablePaySlice,
);

export const useVPStore = create<VPState>((set) => ({
  isUpdated: false,
  setIsUpdated: (value) => set({ isUpdated: value }),
}));
