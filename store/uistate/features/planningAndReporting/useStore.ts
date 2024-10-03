// useStore.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PlanningAndReporting {
  open: boolean;
  setOpen: (open: boolean) => void;
  openReportModal: boolean;
  setOpenReportModal: (open: boolean) => void;
  isEditing: boolean;
  setEditing: (open: boolean) => void;
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

  selectedPlanId: string;
  setSelectedPlanId: (selectedPlanId: string) => void;
}
export const PlanningAndReportingStore = create<PlanningAndReporting>()(
  devtools((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
    openReportModal: false,
    setOpenReportModal: (openReportModal: boolean) => set({ openReportModal }),
    isEditing: false,
    setEditing: (isEditing: boolean) => set({ isEditing }),
    activeTab: 1,
    setActiveTab: (activeTab: number) => set({ activeTab }),

    selectedPlanId: '',
    setSelectedPlanId: (selectedPlanId: string) => set({ selectedPlanId }),

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
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        /*eslint-disable @typescript-eslint/no-unused-vars */
        const { [key]: index, ...remainingWeights } = state.weights;
        /*eslint-enable @typescript-eslint/no-unused-vars */
        /* eslint-ensable-next-line @typescript-eslint/naming-convention */

        const newTotal = Object.values(remainingWeights).reduce(
          (acc, val) => acc + val,
          0,
        );
        return { weights: remainingWeights, totalWeight: newTotal };
      }),

    resetWeights: () => set({ weights: {}, totalWeight: 0 }),
  })),
);
