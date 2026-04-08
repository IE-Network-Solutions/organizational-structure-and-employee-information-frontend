export type DashboardActiveMonth = {
  id: string;
  name: string;
  rangeStart: string;
  rangeEnd: string;
};

/** Backend may return extra fields; map in the UI layer. */
export type ClosedDayInActiveMonth = {
  date?: string;
  name?: string;
  title?: string;
  holidayName?: string;
  holidayDate?: string;
};

export type LeaveByType = {
  leaveTypeId: string;
  leaveTypeTitle: string;
  entitledDaysPerYear: number;
  takenDays: number;
};

export type DashboardEmployeeSummaryUser = {
  userId: string;
  daysPresent: number;
  expectedWorkingDaysInMonth: number;
  lateArrivalsCount: number;
  leavesByType: LeaveByType[];
};

export type DashboardEmployeeSummaryResponse = {
  activeMonth: DashboardActiveMonth;
  closedDaysInActiveMonth: ClosedDayInActiveMonth[];
  users: DashboardEmployeeSummaryUser[];
};

export type DashboardEmployeeSummaryFilter = {
  userIds: string[];
};
