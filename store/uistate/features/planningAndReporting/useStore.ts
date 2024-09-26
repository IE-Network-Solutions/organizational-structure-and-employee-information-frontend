// useStore.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PlanningAndReporting {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: number;
  setActiveTab: (activeTab: number) => void;

  activePlanPeriod: number;
  setActivePlanPeriod: (activePlanPeriod: number) => void;

  selectedUser: string[];
  setSelectedUser: (selectedUser: string[]) => void;
  weights: Record<string, number>;
  totalWeight: number;

  setWeight: (key: string, weight: number) => void;
  removeWeight: (key: string) => void;
  resetWeights: () => void;
}
export const PlanningAndReportingStore = create<PlanningAndReporting>()(
  devtools((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),

    activeTab: 1,
    setActiveTab: (activeTab: number) => set({ activeTab }),

    activePlanPeriod: 1,
    setActivePlanPeriod: (activePlanPeriod: number) =>
      set({ activePlanPeriod }),

    selectedUser: [''],
    setSelectedUser: (selectedUser: string[]) => set({ selectedUser }),
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
