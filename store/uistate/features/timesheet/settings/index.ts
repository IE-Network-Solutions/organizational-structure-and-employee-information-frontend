import { create, StateCreator } from 'zustand';
import { AttendanceNotificationType } from '@/types/timesheet/attendance';

type TimesheetSettingsState = {
  isShowLocationSidebar: boolean;
  isShowRulesAddTypeSidebar: boolean;
  isShowCreateRuleSidebar: boolean;
  isShowNewAccrualRuleSidebar: boolean;
  isShowCarryOverRuleSidebar: boolean;
  isShowTypeAndPoliciesSidebar: boolean;
  isShowClosedDateSidebar: boolean;
  isShowLeaveRequestSidebar: boolean;

  attendanceNotificationType: AttendanceNotificationType[];
  attendanceTypeId: string | null;
  attendanceRuleId: string | null;
  allowedAreaId: string | null;
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
  setIsShowClosedDateSidebar: (isShowClosedDateSidebar: boolean) => void;
  setIsShowLeaveRequestSidebar: (isShowLeaveRequestSidebar: boolean) => void;

  setAttendanceNotificationType: (
    attendanceNotificationType: AttendanceNotificationType[],
  ) => void;
  setAttendanceTypeId: (attendanceId: string | null) => void;
  setAttendanceRuleId: (attendanceRuleId: string | null) => void;
  setAllowedAreaId: (allowedAreaId: string | null) => void;
};

const timesheetSettingsSlice: StateCreator<
  TimesheetSettingsState & TimesheetSettingsStateAction
> = (set) => ({
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

  isShowClosedDateSidebar: false,
  setIsShowClosedDateSidebar: (isShowClosedDateSidebar: boolean) => {
    set({ isShowClosedDateSidebar });
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

  attendanceRuleId: null,
  setAttendanceRuleId: (attendanceRuleId) => {
    set({ attendanceRuleId });
  },

  allowedAreaId: null,
  setAllowedAreaId: (allowedAreaId: string | null) => {
    set({ allowedAreaId });
  },
});

export const useTimesheetSettingsStore = create<
  TimesheetSettingsState & TimesheetSettingsStateAction
>(timesheetSettingsSlice);
