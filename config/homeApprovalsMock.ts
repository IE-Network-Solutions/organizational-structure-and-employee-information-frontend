/** Mock data for unified Home Approvals hub (Phase 1 + 2 prototype). */

export type ApprovalModuleKey = 'timesheet' | 'learning' | 'payroll';

export type MockApprovalStatus = 'pending' | 'approved' | 'rejected';

export type MockApprovalRow = {
  id: string;
  employeeName: string;
  summary: string;
  typeLabel: string;
  requestedAt: string;
  status: MockApprovalStatus;
};

export const MOCK_APPROVAL_MODULE_LABELS: Record<ApprovalModuleKey, string> = {
  timesheet: 'Timesheet',
  learning: 'Learning',
  payroll: 'Payroll',
};

/** Static pending counts for tab badges (mock). */
export const MOCK_APPROVAL_PENDING_BY_MODULE: Record<
  ApprovalModuleKey,
  number
> = {
  timesheet: 8,
  learning: 6,
  payroll: 6,
};

export const MOCK_APPROVAL_TOTAL_PENDING = Object.values(
  MOCK_APPROVAL_PENDING_BY_MODULE,
).reduce((sum, n) => sum + n, 0);

export const MOCK_TNA_ROWS: MockApprovalRow[] = [
  {
    id: 'tna-1',
    employeeName: 'Michael Assefa',
    summary: 'Advanced Project Management — Q4 budget',
    typeLabel: 'TNA Request',
    requestedAt: '2026-09-11',
    status: 'pending',
  },
  {
    id: 'tna-2',
    employeeName: 'Liya Mekonnen',
    summary: 'Leadership Essentials — department upskilling',
    typeLabel: 'TNA Request',
    requestedAt: '2026-09-09',
    status: 'pending',
  },
  {
    id: 'tna-3',
    employeeName: 'Yonas Haile',
    summary: 'Data Analytics Certificate',
    typeLabel: 'TNA Request',
    requestedAt: '2026-09-07',
    status: 'pending',
  },
  {
    id: 'tna-4',
    employeeName: 'Meron Desta',
    summary: 'Compliance & Ethics Workshop',
    typeLabel: 'TNA Request',
    requestedAt: '2026-09-05',
    status: 'pending',
  },
];

export const MOCK_TRAINING_ROWS: MockApprovalRow[] = [
  {
    id: 'tr-1',
    employeeName: 'Abel Worku',
    summary: 'External: AWS Solutions Architect',
    typeLabel: 'Training Request',
    requestedAt: '2026-09-13',
    status: 'pending',
  },
  {
    id: 'tr-2',
    employeeName: 'Selam Alemu',
    summary: 'Internal: Customer Service Excellence',
    typeLabel: 'Training Request',
    requestedAt: '2026-09-06',
    status: 'pending',
  },
];

export const MOCK_PAYROLL_ROWS: MockApprovalRow[] = [
  {
    id: 'pr-1',
    employeeName: 'September 2026',
    summary: '248 employees · Open pay period',
    typeLabel: 'Payroll Run',
    requestedAt: '2026-09-28',
    status: 'pending',
  },
  {
    id: 'pr-2',
    employeeName: 'August 2026 (Adjustment)',
    summary: '12 employees · Adjustment run',
    typeLabel: 'Payroll Run',
    requestedAt: '2026-09-05',
    status: 'pending',
  },
  {
    id: 'pr-3',
    employeeName: 'July 2026',
    summary: '241 employees · Closed pay period',
    typeLabel: 'Payroll Run',
    requestedAt: '2026-08-28',
    status: 'pending',
  },
  {
    id: 'pr-4',
    employeeName: 'June 2026',
    summary: '239 employees · Closed pay period',
    typeLabel: 'Payroll Run',
    requestedAt: '2026-07-28',
    status: 'pending',
  },
  {
    id: 'pr-5',
    employeeName: 'May 2026',
    summary: '237 employees · Closed pay period',
    typeLabel: 'Payroll Run',
    requestedAt: '2026-06-28',
    status: 'pending',
  },
  {
    id: 'pr-6',
    employeeName: 'April 2026',
    summary: '235 employees · Closed pay period',
    typeLabel: 'Payroll Run',
    requestedAt: '2026-05-28',
    status: 'pending',
  },
];
