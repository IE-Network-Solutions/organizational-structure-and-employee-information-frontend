import { Key } from 'react';
import { create, StateCreator } from 'zustand';
import { RuleViolationQueryParams } from '@/store/server/features/timesheet/attendance/interface';

type EmployeeAttendanceState = {
  isShowEmployeeAttendanceSidebar: boolean;
  isAbsent: boolean;
  employeeAttendanceId: string | '';
  employeeId: string;
  attendanceRecordDate: string;
  isShowBreakAttendanceImportSidebar: boolean;
  isShowMobileFilters: boolean;
  showViolationFilter: boolean;
  isShowEditRuleViolationModal: boolean;
  setIsShowEditRuleViolationModal: (
    isShowEditRuleViolationModal: boolean,
  ) => void;
  isShowDeleteRuleViolationModal: boolean;
  setIsShowDeleteRuleViolationModal: (
    isShowDeleteRuleViolationModal: boolean,
  ) => void;
  selectedViolationId: string;
  selectedViolationActionTypes: string[];
  setSelectedViolation: (id: string, actionTypes: string[]) => void;
  violationFilters: Partial<RuleViolationQueryParams>;
};

type EmployeeAttendanceStateAction = {
  setIsShowEmployeeAttendanceSidebar: (
    isShowEmployeeAttendanceSidebar: boolean,
  ) => void;
  setIsAbsent: (isAbsent: boolean) => void;
  setEmployeeAttendanceId: (employeeAttendanceId: string | '') => void;
  setEmployeeId: (employeeId: string) => void;
  setAttendanceRecordDate: (attendanceRecordDate: string) => void;
  setIsShowBreakAttendanceImportSidebar: (
    isShowBreakAttendanceImportSidebar: boolean,
  ) => void;
  filter: any;
  setFilter: (filter: any) => void;
  setIsShowMobileFilters: (isShowMobileFilters: boolean) => void;
  setShowViolationFilter: (showViolationFilter: boolean) => void;
  selectedRowKeys: Key[];
  setSelectedRowKeys: (selectedRowKeys: Key[]) => void;
  setIsShowEditRuleViolationModal: (
    isShowEditRuleViolationModal: boolean,
  ) => void;
  setIsShowDeleteRuleViolationModal: (
    isShowDeleteRuleViolationModal: boolean,
  ) => void;
  setSelectedViolation: (id: string, actionTypes: string[]) => void;
  setViolationFilters: (filters: Partial<RuleViolationQueryParams>) => void;
};

const employeeAttendanceSlice: StateCreator<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
> = (set) => ({
  filter: null,
  setFilter: (filter: any) => set({ filter }),
  violationFilters: {},
  setViolationFilters: (violationFilters) => set({ violationFilters }),
  isShowEmployeeAttendanceSidebar: false,
  setIsShowEmployeeAttendanceSidebar: (
    isShowEmployeeAttendanceSidebar: boolean,
  ) => {
    set({ isShowEmployeeAttendanceSidebar });
  },
  isAbsent: false,
  setIsAbsent: (isAbsent: boolean) => {
    set({ isAbsent });
  },

  employeeAttendanceId: '',
  setEmployeeAttendanceId: (employeeAttendanceId: string | '') => {
    set({ employeeAttendanceId });
  },

  employeeId: '',
  setEmployeeId: (employeeId: string) => set({ employeeId }),

  attendanceRecordDate: '',
  setAttendanceRecordDate: (attendanceRecordDate: string) =>
    set({ attendanceRecordDate }),

  isShowBreakAttendanceImportSidebar: false,
  setIsShowBreakAttendanceImportSidebar: (
    isShowBreakAttendanceImportSidebar: boolean,
  ) => {
    set({ isShowBreakAttendanceImportSidebar });
  },
  isShowMobileFilters: false,
  setIsShowMobileFilters: (isShowMobileFilters: boolean) => {
    set({ isShowMobileFilters });
  },
  showViolationFilter: false,
  setShowViolationFilter: (showViolationFilter: boolean) => {
    set({ showViolationFilter });
  },
  selectedRowKeys: [],
  setSelectedRowKeys: (selectedRowKeys: Key[]) => {
    set({ selectedRowKeys });
  },
  isShowEditRuleViolationModal: false,
  setIsShowEditRuleViolationModal: (isShowEditRuleViolationModal: boolean) => {
    set({ isShowEditRuleViolationModal });
  },
  isShowDeleteRuleViolationModal: false,
  setIsShowDeleteRuleViolationModal: (
    isShowDeleteRuleViolationModal: boolean,
  ) => {
    set({ isShowDeleteRuleViolationModal });
  },
  selectedViolationId: '',
  selectedViolationActionTypes: [],
  setSelectedViolation: (id: string, actionTypes: string[]) => {
    set({ selectedViolationId: id, selectedViolationActionTypes: actionTypes });
  },
});

export const useEmployeeAttendanceStore = create<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
>(employeeAttendanceSlice);
