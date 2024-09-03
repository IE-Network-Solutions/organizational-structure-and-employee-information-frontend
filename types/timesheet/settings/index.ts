import { DateInfo } from '@/types/timesheet/dateInfo';

export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export enum CarryOverPeriod {
  MONTH = 'month',
  YEARS = 'years',
  DAYS = 'days',
}

export interface AllowedArea extends DateInfo {
  id: string;
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
  userId: string;
  leaveType: LeaveType;
  leaveTypeId: string;
  startAt: string;
  endAt: string;
  isHalfDay: boolean;
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
  accrualRule: AccrualRule;
  accrualRuleId: string;
  caryOverRule: CarryOverRule;
  caryOverRuleId: string;
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
  period: CarryOverPeriod;
  isActive: boolean;
}
