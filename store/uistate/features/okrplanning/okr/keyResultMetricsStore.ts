import { create } from 'zustand';

interface KeyResultMetricsState {
  editModalKeyResultId: string | null;
  deleteModalKeyResultId: string | null;
  openTimelineModal: boolean;
  openEditModal: (keyResultId: string) => void;
  closeEditModal: () => void;
  openDeleteModal: (keyResultId: string) => void;
  closeDeleteModal: () => void;
  setOpenTimelineModal: (open: boolean) => void;
}

export const useKeyResultMetricsStore = create<KeyResultMetricsState>((set) => ({
  editModalKeyResultId: null,
  deleteModalKeyResultId: null,
  openTimelineModal: false,
  openEditModal: (keyResultId) => set({ editModalKeyResultId: keyResultId }),
  closeEditModal: () => set({ editModalKeyResultId: null }),
  openDeleteModal: (keyResultId) => set({ deleteModalKeyResultId: keyResultId }),
  closeDeleteModal: () => set({ deleteModalKeyResultId: null }),
  setOpenTimelineModal: (open) => set({ openTimelineModal: open }),
}));
