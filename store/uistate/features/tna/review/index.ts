import { create, StateCreator } from 'zustand';

type TnaReviewState = {
  isShowTnaReviewSidebar: boolean;
};

type TnaReviewAction = {
  setIsShowTnaReviewSidebar: (isShowTnaReviewSidebar: boolean) => void;
};

const tnaReviewSlice: StateCreator<TnaReviewState & TnaReviewAction> = (
  set,
) => ({
  isShowTnaReviewSidebar: false,
  setIsShowTnaReviewSidebar: (isShowTnaReviewSidebar: boolean) => {
    set({ isShowTnaReviewSidebar });
  },
});

export const useTnaReviewStore = create<TnaReviewState & TnaReviewAction>(
  tnaReviewSlice,
);
