import { create } from 'zustand';

interface KeyResultMetricsState {
  editModalKeyResultId: string | null;
  deleteModalKeyResultId: string | null;
  openEditModal: (keyResultId: string) => void;
  closeEditModal: () => void;
  openDeleteModal: (keyResultId: string) => void;
  closeDeleteModal: () => void;
}

export const useKeyResultMetricsStore = create<KeyResultMetricsState>((set) => ({
  editModalKeyResultId: null,
  deleteModalKeyResultId: null,
  openEditModal: (keyResultId) => set({ editModalKeyResultId: keyResultId }),
  closeEditModal: () => set({ editModalKeyResultId: null }),
  openDeleteModal: (keyResultId) => set({ deleteModalKeyResultId: keyResultId }),
  closeDeleteModal: () => set({ deleteModalKeyResultId: null }),
}));
