import { create, StateCreator } from 'zustand';

type TnaSettingsState = {
  isShowTnaCategorySidebar: boolean;
  tnaCategoryId: string | null;
  isShowCommitmentSidebar: boolean;
  tnaCommitmentId: string | null;
  isShowCourseCategorySidebar: boolean;
  courseCategoryId: string | null;
};

type TnaSettingsAction = {
  setIsShowTnaCategorySidebar: (isShowTnaCategorySidebar: boolean) => void;
  setTnaCategoryId: (tnaCategoryId: string | null) => void;
  setIsShowCommitmentSidebar: (isShowCommitmentSidebar: boolean) => void;
  setTnaCommitmentId: (tnaCommitmentId: string | null) => void;
  setIsShowCourseCategorySidebar: (
    isShowCourseCategorySidebar: boolean,
  ) => void;
  setCourseCategoryId: (courseCategoryId: string | null) => void;
};

const tnaSettingsSlice: StateCreator<TnaSettingsState & TnaSettingsAction> = (
  set,
) => ({
  isShowTnaCategorySidebar: false,
  setIsShowTnaCategorySidebar: (isShowTnaCategorySidebar: boolean) => {
    set({ isShowTnaCategorySidebar });
  },

  tnaCategoryId: null,
  setTnaCategoryId: (tnaCategoryId) => {
    set({ tnaCategoryId });
  },

  isShowCommitmentSidebar: false,
  setIsShowCommitmentSidebar: (isShowCommitmentSidebar: boolean) => {
    set({ isShowCommitmentSidebar });
  },

  tnaCommitmentId: null,
  setTnaCommitmentId: (tnaCommitmentId: string | null) => {
    set({ tnaCommitmentId });
  },

  isShowCourseCategorySidebar: false,
  setIsShowCourseCategorySidebar: (isShowCourseCategorySidebar: boolean) => {
    set({ isShowCourseCategorySidebar });
  },

  courseCategoryId: null,
  setCourseCategoryId: (courseCategoryId) => {
    set({ courseCategoryId });
  },
});

export const useTnaSettingsStore = create<TnaSettingsState & TnaSettingsAction>(
  tnaSettingsSlice,
);
