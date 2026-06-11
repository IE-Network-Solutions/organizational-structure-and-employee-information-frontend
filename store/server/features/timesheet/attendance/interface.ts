import {
  AttendanceCheckInSource,
  AttendanceCheckOutSource,
} from '@/types/timesheet/attendance';

export interface AttendanceRequestBody {
  exportType?: 'PDF' | 'EXCEL';
  filter: {
    attendanceRecordIds?: string[];
    userIds?: string[];
    type?: 'late' | 'early' | 'absent' | 'present' | '';
    breakTypeId?: string;
    date?: {
      from: string;
      to: string;
    };
    clockedOut?: boolean;
    locations?: string[];
    checkInSource?: AttendanceCheckInSource;
    checkOutSource?: AttendanceCheckOutSource;
  };
  data?: Array<{
    id: string;
    userId: string;
    startAt: string;
    endAt: string;
    earlyByMinutes: number;
    lateByMinutes: number;
    overTimeMinutes: number;
    isAbsent: boolean;
    isOnGoing: boolean;
    createdAt: string;
    updatedAt: string;
    geolocations: any[];
    attendanceBreaks: any[];
  }>;
}

export interface AttendanceImportLogsBody {
  filter: {
    date: {
      from: string;
      to: string;
    };
  };
}

export interface AttendanceSetShiftRequestBody {
  latitude: number;
  longitude: number;
  file?: string;
  isSignIn?: boolean;
  breakTypeId?: string;
  userId: string;
  departmentId?: string;
}
export interface EditAttendance {
  earlyByMinutes: number;
  lateByMinutes: number;
  endAt: string | null;
  startAt: string | null;
  isAbsent: boolean;
  isOnGoing: boolean;
}

export interface EditRuleViolation {
  actionTypes: string[];
}

export type ExportWarningLetterFormat = 'PDF' | 'DOCX';

export interface ExportWarningLetterBody {
  violationId: string;
  format: ExportWarningLetterFormat;
}

export type RuleViolationQueryParams = {
  page?: number | string;
  limit?: number | string;
  search?: string;
  userId?: string;
  attendanceRuleId?: string;
  ruleTypeId?: string;
  actionTaken?: boolean;
  actionType?: string;
  actionTypes?: string;
  from?: string;
  to?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
};

export interface ZKTAttendanceRequestBody {
  passUrl: string;
  ZKTToken: string;
  filter: {
    date: {
      from: string;
      to: string;
    };
  };
}
