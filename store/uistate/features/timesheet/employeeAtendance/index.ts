import { create, StateCreator } from 'zustand';

type EmployeeAttendanceState = {
  isShowEmployeeAttendanceSidebar: boolean;
  isAbsent: boolean;
  employeeAttendanceId: string | '';
  employeeId: string;
  isShowBreakAttendanceImportSidebar: boolean;
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
  filter:any;
  setFilter: (filter: any) => void;
};

const employeeAttendanceSlice: StateCreator<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
> = (set) => ({
   filter:null,
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
});

export const useEmployeeAttendanceStore = create<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
>(employeeAttendanceSlice);
