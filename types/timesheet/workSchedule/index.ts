export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type ShiftType = 'FULL_DAY' | 'AM_HALF' | 'PM_HALF' | 'CUSTOM';

export const SHIFT_NAME_PRESETS = [
  'Morning',
  'Afternoon',
  'Evening',
  'Night',
  'Custom',
] as const;

export type ShiftNamePreset = (typeof SHIFT_NAME_PRESETS)[number];

export type SwapRequestStatus =
  | 'PENDING_PEER'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'REJECTED_PEER'
  | 'REJECTED_ADMIN'
  | 'EXPIRED'
  | 'CANCELLED';

export interface MockEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
}

export interface WorkScheduleShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  weekdays: Weekday[];
}

export interface WorkScheduleBlueprint {
  id: string;
  title: string;
  hasShifts: boolean;
  isSwappable: boolean;
  activeWeekdays: Weekday[];
  defaultStartTime: string;
  defaultEndTime: string;
  shifts: WorkScheduleShift[];
  createdAt: string;
}

export type CreateBlueprintInput = Omit<
  WorkScheduleBlueprint,
  'id' | 'createdAt'
>;
export type UpdateBlueprintInput = Partial<CreateBlueprintInput>;

export interface BlueprintAssignment {
  id: string;
  blueprintId: string;
  userId: string;
  shiftIds: string[];
  assignedFrom?: string;
  assignedTo?: string;
}

export interface ShiftInstance {
  id: string;
  blueprintId: string;
  assignedUserId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
  shiftId?: string;
  shiftName?: string;
  isSwappable: boolean;
  isCancelled: boolean;
  isOverridden: boolean;
  swappedAt?: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterShiftId: string;
  targetShiftId: string;
  requesterId: string;
  targetUserId: string;
  status: SwapRequestStatus;
  reason?: string;
  peerAcceptedAt?: string;
  adminApprovedAt?: string;
  adminRejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface WeeklyHoursImpact {
  requesterBefore: number;
  requesterAfter: number;
  targetBefore: number;
  targetAfter: number;
  overtimeTriggered: boolean;
  overtimeUserIds: string[];
}

export interface ShiftInstanceView extends ShiftInstance {
  employee: MockEmployee;
  blueprintTitle: string;
  hasShifts: boolean;
}

export interface SwapRequestView extends ShiftSwapRequest {
  requester: MockEmployee;
  target: MockEmployee;
  requesterShift: ShiftInstanceView;
  targetShift: ShiftInstanceView;
  impact: WeeklyHoursImpact;
}

export interface InstanceFilters {
  userId?: string;
  blueprintId?: string;
  from?: string;
  to?: string;
  includeCancelled?: boolean;
}

export interface SwapFilters {
  status?: SwapRequestStatus | SwapRequestStatus[];
  userId?: string;
}

export const OVERTIME_THRESHOLD_HOURS = 40;

export const DEMO_LOGGED_IN_EMPLOYEE_ID = 'emp-1';

export const SHIFT_TYPE_LABEL: Record<ShiftType, string> = {
  FULL_DAY: 'Full Day',
  AM_HALF: 'AM Half-Day',
  PM_HALF: 'PM Half-Day',
  CUSTOM: 'Custom',
};

export const SWAP_STATUS_LABEL: Record<SwapRequestStatus, string> = {
  PENDING_PEER: 'Pending peer',
  PENDING_ADMIN: 'Pending admin',
  APPROVED: 'Approved',
  REJECTED_PEER: 'Rejected by peer',
  REJECTED_ADMIN: 'Rejected by admin',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};
