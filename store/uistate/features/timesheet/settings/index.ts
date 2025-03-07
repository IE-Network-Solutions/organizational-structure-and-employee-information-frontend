import { create, StateCreator } from 'zustand';
import { AttendanceNotificationType } from '@/types/timesheet/attendance';

type TimesheetSettingsState = {
  isShowLocationSidebar: boolean;
  isShowRulesAddTypeSidebar: boolean;
  isShowCreateRuleSidebar: boolean;
  isShowNewAccrualRuleSidebar: boolean;
  isShowCarryOverRuleSidebar: boolean;
  isShowTypeAndPoliciesSidebar: boolean;
  isShowTypeAndPoliciesSidebarEdit: boolean;
  isErrorPlan: boolean;
  isShowClosedDateSidebar: boolean;
  isShowBreakTypeSidebar: boolean;
  isShowLeaveRequestSidebar: boolean;

  attendanceNotificationType: AttendanceNotificationType[];
  attendanceTypeId: string | null;
  leaveTypeId: string | null;
  attendanceRuleId: string | null;
  allowedAreaId: string | null;
  leaveRequestId: string | null;
  selectedClosedDate: any | null;
  selectedBreakType: any | null;
  isTo: boolean;
  isLoading: boolean;
};

type TimesheetSettingsStateAction = {
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => void;
  setIsShowRulesAddTypeSidebar: (isShowRulesAddTypeSidebar: boolean) => void;
  setIsShowCreateRuleSidebar: (isShowCreateRuleSidebar: boolean) => void;
  setIsShowNewAccrualRuleSidebar: (
    isShowNewAccrualRuleSidebar: boolean,
  ) => void;
  setIsShowCarryOverRuleSidebar: (isShowCarryOverRuleSidebar: boolean) => void;
  setIsShowTypeAndPoliciesSidebar: (
    isShowTypeAndPoliciesSidebar: boolean,
  ) => void;
  setIsShowTypeAndPoliciesSidebarEdit: (
    isShowTypeAndPoliciesSidebarEdit: boolean,
  ) => void;
  setIsErrorPlan: (isErrorPlan: boolean) => void;
  setIsShowClosedDateSidebar: (isShowClosedDateSidebar: boolean) => void;
  setIsShowBreakTypeSidebar: (isShowBreakTypeSidebar: boolean) => void;
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar: boolean) => void;

  setAttendanceNotificationType: (
    attendanceNotificationType: AttendanceNotificationType[],
  ) => void;
  setAttendanceTypeId: (attendanceId: string | null) => void;
  setLeaveTypeId: (leaveTypeId: string | null) => void;
  setAttendanceRuleId: (attendanceRuleId: string | null) => void;
  setAllowedAreaId: (allowedAreaId: string | null) => void;
  setLeaveRequestId: (leaveRequestId: string | null) => void;
  setSelectedClosedDate: (closedDate: any | null) => void;
  setSelectedBreakType: (breakType: any | null) => void;
  setIsTo: (isTo: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
};

const timesheetSettingsSlice: StateCreator<
  TimesheetSettingsState & TimesheetSettingsStateAction
> = (set) => ({
  selectedClosedDate: null,
  setSelectedClosedDate: (closedDate) => {
    set({ selectedClosedDate: closedDate });
  },

  selectedBreakType: null,
  setSelectedBreakType: (breakType) => {
    set({ selectedBreakType: breakType });
  },

  isShowLocationSidebar: false,
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => {
    set({ isShowLocationSidebar });
  },

  isShowRulesAddTypeSidebar: false,
  setIsShowRulesAddTypeSidebar: (isShowRulesAddTypeSidebar: boolean) => {
    set({ isShowRulesAddTypeSidebar });
  },

  isShowCreateRuleSidebar: false,
  setIsShowCreateRuleSidebar: (isShowCreateRuleSidebar: boolean) => {
    set({ isShowCreateRuleSidebar });
  },

  isShowNewAccrualRuleSidebar: false,
  setIsShowNewAccrualRuleSidebar: (isShowNewAccrualRuleSidebar: boolean) => {
    set({ isShowNewAccrualRuleSidebar });
  },

  isShowCarryOverRuleSidebar: false,
  setIsShowCarryOverRuleSidebar: (isShowCarryOverRuleSidebar: boolean) => {
    set({ isShowCarryOverRuleSidebar });
  },

  isShowTypeAndPoliciesSidebar: false,
  setIsShowTypeAndPoliciesSidebar: (isShowTypeAndPoliciesSidebar: boolean) => {
    set({ isShowTypeAndPoliciesSidebar });
  },

  isShowTypeAndPoliciesSidebarEdit: false,
  setIsShowTypeAndPoliciesSidebarEdit: (
    isShowTypeAndPoliciesSidebarEdit: boolean,
  ) => {
    set({ isShowTypeAndPoliciesSidebarEdit });
  },

  isErrorPlan: false,
  setIsErrorPlan: (isErrorPlan: boolean) => {
    set({ isErrorPlan });
  },

  isShowClosedDateSidebar: false,
  setIsShowClosedDateSidebar: (isShowClosedDateSidebar: boolean) => {
    set({ isShowClosedDateSidebar });
  },

  isShowBreakTypeSidebar: false,
  setIsShowBreakTypeSidebar: (isShowBreakTypeSidebar: boolean) => {
    set({ isShowBreakTypeSidebar });
  },

  isShowLeaveRequestSidebar: false,
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar: boolean) => {
    set({ isShowLeaveRequestSidebar });
  },

  attendanceNotificationType: [],
  setAttendanceNotificationType: (attendanceNotificationType) => {
    set({ attendanceNotificationType });
  },

  attendanceTypeId: null,
  setAttendanceTypeId: (attendanceTypeId) => {
    set({ attendanceTypeId });
  },

  leaveTypeId: null,
  setLeaveTypeId: (leaveTypeId) => {
    set({ leaveTypeId });
  },

  attendanceRuleId: null,
  setAttendanceRuleId: (attendanceRuleId) => {
    set({ attendanceRuleId });
  },

  allowedAreaId: null,
  setAllowedAreaId: (allowedAreaId: string | null) => {
    set({ allowedAreaId });
  },

  leaveRequestId: null,
  setLeaveRequestId: (leaveRequestId) => {
    set({ leaveRequestId });
  },
  isTo: false,
  setIsTo: (isTo: boolean) => {
    set({ isTo });
  },
  isLoading: false,
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
});

export const useTimesheetSettingsStore = create<
  TimesheetSettingsState & TimesheetSettingsStateAction
>(timesheetSettingsSlice);
