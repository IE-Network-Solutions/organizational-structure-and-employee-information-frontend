import { create, StateCreator } from 'zustand';
import { AllowedArea, LeaveType } from '@/types/timesheet/settings';
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
  isShowLeaveRequestDetail: boolean;
  leaveRequestSidebarData: string | null;
  isShowCheckOutSidebar: boolean;
  checkStatus: CheckStatus;
  leaveTypes: LeaveType[];
  allowedAreas: AllowedArea[];
  currentAttendance: AttendanceRecord | null;
  breakTypes: BreakType[];
  viewAttendanceId: string | null;
  location: { lat: null | number; lng: null | number };
};

type MyTimesheetAction = {
  setIsShowViewSidebar: (isShowViewSidebar: boolean) => void;
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar: boolean) => void;
  setIsShowLeaveRequestDetail: (isShowLeaveRequestDetail: boolean) => void;
  setLeaveRequestSidebarData: (leaveRequestSidebarData: string | null) => void;
  setIsShowCheckOutSidebar: (isShowCheckOutSidebar: boolean) => void;
  setCheckStatus: (checkStatus: CheckStatus) => void;
  setLeaveTypes: (leaveTypes: LeaveType[]) => void;
  setAllowedAreas: (allowedAreas: AllowedArea[]) => void;
  setCurrentAttendance: (currentAttendance: AttendanceRecord | null) => void;
  setBreakTypes: (breakTypes: BreakType[]) => void;
  setViewAttendanceId: (viewAttendanceId: string | null) => void;
  setLocation: (location: { lat: null | number; lng: null | number }) => void;
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

  isShowLeaveRequestDetail: false,
  setIsShowLeaveRequestDetail: (isShowLeaveRequestDetail) => {
    set({ isShowLeaveRequestDetail });
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
    } else {
      set({ checkStatus: CheckStatus.notStarted });
    }
    set({ currentAttendance });
  },

  breakTypes: [],
  setBreakTypes: (breakTypes: BreakType[]) => {
    set({ breakTypes });
  },

  viewAttendanceId: null,
  setViewAttendanceId: (viewAttendanceId: string | null) => {
    set({ viewAttendanceId });
  },

  location: { lat: null, lng: null },
  setLocation: (location) => {
    set({ location });
  },
});

export const useMyTimesheetStore = create<MyTimesheetState & MyTimesheetAction>(
  useMyTimesheetSlice,
);
