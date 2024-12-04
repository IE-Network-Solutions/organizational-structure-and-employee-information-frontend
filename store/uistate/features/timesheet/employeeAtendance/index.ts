import { create, StateCreator } from 'zustand';

type EmployeeAttendanceState = {
  isShowEmployeeAttendanceSidebar: boolean;
  isAbsent: boolean;
  employeeAttendanceId: string | '';
};

type EmployeeAttendanceStateAction = {
  setIsShowEmployeeAttendanceSidebar: (
    isShowEmployeeAttendanceSidebar: boolean,
  ) => void;
  setIsAbsent: (isAbsent: boolean) => void;
  setEmployeeAttendanceId: (employeeAttendanceId: string | '') => void;
};

const employeeAttendanceSlice: StateCreator<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
> = (set) => ({
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
});

export const useEmployeeAttendanceStore = create<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
>(employeeAttendanceSlice);
