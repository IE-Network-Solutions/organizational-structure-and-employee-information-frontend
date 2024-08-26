import { create, StateCreator } from 'zustand';

type MyTimesheetState = {
  isShowViewSidebar: boolean;
};

type MyTimesheetAction = {
  setIsShowViewSidebar: (isShowViewSidebar: boolean) => void;
};

const useMyTimesheetSlice: StateCreator<
  MyTimesheetState & MyTimesheetAction
> = (set) => ({
  isShowViewSidebar: false,
  setIsShowViewSidebar: (isShowViewSidebar) => {
    set({ isShowViewSidebar });
  },
});

export const useMyTimesheetStore = create<MyTimesheetState & MyTimesheetAction>(
  useMyTimesheetSlice,
);
