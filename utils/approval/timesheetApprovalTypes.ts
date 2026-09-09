export type TimesheetApprovalTypeValue = 'Leave' | 'WorkFromHome' | 'ShiftSwap';

export const DEFAULT_TIMESHEET_APPROVAL_TYPES: TimesheetApprovalTypeValue[] = [
  'Leave',
  'WorkFromHome',
  'ShiftSwap',
];

export const TIMESHEET_APPROVAL_TYPE_OPTIONS: {
  label: string;
  value: TimesheetApprovalTypeValue;
}[] = [
  { label: 'Leave', value: 'Leave' },
  { label: 'Work From Home', value: 'WorkFromHome' },
  { label: 'Shift Swap', value: 'ShiftSwap' },
];

export function formatTimesheetApprovalType(value: string): string {
  if (value === 'WorkFromHome') return 'Work From Home';
  if (value === 'ShiftSwap') return 'Shift Swap';
  return value;
}
