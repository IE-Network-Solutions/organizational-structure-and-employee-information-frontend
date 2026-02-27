import { create } from 'zustand';

interface KeyResultFormState {
  sheetOpenByKey: Record<string, boolean>;
  setSheetOpen: (key: string, open: boolean) => void;
  resetKeyResultForm: () => void;
}

export const useKeyResultFormStore = create<KeyResultFormState>((set) => ({
  sheetOpenByKey: {},
  setSheetOpen: (key, open) =>
    set((state) => ({
      sheetOpenByKey: { ...state.sheetOpenByKey, [key]: open },
    })),
  resetKeyResultForm: () => set({ sheetOpenByKey: {} }),
}));
