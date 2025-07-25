import { create } from 'zustand';

export interface TimeAndAttendanceDashboardUseState {
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
  startDate: string;
  endDate: string;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  userIdOnLeave: string;
  setUserIdOnLeave: (userIdOnLeave: string) => void;
  departmentOnLeave: string;
  setDepartmentOnLeave: (departmentOnLeave: string) => void;
  departmentOnLeaveGraph: string;
  setDepartmentOnLeaveGraph: (departmentOnLeaveGraph: string) => void;
  departmentOnAttendanceReport: string;
  setDepartmentOnAttendanceReport: (
    departmentOnAttendanceReport: string,
  ) => void;
  startDateAttendanceReport: string;
  endDateAttendanceReport: string;
  setStartDateAttendanceReport: (startDateAttendanceReport: string) => void;
  setEndDateAttendanceReport: (endDateAttendanceReport: string) => void;
  userIdOnLeaveRequest: string;
  setUserIdOnLeaveRequest: (userIdOnLeaveRequest: string) => void;
  startDateOnLeaveRequest: string;
  endDateOnLeaveRequest: string;
  setStartDateOnLeaveRequest: (startDateOnLeaveRequest: string) => void;
  setEndDateOnLeaveRequest: (endDateOnLeaveRequest: string) => void;
  departmentOnLeaveRequest: string;
  setDepartmentOnLeaveRequest: (departmentOnLeaveRequest: string) => void;
  employeeIdOnAttendance: string;
  setEmployeeIdOnAttendance: (employeeId: string) => void;
  departmentOnAttendance: string;
  setDepartmentOnAttendance: (departmentId: string) => void;
  startDateOnAttendance: string;
  setStartDateOnAttendance: (startDate: string) => void;
  endDateOnAttendance: string;
  setEndDateOnAttendance: (endDate: string) => void;
  searchOnAttendance: string;
  setsearchOnAttendance: (searchOnAttendance: string) => void;
  pageSizeOnAttendance: number;
  setPageSizeOnAttendance: (pageSizeOnAttendance: number) => void;
  currentPageOnAttendance: number;
  setCurrentPageOnAttendance: (currentPageOnAttendance: number) => void;
  leaveTypeId: string;
  setLeaveTypeId: (LeaveTypeId: string) => void;
  userIdOnLeaveBalance: string;
  setUserIdOnLeaveBalance: (userIdOnLeaveBalance: string) => void;
  statusOnAttendance: string;
  setStatusOnAttendance: (statusOnAttendance: string) => void;
  // handleSearchChange:(item:string,value:any)=>void;
}

export const TimeAndAttendaceDashboardStore =
  create<TimeAndAttendanceDashboardUseState>((set) => ({
    activeTab: 'admin',
    setActiveTab: (activeTab: string) => set({ activeTab }),
    startDate: '',
    endDate: '',
    setStartDate: (startDate: string) => set({ startDate }),
    setEndDate: (endDate: string) => set({ endDate }),
    userIdOnLeave: '',
    setUserIdOnLeave: (userIdOnLeave: string) => set({ userIdOnLeave }),
    departmentOnLeave: '',
    setDepartmentOnLeave: (departmentOnLeave: string) =>
      set({ departmentOnLeave }),
    departmentOnLeaveGraph: '',
    setDepartmentOnLeaveGraph: (departmentOnLeaveGraph: string) =>
      set({ departmentOnLeaveGraph }),
    departmentOnAttendanceReport: '',
    setDepartmentOnAttendanceReport: (departmentOnAttendanceReport: string) =>
      set({ departmentOnAttendanceReport }),
    startDateAttendanceReport: '',
    setStartDateAttendanceReport: (startDateAttendanceReport: string) =>
      set({ startDateAttendanceReport }),
    endDateAttendanceReport: '',
    setEndDateAttendanceReport: (endDateAttendanceReport: string) =>
      set({ endDateAttendanceReport }),
    userIdOnLeaveRequest: '',
    setUserIdOnLeaveRequest: (userIdOnLeaveRequest: string) =>
      set({ userIdOnLeaveRequest }),
    startDateOnLeaveRequest: '',
    setStartDateOnLeaveRequest: (startDateOnLeaveRequest: string) =>
      set({ startDateOnLeaveRequest }),
    endDateOnLeaveRequest: '',
    setEndDateOnLeaveRequest: (endDateOnLeaveRequest: string) =>
      set({ endDateOnLeaveRequest }),
    departmentOnLeaveRequest: '',
    setDepartmentOnLeaveRequest: (departmentOnLeaveRequest: string) =>
      set({ departmentOnLeaveRequest }),
    employeeIdOnAttendance: '',
    setEmployeeIdOnAttendance: (employeeIdOnAttendance: string) =>
      set({ employeeIdOnAttendance }),
    departmentOnAttendance: '',
    setDepartmentOnAttendance: (departmentOnAttendance: string) =>
      set({ departmentOnAttendance }),
    startDateOnAttendance: '',
    setStartDateOnAttendance: (startDateOnAttendance: string) =>
      set({ startDateOnAttendance }),
    endDateOnAttendance: '',
    setEndDateOnAttendance: (endDateOnAttendance: string) =>
      set({ endDateOnAttendance }),
    searchOnAttendance: '',
    setsearchOnAttendance: (searchOnAttendance: string) =>
      set({ searchOnAttendance }),
    pageSizeOnAttendance: 10,
    setPageSizeOnAttendance: (pageSizeOnAttendance: number) =>
      set({ pageSizeOnAttendance }),
    currentPageOnAttendance: 1,
    setCurrentPageOnAttendance: (currentPageOnAttendance: number) =>
      set({ currentPageOnAttendance }),
    leaveTypeId: '',
    setLeaveTypeId: (leaveTypeId: string) => set({ leaveTypeId }),
    userIdOnLeaveBalance: '',
    setUserIdOnLeaveBalance: (userIdOnLeaveBalance: string) =>
      set({ userIdOnLeaveBalance }),
    statusOnAttendance: '',
    setStatusOnAttendance: (statusOnAttendance: string) =>
      set({ statusOnAttendance }),
  }));
