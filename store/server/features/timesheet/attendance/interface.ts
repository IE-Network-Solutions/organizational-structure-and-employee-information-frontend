export interface AttendanceRequestBody {
  isExport: boolean;
  filter: {
    attendanceRecordIds?: string[];
    userIds?: string[];
    type?: 'late' | 'early' | 'absent';
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
