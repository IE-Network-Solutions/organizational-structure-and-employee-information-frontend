import { BreakType } from '@/types/timesheet/breakType';
import { StatusBadgeTheme } from '@/components/common/statusBadge';
import { Geolocation } from '@/types/timesheet/geolocation';
import { DateInfo } from '@/types/commons/dateInfo';
import { Meta } from '@/store/server/features/okrPlanningAndReporting/interface';

export enum AttendanceRecordType {
  LATE = 'late',
  EARLY = 'early',
  ABSENT = 'absent',
  PRESENT = 'present',
  clockedOut = 'clockedOut',
}

export const AttendanceRecordTypeBadgeTheme: Record<
  AttendanceRecordType,
  StatusBadgeTheme
> = {
  [AttendanceRecordType.LATE]: StatusBadgeTheme.warning,
  [AttendanceRecordType.EARLY]: StatusBadgeTheme.warning,
  [AttendanceRecordType.ABSENT]: StatusBadgeTheme.danger,
  [AttendanceRecordType.PRESENT]: StatusBadgeTheme.success,
  [AttendanceRecordType.clockedOut]: StatusBadgeTheme.warning,
};

export const attendanceRecordTypeOption: {
  label: string;
  value: AttendanceRecordType;
  id: string;
}[] = [
  { label: 'Present', id: 'Present', value: AttendanceRecordType.PRESENT },
  { label: 'Absent', id: 'Absent', value: AttendanceRecordType.ABSENT },
  { label: 'Late Clock-in', id: 'late', value: AttendanceRecordType.LATE },
  { label: 'Early Clock-out', id: 'Early', value: AttendanceRecordType.EARLY },
  {
    label: 'Not Clocked-out',
    id: 'clockedOut',
    value: AttendanceRecordType.clockedOut,
  },
];

export enum AttendanceCheckOutSource {
  IMPORTED = 'IMPORTED',
  REMOTE_CHECKED_OUT = 'REMOTE_CHECKED_OUT',
  ATTENDANCE_DEVICE_CHECKED_OUT = 'ATTENDANCE_DEVICE_CHECKED_OUT',
}

export enum AttendanceCheckInSource {
  IMPORTED = 'IMPORTED',
  REMOTE_CHECKED_IN = 'REMOTE_CHECKED_IN',
  ATTENDANCE_DEVICE_CHECKED_IN = 'ATTENDANCE_DEVICE_CHECKED_IN',
}

export const attendanceCheckInSourceLabels: Record<
  AttendanceCheckInSource,
  string
> = {
  [AttendanceCheckInSource.IMPORTED]: 'Imported',
  [AttendanceCheckInSource.REMOTE_CHECKED_IN]: 'Remote',
  [AttendanceCheckInSource.ATTENDANCE_DEVICE_CHECKED_IN]: 'Attendance Device',
};

export const attendanceCheckOutSourceLabels: Record<
  AttendanceCheckOutSource,
  string
> = {
  [AttendanceCheckOutSource.IMPORTED]: 'Imported',
  [AttendanceCheckOutSource.REMOTE_CHECKED_OUT]: 'Remote',
  [AttendanceCheckOutSource.ATTENDANCE_DEVICE_CHECKED_OUT]: 'Attendance Device',
};

export interface AttendanceRecord extends DateInfo {
  id: string;
  userId: string;
  tenantId: string;
  startAt: string;
  endAt: string;
  lateByMinutes: number;
  geolocations: Geolocation[];
  attendanceBreaks: AttendanceBreak[];
  earlyByMinutes: number;
  isAbsent: boolean;
  isOnGoing: boolean;
  checkInSource?: AttendanceCheckInSource;
  checkOutSource?: AttendanceCheckOutSource;
  overTimeMinutes: number;
  attendanceImportId: string | null;
  import: AttendanceImport;
}
export interface PaginateAttendanceRecord extends DateInfo {
  items: AttendanceRecord[];
  meta: Meta;
}
export interface AttendanceBreak extends DateInfo {
  id: string;
  tenantId: string;
  breakType: BreakType;
  breakTypeId: string | null;
  isOnGoing: boolean;
  startAt: string;
  endAt: string | null;
  attendanceRecordId: string;
  geolocations: Geolocation[];
  earlyByMinutes: number;
  lateByMinutes: number;
}

export interface AttendanceImport extends DateInfo {
  id: string;
  tenantId: string;
  fileName: string;
  filePath: string;
  AttendanceRecordId: string;
}

export enum AttendanceTypeUnit {
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
  QUARTALS = 'quartals',
  YEARS = 'years',
}

export interface AttendanceNotificationType extends DateInfo {
  id: string;
  title: string;
  unit: AttendanceTypeUnit;
  attendanceRules: AttendanceRule[];
  isActive: boolean;
}

export enum AttendanceActionType {
  WARNING_LETTER = 'WARNING_LETTER',
  REPRIMAND = 'REPRIMAND',
  SALARY_DEDUCTION = 'SALARY_DEDUCTION',
  VP_DEDUCTION = 'VP_DEDUCTION',
}

export interface AttendanceRule extends DateInfo {
  id: string;
  name: string;
  description: string;
  effectiveStartDate: string;
  resetDays: number;
  ruleAppliedDays: number;
  isFixed?: boolean;
  deductibleFixedAmount?: number;
  deductibleSalaryDays?: number;
  vpDeductionAmount?: number;
  ruleType: string | AttendanceRuleTypes;
  actionTypes: AttendanceActionType | string;
  letterTemplate?: string;
  breakType?: string | BreakType;
}

export enum AttendanceRuleType {
  EARLY_CLOCK_OUT = 'EARLY_CLOCK_OUT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  MISSED_CHECK_IN_OUT = 'MISSED_CHECK_IN_OUT',
  BREAK = 'BREAK',
}

export interface AttendanceRuleTypes extends DateInfo {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  isBreak: boolean;
  ruleType: AttendanceRuleType | string;
}

export interface AttendanceRule {
  id: string;
  name: string;
  description: string;
  effectiveStartDate: string;
  resetDays: number;
  ruleAppliedDays: number;
  isFixed?: boolean;
  deductibleFixedAmount?: number;
  deductibleSalaryDays?: number;
  vpDeductionAmount?: number;
  actionTypes: AttendanceActionType | string;
  letterTemplate?: string;
  breakTypeId: string;
  attendanceRuleTypeId: string;
}

export interface AttendanceRuleViolation extends DateInfo {
  id: string;
  userId: string;
  tenantId: string;
  attendanceRuleId: string;
  actionTypes: string[];
  actionTaken: boolean;
  actionTakenAt: string | null;
  attendanceRule: AttendanceRule;
  attendanceRuleTypes?: AttendanceRuleTypes;
  logs: unknown[];
}
