export type AuditSeverity = 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PrototypeAuditPerson {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role?: string;
  isSystem?: boolean;
}

export interface PrototypeAuditChange {
  field: string;
  previous: string;
  next: string;
  sensitive?: boolean;
}

export interface PrototypeAuditEvent {
  id: string;
  eventId: string;
  performedAt: string;
  severity: AuditSeverity;
  actor: PrototypeAuditPerson;
  target: PrototypeAuditPerson;
  actionVerb: string;
  fieldOrResource: string;
  module: string;
  moduleLabel: string;
  ipAddress: string;
  geoLocation: string;
  browser: string;
  os: string;
  sessionId: string;
  changes: PrototypeAuditChange[];
  remarks?: string;
}

export interface AuditLogFilters {
  search: string;
  actorId?: string;
  targetId?: string;
  action?: string;
  severities: AuditSeverity[];
  module?: string;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface AuditSeverityRule {
  id: string;
  module: string;
  actionVerb: string;
  /** Specific fields in the module. Empty = any field (general module + action rule). */
  fields?: string[];
  /** @deprecated Prefer `fields`. Kept for older saved rules. */
  fieldOrResource?: string;
  severity: AuditSeverity;
}

export const AUDIT_SEVERITIES: AuditSeverity[] = [
  'INFO',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

export const AUDIT_LOG_MODULE_OPTIONS = [
  { label: 'Employee Management', value: 'OrgAndEmpAuditLog' },
  { label: 'Talent Acquisition', value: 'RecruitmentAuditLog' },
  { label: 'OKR', value: 'OKRAuditLog' },
  { label: 'CFR', value: 'CFRAuditLog' },
  { label: 'Learning & Growth', value: 'TNAAuditLog' },
  { label: 'Payroll', value: 'PayrollAuditLog' },
  { label: 'Time and attendance', value: 'TimesheetAuditLog' },
];

export const AUDIT_ACTION_OPTIONS = [
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Deleted', value: 'deleted' },
];

export const AUDIT_MODULE_FIELDS: Record<string, string[]> = {
  OrgAndEmpAuditLog: [
    'First Name',
    'Middle Name',
    'Last Name',
    'Email',
    'Phone Number',
    'Gender',
    'Date of Birth',
    'Nationality',
    'Marital Status',
    'Address',
    'Emergency Contact',
    'Bank Information',
    'Additional Information',
    'Employee Information',
    'Profile Image',
    'Department',
    'Position',
    'Job Title',
    'Branch',
    'Employment Type',
    'Contract Type',
    'Employment Status',
    'Joined Date',
    'Role Permission',
    'Work Schedule',
    'User Account',
    'Documents',
  ],
  PayrollAuditLog: [
    'Salary',
    'Basic Salary',
    'Gross Salary',
    'Net Pay',
    'Bank Account',
    'Bank Name',
    'TIN',
    'Pension',
    'Allowance',
    'Deduction',
    'Overtime',
    'Bonus',
    'Tax',
    'Pay Period',
    'Pay Date',
  ],
  TimesheetAuditLog: [
    'Work Schedule',
    'Shift',
    'Check-in Time',
    'Check-out Time',
    'Attendance Record',
    'Attendance Violation',
    'Break Time',
    'Overtime Hours',
    'Leave Request',
    'Leave Balance',
    'Closed Date',
  ],
  RecruitmentAuditLog: [
    'Candidate Profile',
    'Resume',
    'Application',
    'Job Posting',
    'Interview Status',
    'Interview Score',
    'Offer Letter',
    'Offer Status',
    'Proposed Salary',
    'Hiring Stage',
    'Talent Pool',
  ],
  OKRAuditLog: [
    'Objective',
    'Key Result',
    'OKR Progress',
    'OKR Weight',
    'Assigned To',
    'Due Date',
    'OKR Status',
    'Milestone',
  ],
  CFRAuditLog: [
    'Feedback',
    'Recognition',
    'Comment',
    'Conversation',
    'Appreciation',
    'Coaching Note',
  ],
  TNAAuditLog: [
    'Training Plan',
    'Training Request',
    'Course',
    'Course Status',
    'Training Budget',
    'Certificate',
    'Learning Path',
    'Skill Assessment',
  ],
};

export const AUDIT_FIELD_OPTIONS = Object.values(AUDIT_MODULE_FIELDS)
  .flat()
  .filter((field, index, all) => all.indexOf(field) === index)
  .sort((a, b) => a.localeCompare(b))
  .map((field) => ({ label: field, value: field }));

export const DEFAULT_SEVERITY_RULES: AuditSeverityRule[] = [];
