import { create } from 'zustand';

interface ObjectiveBasicState {
  editObjectiveModalObjectiveId: string | null;
  deleteModalObjectiveId: string | null;
  editKeyResultModalKeyResultId: string | null;
  expandedObjectiveIds: Record<string, boolean>;
  openEditObjective: (objectiveId: string) => void;
  closeEditObjective: () => void;
  openDeleteModal: (objectiveId: string) => void;
  closeDeleteModal: () => void;
  openEditKeyResult: (keyResultId: string) => void;
  closeEditKeyResult: () => void;
  setExpanded: (objectiveId: string, expanded: boolean) => void;
  toggleExpanded: (objectiveId: string) => void;
}

export const useObjectiveBasicStore = create<ObjectiveBasicState>((set) => ({
  editObjectiveModalObjectiveId: null,
  deleteModalObjectiveId: null,
  editKeyResultModalKeyResultId: null,
  expandedObjectiveIds: {},
  openEditObjective: (objectiveId) =>
    set({ editObjectiveModalObjectiveId: objectiveId }),
  closeEditObjective: () => set({ editObjectiveModalObjectiveId: null }),
  openDeleteModal: (objectiveId) =>
    set({ deleteModalObjectiveId: objectiveId }),
  closeDeleteModal: () => set({ deleteModalObjectiveId: null }),
  openEditKeyResult: (keyResultId) =>
    set({ editKeyResultModalKeyResultId: keyResultId }),
  closeEditKeyResult: () => set({ editKeyResultModalKeyResultId: null }),
  setExpanded: (objectiveId, expanded) =>
    set((state) => ({
      expandedObjectiveIds: {
        ...state.expandedObjectiveIds,
        [objectiveId]: expanded,
      },
    })),
  toggleExpanded: (objectiveId) =>
    set((state) => ({
      expandedObjectiveIds: {
        ...state.expandedObjectiveIds,
        [objectiveId]: !(state.expandedObjectiveIds[objectiveId] ?? true),
      },
    })),
}));
