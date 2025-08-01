export interface AttendanceRequestBody {
  exportType?: 'PDF' | 'EXCEL';
  filter: {
    attendanceRecordIds?: string[];
    userIds?: string[];
    type?: 'late' | 'early' | 'absent' | 'present';
    date?: {
      from: string;
      to: string;
    };
    locations?: string[];
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
}
export interface EditAttendance {
  earlyByMinutes: number;
  lateByMinutes: number;
  endAt: string | null;
  startAt: string | null;
  isAbsent: boolean;
  isOnGoing: boolean;
}
