import { DateInfo } from '@/types/timesheet/dateInfo';
import { StatusBadgeTheme } from '@/components/common/statusBadge';

export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export const LeaveRequestStatusBadgeTheme: Record<
  LeaveRequestStatus,
  StatusBadgeTheme
> = {
  [LeaveRequestStatus.PENDING]: StatusBadgeTheme.secondary,
  [LeaveRequestStatus.APPROVED]: StatusBadgeTheme.success,
  [LeaveRequestStatus.DECLINED]: StatusBadgeTheme.danger,
};

export const LeaveRequestStatusOption: {
  label: string;
  value: LeaveRequestStatus;
}[] = [
  { label: 'Pending', value: LeaveRequestStatus.PENDING },
  { label: 'Approved', value: LeaveRequestStatus.APPROVED },
  { label: 'Declined', value: LeaveRequestStatus.DECLINED },
];

export enum CarryOverPeriod {
  MONTH = 'month',
  YEARS = 'years',
  DAYS = 'days',
}

export enum AccrualRulePeriod {
  MONTHLY = 'monthly',
  YEAR = 'year',
  QUARTER = 'quarter',
}

export interface AllowedArea extends DateInfo {
  id: string;
  title: string;
  tenantId: string;
  distance: number;
  latitude: number;
  longitude: number;
}

export interface CarryOverRule extends DateInfo {
  id: string;
  title: string;
  tenantId: string;
  limit: number;
  expiration: number;
  expirationPeriod: CarryOverPeriod;
  isActive: boolean;
}

export interface LeaveRequest extends DateInfo {
  id: string;
  tenantId: string;
  user: string;
  leaveType: LeaveType | string;
  startAt: string;
  endAt: string;
  isHalfday: boolean;
  justificationNote: string | null;
  justificationDocument: string | null;
  managedBy: string | null;
  status: LeaveRequestStatus;
  days: number;
  comment: string | null;
  commentAttachments: string[];
}

export interface LeaveType extends DateInfo {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  isPaid: boolean;
  accrualRule: AccrualRule | string;
  carryOverRule: CarryOverRule | string;
  maximumAllowedConsecutiveDays: number;
  minimumNotifyingDays: number;
  entitledDaysPerYear: number;
  isDeductible: boolean;
  isActive: boolean;
}

export interface AccrualRule extends DateInfo {
  id: string;
  tenantId: string;
  title: string;
  period: AccrualRulePeriod;
  isActive: boolean;
}
