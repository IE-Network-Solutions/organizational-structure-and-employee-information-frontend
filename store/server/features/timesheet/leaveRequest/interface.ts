import { LeaveRequestStatus } from '@/types/timesheet/settings';

export interface LeaveRequestBody {
  exportType?: 'PDF' | 'EXCEL';
  filter?: {
    leaveRequestsIds?: string[];
    userIds?: string[];
    status?: LeaveRequestStatus;
    date?: {
      from: string;
      to: string;
    };
    leaveTypeIds?: string[];
  };
}

export interface LeaveRequestStatusBody {
  leaveRequestId: string;
  status: 'approved' | 'declined';
}

export interface AllLeaveRequestApproveData {
  userId: string;
  roleId: string;
  page: number;
  limit: number;
}
