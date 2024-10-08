import { create, StateCreator } from 'zustand';
import { TrainingNeedCategory } from '@/types/tna/tna';

type TnaReviewState = {
  isShowTnaReviewSidebar: boolean;
  isShowTnaUpdateSidebar: boolean;
  tnaId: string | null;

  tnaCategory: TrainingNeedCategory[];
};

type TnaReviewAction = {
  setIsShowTnaReviewSidebar: (isShowTnaReviewSidebar: boolean) => void;
  setIsShowTnaUpdateSidebar: (isShowTnaUpdateSidebar: boolean) => void;
  setTnaId: (tnaId: string | null) => void;

  setTnaCategory: (tnaCategory: TrainingNeedCategory[]) => void;
};

const tnaReviewSlice: StateCreator<TnaReviewState & TnaReviewAction> = (
  set,
) => ({
  isShowTnaReviewSidebar: false,
  setIsShowTnaReviewSidebar: (isShowTnaReviewSidebar: boolean) => {
    set({ isShowTnaReviewSidebar });
  },

  isShowTnaUpdateSidebar: false,
  setIsShowTnaUpdateSidebar: (isShowTnaUpdateSidebar) => {
    set({ isShowTnaUpdateSidebar });
  },

  tnaId: null,
  setTnaId: (tnaId) => {
    set({ tnaId });
  },

  tnaCategory: [],
  setTnaCategory: (tnaCategory: TrainingNeedCategory[]) => {
    set({ tnaCategory });
  },
});

export const useTnaReviewStore = create<TnaReviewState & TnaReviewAction>(
  tnaReviewSlice,
);
