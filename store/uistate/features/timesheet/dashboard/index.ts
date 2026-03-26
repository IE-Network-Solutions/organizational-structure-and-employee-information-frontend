import { create } from 'zustand';

export interface TimeAndAttendanceDashboardUseState {
  todaysAttendancePeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null;
  setTodaysAttendancePeriod: (
    todaysAttendancePeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null,
  ) => void;
  todaysAttendanceSelectedChip: string | null;
  setTodaysAttendanceSelectedChip: (
    todaysAttendanceSelectedChip: string | null,
  ) => void;
  todaysAttendanceDisplayPeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null;
  setTodaysAttendanceDisplayPeriod: (
    todaysAttendanceDisplayPeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null,
  ) => void;
  todaysAttendanceChipsAnim: 'in' | 'out';
  setTodaysAttendanceChipsAnim: (
    todaysAttendanceChipsAnim: 'in' | 'out',
  ) => void;
  hireResignationTrendRange: [string, string] | null;
  setHireResignationTrendRange: (
    hireResignationTrendRange: [string, string] | null,
  ) => void;
  hireResignationTrendIsMobile: boolean;
  setHireResignationTrendIsMobile: (
    hireResignationTrendIsMobile: boolean,
  ) => void;
  leaveChartPeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null;
  setLeaveChartPeriod: (
    leaveChartPeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null,
  ) => void;
  leaveChartSelectedChip: string | null;
  setLeaveChartSelectedChip: (leaveChartSelectedChip: string | null) => void;
  leaveChartDisplayPeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null;
  setLeaveChartDisplayPeriod: (
    leaveChartDisplayPeriod: 'Day' | 'Month' | 'Year' | 'Custom' | null,
  ) => void;
  leaveChartChipsAnim: 'in' | 'out';
  setLeaveChartChipsAnim: (leaveChartChipsAnim: 'in' | 'out') => void;
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
  leaveTypeOnLeave: string;
  setLeaveTypeOnLeave: (leaveTypeOnLeave: string) => void;
  departmentOnLeaveGraph: string;
  setDepartmentOnLeaveGraph: (departmentOnLeaveGraph: string) => void;
  departmentOnAttendanceReport: string;
  setDepartmentOnAttendanceReport: (
    departmentOnAttendanceReport: string,
  ) => void;
  userIdOnAttendanceReport: string;
  setUserIdOnAttendanceReport: (userIdOnAttendanceReport: string) => void;
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
  leaveTypeOnLeaveRequest: string;
  setLeaveTypeOnLeaveRequest: (leaveTypeOnLeaveRequest: string) => void;
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
  currentStatusOnAttendance: string;
  setCurrentStatusOnAttendance: (currentStatusOnAttendance: string) => void;
  // handleSearchChange:(item:string,value:any)=>void;
  monthsAheadOnLeaveBalanceExpiring: string;
  setMonthsAheadOnLeaveBalanceExpiring: (
    monthsAheadOnLeaveBalanceExpiring: string,
  ) => void;
}

export const TimeAndAttendaceDashboardStore =
  create<TimeAndAttendanceDashboardUseState>((set) => ({
    todaysAttendancePeriod: null,
    setTodaysAttendancePeriod: (todaysAttendancePeriod) =>
      set({ todaysAttendancePeriod }),
    todaysAttendanceSelectedChip: null,
    setTodaysAttendanceSelectedChip: (todaysAttendanceSelectedChip) =>
      set({ todaysAttendanceSelectedChip }),
    todaysAttendanceDisplayPeriod: null,
    setTodaysAttendanceDisplayPeriod: (todaysAttendanceDisplayPeriod) =>
      set({ todaysAttendanceDisplayPeriod }),
    todaysAttendanceChipsAnim: 'in',
    setTodaysAttendanceChipsAnim: (todaysAttendanceChipsAnim) =>
      set({ todaysAttendanceChipsAnim }),
    hireResignationTrendRange: null,
    setHireResignationTrendRange: (hireResignationTrendRange) =>
      set({ hireResignationTrendRange }),
    hireResignationTrendIsMobile: false,
    setHireResignationTrendIsMobile: (hireResignationTrendIsMobile) =>
      set({ hireResignationTrendIsMobile }),
    leaveChartPeriod: null,
    setLeaveChartPeriod: (leaveChartPeriod) => set({ leaveChartPeriod }),
    leaveChartSelectedChip: null,
    setLeaveChartSelectedChip: (leaveChartSelectedChip) =>
      set({ leaveChartSelectedChip }),
    leaveChartDisplayPeriod: null,
    setLeaveChartDisplayPeriod: (leaveChartDisplayPeriod) =>
      set({ leaveChartDisplayPeriod }),
    leaveChartChipsAnim: 'in',
    setLeaveChartChipsAnim: (leaveChartChipsAnim) =>
      set({ leaveChartChipsAnim }),
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
    leaveTypeOnLeave: '',
    setLeaveTypeOnLeave: (leaveTypeOnLeave: string) =>
      set({ leaveTypeOnLeave }),
    departmentOnLeaveGraph: '',
    setDepartmentOnLeaveGraph: (departmentOnLeaveGraph: string) =>
      set({ departmentOnLeaveGraph }),
    departmentOnAttendanceReport: '',
    setDepartmentOnAttendanceReport: (departmentOnAttendanceReport: string) =>
      set({ departmentOnAttendanceReport }),
    userIdOnAttendanceReport: '',
    setUserIdOnAttendanceReport: (userIdOnAttendanceReport: string) =>
      set({ userIdOnAttendanceReport }),
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
    leaveTypeOnLeaveRequest: '',
    setLeaveTypeOnLeaveRequest: (leaveTypeOnLeaveRequest: string) =>
      set({ leaveTypeOnLeaveRequest }),
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
    currentStatusOnAttendance: '',
    setCurrentStatusOnAttendance: (currentStatusOnAttendance: string) =>
      set({ currentStatusOnAttendance }),
    monthsAheadOnLeaveBalanceExpiring: '3',
    setMonthsAheadOnLeaveBalanceExpiring: (
      monthsAheadOnLeaveBalanceExpiring: string,
    ) => set({ monthsAheadOnLeaveBalanceExpiring }),
  }));
