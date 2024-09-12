import { create, StateCreator } from 'zustand';

type TnaSettingsState = {
  isShowTnaCategorySidebar: boolean;
  isShowCommitmentSidebar: boolean;
};

type TnaSettingsAction = {
  setIsShowTnaCategorySidebar: (isShowTnaCategorySidebar: boolean) => void;
  setIsShowCommitmentSidebar: (isShowCommitmentSidebar: boolean) => void;
};

const tnaSettingsSlice: StateCreator<TnaSettingsState & TnaSettingsAction> = (
  set,
) => ({
  isShowTnaCategorySidebar: false,
  setIsShowTnaCategorySidebar: (isShowTnaCategorySidebar: boolean) => {
    set({ isShowTnaCategorySidebar });
  },

  isShowCommitmentSidebar: false,
  setIsShowCommitmentSidebar: (isShowCommitmentSidebar: boolean) => {
    set({ isShowCommitmentSidebar });
  },
});

export const useTnaSettingsStore = create<TnaSettingsState & TnaSettingsAction>(
  tnaSettingsSlice,
);
