import { create, StateCreator } from 'zustand';

type EmployeeAttendanceState = {
  isShowEmployeeAttendanceSidebar: boolean;
  employeeAttendanceId: string | null;
  newData: any;
};

type EmployeeAttendanceStateAction = {
  setIsShowEmployeeAttendanceSidebar: (
    isShowEmployeeAttendanceSidebar: boolean,
  ) => void;
  setEmployeeAttendanceId: (employeeAttendanceId: string | null) => void;
  setNewData: (newData: any) => void;
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

  employeeAttendanceId: null,
  setEmployeeAttendanceId: (employeeAttendanceId: string | null) => {
    set({ employeeAttendanceId });
  },
  newData: null,
  setNewData: (newData: any) => {
    set({ newData });
  },
});

export const useEmployeeAttendanceStore = create<
  EmployeeAttendanceState & EmployeeAttendanceStateAction
>(employeeAttendanceSlice);
