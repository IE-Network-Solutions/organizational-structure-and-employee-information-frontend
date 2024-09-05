import { create, StateCreator } from 'zustand';
import {
  AllowedArea,
  LeaveRequest,
  LeaveType,
} from '@/types/timesheet/settings';
import { AttendanceRecord } from '@/types/timesheet/attendance';
import { BreakType } from '@/types/timesheet/breakType';

export enum CheckStatus {
  notStarted = 'notStarted',
  started = 'started',
  breaking = 'breaking',
  finished = 'finished',
}

type MyTimesheetState = {
  isShowViewSidebar: boolean;
  isShowLeaveRequestSidebar: boolean;
  leaveRequestSidebarData: string | null;
  isShowCheckOutSidebar: boolean;
  checkStatus: CheckStatus;
  leaveTypes: LeaveType[];
  allowedAreas: AllowedArea[];
  currentAttendance: AttendanceRecord | null;
  breakTypes: BreakType[];
};

type MyTimesheetAction = {
  setIsShowViewSidebar: (isShowViewSidebar: boolean) => void;
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar: boolean) => void;
  setLeaveRequestSidebarData: (leaveRequestSidebarData: string | null) => void;
  setIsShowCheckOutSidebar: (isShowCheckOutSidebar: boolean) => void;
  setCheckStatus: (checkStatus: CheckStatus) => void;
  setLeaveTypes: (leaveTypes: LeaveType[]) => void;
  setAllowedAreas: (allowedAreas: AllowedArea[]) => void;
  setCurrentAttendance: (currentAttendance: AttendanceRecord | null) => void;
  setBreakTypes: (breakTypes: BreakType[]) => void;
};

const useMyTimesheetSlice: StateCreator<
  MyTimesheetState & MyTimesheetAction
> = (set) => ({
  isShowViewSidebar: false,
  setIsShowViewSidebar: (isShowViewSidebar) => {
    set({ isShowViewSidebar });
  },

  isShowLeaveRequestSidebar: false,
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar) => {
    set({ isShowLeaveRequestSidebar });
  },

  leaveRequestSidebarData: null,
  setLeaveRequestSidebarData: (leaveRequestSidebarData) => {
    set({ leaveRequestSidebarData });
  },

  isShowCheckOutSidebar: false,
  setIsShowCheckOutSidebar: (isShowCheckOutSidebar) => {
    set({ isShowCheckOutSidebar });
  },

  checkStatus: CheckStatus.notStarted,
  setCheckStatus: (checkStatus: CheckStatus) => {
    set({ checkStatus });
  },

  leaveTypes: [],
  setLeaveTypes: (leaveTypes: LeaveType[]) => {
    set({ leaveTypes });
  },

  allowedAreas: [],
  setAllowedAreas: (allowedAreas: AllowedArea[]) => {
    set({ allowedAreas });
  },

  currentAttendance: null,
  setCurrentAttendance: (currentAttendance) => {
    if (currentAttendance?.isOnGoing) {
      const isBreak = !!currentAttendance.attendanceBreaks?.find(
        (item) => item.isOnGoing,
      );
      if (isBreak) {
        set({ checkStatus: CheckStatus.breaking });
      } else {
        set({ checkStatus: CheckStatus.started });
      }
    }
    set({ currentAttendance });
  },

  breakTypes: [],
  setBreakTypes: (breakTypes: BreakType[]) => {
    set({ breakTypes });
  },
});

export const useMyTimesheetStore = create<MyTimesheetState & MyTimesheetAction>(
  useMyTimesheetSlice,
);
