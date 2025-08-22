import { Key } from 'react';
import { create, StateCreator } from 'zustand';

type EmployeeAttendanceState = {
  isShowEmployeeAttendanceSidebar: boolean;
  isAbsent: boolean;
  employeeAttendanceId: string | '';
  employeeId: string;
  isShowBreakAttendanceImportSidebar: boolean;
  isShowMobileFilters: boolean;
};

type EmployeeAttendanceStateAction = {
  setIsShowEmployeeAttendanceSidebar: (
    isShowEmployeeAttendanceSidebar: boolean,
  ) => void;
  setIsAbsent: (isAbsent: boolean) => void;
  setEmployeeAttendanceId: (employeeAttendanceId: string | '') => void;
  setEmployeeId: (employeeId: string) => void;
  setIsShowBreakAttendanceImportSidebar: (
    isShowBreakAttendanceImportSidebar: boolean,
  ) => void;
  filter: any;
  setFilter: (filter: any) => void;
  setIsShowMobileFilters: (isShowMobileFilters: boolean) => void;
  selectedRowKeys: Key[];
  setSelectedRowKeys: (selectedRowKeys: Key[]) => void;
};

const employeeAttendanceSlice: StateCreator<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
> = (set) => ({
  filter: null,
  setFilter: (filter: any) => set({ filter }),
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
  selectedRowKeys: [],
  setSelectedRowKeys: (selectedRowKeys: Key[]) => {
    set({ selectedRowKeys });
  },
});

export const useEmployeeAttendanceStore = create<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
>(employeeAttendanceSlice);
