import dayjs from 'dayjs';
import {
  ShiftAssignment,
  ShiftModuleFilters,
  ShiftSwapStatus,
  ShiftTemplate,
  WEEK_DAY_LABEL,
  WeekDay,
} from '@/types/timesheet/shiftSwap';
import { StatusBadgeTheme } from '@/components/common/statusBadge';

export type DirectoryPerson = {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;
  locationName?: string;
  teamId?: string;
  teamName?: string;
  positionId?: string;
  positionName?: string;
};

export const getEmployeeDisplayName = (employee: any) =>
  [employee?.firstName, employee?.middleName, employee?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() ||
  employee?.email ||
  'Unknown employee';

export const mapEmployeeToDirectory = (employee: any): DirectoryPerson => {
  const job = employee?.employeeJobInformation?.[0];
  return {
    id: employee.id,
    name: getEmployeeDisplayName(employee),
    departmentId: job?.departmentId || job?.department?.id,
    departmentName: job?.department?.name,
    locationId: job?.branchId || job?.branch?.id || job?.officeId,
    locationName: job?.branch?.name || job?.office?.name,
    teamId: job?.teamId || job?.team?.id || job?.departmentId,
    teamName: job?.team?.name || job?.department?.name,
    positionId: job?.positionId || job?.position?.id,
    positionName: job?.position?.name,
  };
};

export const formatShiftTime = (template?: ShiftTemplate | null) => {
  if (!template) return '--';
  return `${template.startTime} → ${template.endTime}`;
};

export const formatWorkingDays = (days: WeekDay[]) =>
  days.map((day) => WEEK_DAY_LABEL[day]).join(', ');

export const swapStatusTheme = (status: ShiftSwapStatus): StatusBadgeTheme => {
  if (status === 'approved') return StatusBadgeTheme.success;
  if (status === 'rejected' || status === 'cancelled') {
    return StatusBadgeTheme.danger;
  }
  return StatusBadgeTheme.warning;
};

export const matchesFilters = (
  assignment: ShiftAssignment,
  filters: ShiftModuleFilters,
  template?: ShiftTemplate,
) => {
  const query = filters.search.trim().toLowerCase();
  if (query) {
    const haystack = [
      assignment.employeeName,
      assignment.departmentName,
      assignment.locationName,
      assignment.teamName,
      assignment.positionName,
      template?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.employeeId && assignment.employeeId !== filters.employeeId) {
    return false;
  }
  if (
    filters.departmentId &&
    assignment.departmentId !== filters.departmentId
  ) {
    return false;
  }
  if (filters.locationId && assignment.locationId !== filters.locationId) {
    return false;
  }
  if (filters.teamId && assignment.teamId !== filters.teamId) {
    return false;
  }
  if (
    filters.shiftTemplateId &&
    assignment.shiftTemplateId !== filters.shiftTemplateId
  ) {
    return false;
  }
  if (filters.dateFrom && dayjs(assignment.date).isBefore(filters.dateFrom)) {
    return false;
  }
  if (filters.dateTo && dayjs(assignment.date).isAfter(filters.dateTo)) {
    return false;
  }
  return true;
};

export const datesBetween = (from: string, to: string) => {
  const start = dayjs(from);
  const end = dayjs(to);
  const dates: string[] = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    dates.push(cursor.format('YYYY-MM-DD'));
    cursor = cursor.add(1, 'day');
  }
  return dates;
};
