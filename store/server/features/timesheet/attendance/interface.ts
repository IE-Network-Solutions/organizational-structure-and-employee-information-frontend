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
