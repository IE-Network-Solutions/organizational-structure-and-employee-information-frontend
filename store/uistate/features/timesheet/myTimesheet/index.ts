import { create, StateCreator } from 'zustand';
import { AllowedArea, LeaveType } from '@/types/timesheet/settings';
import { AttendanceRecord } from '@/types/timesheet/attendance';
import { BreakType } from '@/types/timesheet/breakType';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';

export enum CheckStatus {
  notStarted = 'notStarted',
  started = 'started',
  breaking = 'breaking',
  finished = 'finished',
}
type MyTimesheetState = {
  filter: Partial<LeaveRequestBody['filter']>;
  isShowViewSidebar: boolean;
  isShowLeaveRequestSidebar: boolean;
  isLoading: boolean;
  isShowLeaveRequestDetail: boolean;
  leaveRequestSidebarData: string | null;
  leaveRequestSidebarWorkflowData: string | null;
  isShowCheckOutSidebar: boolean;
  checkStatus: CheckStatus;
  leaveTypes: LeaveType[];
  allowedAreas: AllowedArea[];
  currentAttendance: AttendanceRecord | null;
  breakTypes: BreakType[];
  viewAttendanceId: string | null;
  location: { lat: null | number; lng: null | number };
  showLeaveHistoryFilter: boolean;
  setShowLeaveHistoryFilter: (showLeaveHistoryFilter: boolean) => void;
};

type MyTimesheetAction = {
  setFilter: (filter: Partial<LeaveRequestBody['filter']>) => void;
  setIsShowViewSidebar: (isShowViewSidebar: boolean) => void;
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsShowLeaveRequestDetail: (isShowLeaveRequestDetail: boolean) => void;
  setLeaveRequestSidebarData: (leaveRequestSidebarData: string | null) => void;
  setLeaveRequestSidebarWorkflowData: (
    leaveRequestSidebarWorkflowData: string | null,
  ) => void;
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
  filter: {},
  setFilter: (newFilter) => set({ filter: newFilter }),

  isShowViewSidebar: false,
  setIsShowViewSidebar: (isShowViewSidebar) => {
    set({ isShowViewSidebar });
  },

  isShowLeaveRequestSidebar: false,
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar) => {
    set({ isShowLeaveRequestSidebar });
  },

  isLoading: false,
  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  isShowLeaveRequestDetail: false,
  setIsShowLeaveRequestDetail: (isShowLeaveRequestDetail) => {
    set({ isShowLeaveRequestDetail });
  },

  leaveRequestSidebarData: null,
  setLeaveRequestSidebarData: (leaveRequestSidebarData) => {
    set({ leaveRequestSidebarData });
  },

  leaveRequestSidebarWorkflowData: null,
  setLeaveRequestSidebarWorkflowData: (leaveRequestSidebarWorkflowData) => {
    set({ leaveRequestSidebarWorkflowData });
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
  showLeaveHistoryFilter: false,
  setShowLeaveHistoryFilter: (showLeaveHistoryFilter: boolean) =>
    set({ showLeaveHistoryFilter }),
});

export const useMyTimesheetStore = create<MyTimesheetState & MyTimesheetAction>(
  useMyTimesheetSlice,
);
