export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export type ShiftAssigneeType = 'employee' | 'team' | 'department' | 'position';

export type CalendarViewMode = 'day' | 'week' | 'month';

export type ShiftSwapStatus =
  | 'pending_colleague'
  | 'pending_manager'
  | 'pending_hr'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type ShiftAuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'assigned'
  | 'reassigned'
  | 'copied'
  | 'swap_requested'
  | 'swap_approved'
  | 'swap_rejected'
  | 'swap_cancelled'
  | 'config_updated';

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: number;
  gracePeriodMinutes: number;
  workingDays: WeekDay[];
  overtimeEligible: boolean;
  isNightShift: boolean;
  color: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignment {
  id: string;
  shiftTemplateId: string;
  date: string;
  assigneeType: ShiftAssigneeType;
  assigneeId: string;
  assigneeName: string;
  employeeId: string;
  employeeName: string;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;
  locationName?: string;
  teamId?: string;
  teamName?: string;
  positionId?: string;
  positionName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAssignmentId: string;
  counterpartId: string;
  counterpartName: string;
  counterpartAssignmentId: string;
  reason?: string;
  attachmentName?: string;
  status: ShiftSwapStatus;
  requireColleagueConfirmation: boolean;
  requireManagerApproval: boolean;
  requireHrApproval: boolean;
  colleagueConfirmedAt?: string;
  managerApprovedAt?: string;
  hrApprovedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAuditLog {
  id: string;
  action: ShiftAuditAction;
  entityType: 'template' | 'assignment' | 'swap' | 'config';
  entityId: string;
  actorName: string;
  description: string;
  timestamp: string;
}

export interface ShiftInAppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ShiftSwapApprovalConfig {
  requireColleagueConfirmation: boolean;
  requireManagerApproval: boolean;
  requireHrApproval: boolean;
}

export interface ShiftModuleFilters {
  search: string;
  employeeId?: string;
  departmentId?: string;
  locationId?: string;
  teamId?: string;
  shiftTemplateId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const SHIFT_SWAP_STATUS_LABEL: Record<ShiftSwapStatus, string> = {
  pending_colleague: 'Awaiting Colleague',
  pending_manager: 'Awaiting Manager',
  pending_hr: 'Awaiting HR',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const WEEK_DAY_LABEL: Record<WeekDay, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};
