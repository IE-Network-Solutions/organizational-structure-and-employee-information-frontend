// store/talentPoolSettingsStore.ts
import { create } from 'zustand';
import { TalentPoolSettingsDrawerState } from './tallentPoolCatogoryDrawer.interface';

export const useTalentPoolSettingsStore = create<TalentPoolSettingsDrawerState>(
  (set) => ({
    isOpen: false,
    selectedTalentPool: null,
    isEditMode: false,
    isDeleteMode: false,
    talentPoolName: '',
    pageSize: 5,
    currentPage: 1,
    setPage: (pageSize) => set({ pageSize }),
    setCurrentPage: (currentPage) => set({ currentPage }),

    toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

    closeDrawer: () =>
      set({ isOpen: false, isEditMode: false, selectedTalentPool: null }),

    openDrawer: () => set({ isOpen: true }),

    setSelectedTalentPool: (talentPool) =>
      set({ talentPoolName: talentPool?.name, selectedTalentPool: talentPool }),

    setEditMode: (isEdit) => set({ isEditMode: isEdit }),

    setDeleteMode: (isDelete) => set({ isDeleteMode: isDelete }),
  }),
);
