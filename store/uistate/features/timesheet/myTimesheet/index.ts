import { create, StateCreator } from 'zustand';

type MyTimesheetState = {
  isShowViewSidebar: boolean;
  isShowNewLeaveRequestSidebar: boolean;
  isShowCheckOutSidebar: boolean;
};

type MyTimesheetAction = {
  setIsShowViewSidebar: (isShowViewSidebar: boolean) => void;
  setIsShowNewLeaveRequestSidebar: (
    isShowNewLeaveRequestSidebar: boolean,
  ) => void;
  setIsShowCheckOutSidebar: (isShowCheckOutSidebar: boolean) => void;
};

const useMyTimesheetSlice: StateCreator<
  MyTimesheetState & MyTimesheetAction
> = (set) => ({
  isShowViewSidebar: false,
  setIsShowViewSidebar: (isShowViewSidebar) => {
    set({ isShowViewSidebar });
  },

  isShowNewLeaveRequestSidebar: false,
  setIsShowNewLeaveRequestSidebar: (isShowNewLeaveRequestSidebar) => {
    set({ isShowNewLeaveRequestSidebar });
  },

  isShowCheckOutSidebar: false,
  setIsShowCheckOutSidebar: (isShowCheckOutSidebar) => {
    set({ isShowCheckOutSidebar });
  },
});

export const useMyTimesheetStore = create<MyTimesheetState & MyTimesheetAction>(
  useMyTimesheetSlice,
);
