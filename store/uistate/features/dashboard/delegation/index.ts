import { create } from 'zustand';

// Define the TypeScript interface for the state
interface DateRangeState {
  type: number;
  dateRange: {
    start: string | '';
    end: string | '';
  };
  setType: (type: number) => void;
  setDateRange: (start: string | '', end: string | '') => void;
}

// Create the Zustand store
export const useDelegationState = create<DateRangeState>((set) => ({
  type: 1,
  dateRange: {
    start: '',
    end: '',
  },
  setDateRange: (start, end) =>
    set(() => ({
      dateRange: { start, end },
    })),
  setType: (type: number) => set({ type }),
}));
