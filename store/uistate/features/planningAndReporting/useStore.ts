// useStore.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface planningAndReporting {
  open: boolean;
  setOpen: (open: boolean) => void;
  weights: Record<string, number>;
  totalWeight: number;

  setWeight: (key: string, weight: number) => void;
  removeWeight: (key: string) => void;
  resetWeights: () => void;
}
export const usePlanningAndReportingStore = create<planningAndReporting>()(
  devtools((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
    weights: {},
    totalWeight: 0,

    setWeight: (key, weight) =>
      set((state) => {
        const updatedWeights = { ...state.weights, [key]: weight };
        const newTotal = Object.values(updatedWeights).reduce(
          (acc, val) => acc + val,
          0,
        );
        return { weights: updatedWeights, totalWeight: newTotal };
      }),

    removeWeight: (key) =>
      set((state) => {
        const { [key]: _, ...remainingWeights } = state.weights;
        const newTotal = Object.values(remainingWeights).reduce(
          (acc, val) => acc + val,
          0,
        );
        return { weights: remainingWeights, totalWeight: newTotal };
      }),

    resetWeights: () => set({ weights: {}, totalWeight: 0 }),
  })),
);
