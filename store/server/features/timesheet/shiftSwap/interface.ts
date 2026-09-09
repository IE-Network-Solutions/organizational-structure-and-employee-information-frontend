export interface ShiftSwapRequestBody {
  filter?: {
    userIds?: string[];
    status?: string;
  };
}

export interface CreateShiftSwapRequestPayload {
  peerUserId: string;
  targetShiftId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  approvalType?: string;
  approvalWorkflowId?: string;
}

export interface MyScheduleDay {
  date: string;
  dayOfWeek?: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  shiftId?: string;
  isOverride?: boolean;
  breaks?: Array<{
    id?: string;
    breakTypeId?: string;
    title?: string | null;
    startAt: string;
    endAt: string;
    startAtFrom?: string | null;
    startAtTo?: string | null;
    endAtFrom?: string | null;
    endAtTo?: string | null;
  }>;
}
