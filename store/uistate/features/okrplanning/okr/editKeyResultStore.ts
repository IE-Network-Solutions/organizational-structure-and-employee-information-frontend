import { create } from 'zustand';

interface EditKeyResultState {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  resetEditKeyResult: () => void;
}

export const useEditKeyResultStore = create<EditKeyResultState>((set) => ({
  isEditing: false,
  setIsEditing: (isEditing) => set({ isEditing }),
  resetEditKeyResult: () => set({ isEditing: false }),
}));
