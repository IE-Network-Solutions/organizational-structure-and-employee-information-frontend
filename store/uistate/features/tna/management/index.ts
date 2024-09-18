import { create, StateCreator } from 'zustand';

type TnaManagementState = {
  isShowCourseSidebar: boolean;
};

type TnaManagementAction = {
  setIsShowCourseSidebar: (isShowCourseSidebar: boolean) => void;
};

const tnaManagementSlice: StateCreator<
  TnaManagementState & TnaManagementAction
> = (set) => ({
  isShowCourseSidebar: false,
  setIsShowCourseSidebar: (isShowCourseSidebar: boolean) => {
    set({ isShowCourseSidebar });
  },
});

export const useTnaManagementStore = create<
  TnaManagementState & TnaManagementAction
>(tnaManagementSlice);
