import { create } from 'zustand';

interface ActionPlanStatusState {
  // Map of actionPlanId -> loading state
  loadingStates: Record<string, boolean>;
  // Map of actionPlanId -> optimistic status
  optimisticStatuses: Record<string, string | null>;
  
  // Actions
  setLoading: (actionPlanId: string, loading: boolean) => void;
  setOptimisticStatus: (actionPlanId: string, status: string | null) => void;
  clearOptimisticStatus: (actionPlanId: string) => void;
  getLoading: (actionPlanId: string) => boolean;
  getOptimisticStatus: (actionPlanId: string) => string | null;
}

export const useActionPlanStatusStore = create<ActionPlanStatusState>((set, get) => ({
  loadingStates: {},
  optimisticStatuses: {},
  
  setLoading: (actionPlanId: string, loading: boolean) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [actionPlanId]: loading,
      },
    })),
  
  setOptimisticStatus: (actionPlanId: string, status: string | null) =>
    set((state) => ({
      optimisticStatuses: {
        ...state.optimisticStatuses,
        [actionPlanId]: status,
      },
    })),
  
  clearOptimisticStatus: (actionPlanId: string) =>
    set((state) => {
      const { [actionPlanId]: _, ...rest } = state.optimisticStatuses;
      return { optimisticStatuses: rest };
    }),
  
  getLoading: (actionPlanId: string) => {
    return get().loadingStates[actionPlanId] || false;
  },
  
  getOptimisticStatus: (actionPlanId: string) => {
    return get().optimisticStatuses[actionPlanId] || null;
  },
}));

