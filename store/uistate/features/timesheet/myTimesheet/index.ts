import { create, StateCreator } from 'zustand';

export enum CheckStatus {
  notStarted = 'notStarted',
  started = 'started',
  breaking = 'breaking',
  finished = 'finished',
}

type MyTimesheetState = {
  isShowViewSidebar: boolean;
  isShowNewLeaveRequestSidebar: boolean;
  isShowCheckOutSidebar: boolean;
  checkStatus: CheckStatus;
};

type MyTimesheetAction = {
  setIsShowViewSidebar: (isShowViewSidebar: boolean) => void;
  setIsShowNewLeaveRequestSidebar: (
    isShowNewLeaveRequestSidebar: boolean,
  ) => void;
  setIsShowCheckOutSidebar: (isShowCheckOutSidebar: boolean) => void;
  setCheckStatus: (checkStatus: CheckStatus) => void;
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

  checkStatus: CheckStatus.notStarted,
  setCheckStatus: (checkStatus: CheckStatus) => {
    set({ checkStatus });
  },
});

export const useMyTimesheetStore = create<MyTimesheetState & MyTimesheetAction>(
  useMyTimesheetSlice,
);
