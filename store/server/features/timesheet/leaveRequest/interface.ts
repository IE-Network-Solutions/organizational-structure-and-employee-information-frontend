import { LeaveRequestStatus } from '@/types/timesheet/settings';

export interface LeaveRequestBody {
  isExport?: boolean;
  filter?: {
    leaveRequestIds: string[];
    userIds: string[];
    status: LeaveRequestStatus;
    date: {
      from: string;
      to: string;
    };
    leaveTypesIds: string[];
  };
}

export interface LeaveRequestStatusBody {
  leaveRequestId: string;
  status: 'approved' | 'declined';
}
