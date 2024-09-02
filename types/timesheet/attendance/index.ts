import { DateInfo } from '@/types/timesheet/dateInfo';
import { BreakType } from '@/types/timesheet/breakType';

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
  overTimeMinutes: number;
  attendanceImportId: string | null;
  import: AttendanceImport;
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

export interface AttendanceNotificationType extends DateInfo {
  id: string;
  title: string;
  unit: 'hours' | 'days' | 'weeks' | 'quartals' | 'years';
  attendanceNotificationRule: AttendanceNotificationRule[];
  isActive: boolean;
}

export interface AttendanceNotificationRule extends DateInfo {
  id: string;
  title: string;
  description: string;
  attendanceNotificationId: string;
  value: number;
}
