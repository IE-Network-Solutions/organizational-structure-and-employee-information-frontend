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
  eventSummary?: string;
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

export const AUDIT_SEVERITY_LABELS: Record<AuditSeverity, string> = {
  INFO: 'Informative',
  MEDIUM: 'Warning',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

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
  { label: 'Create', value: 'created' },
  { label: 'Update', value: 'updated' },
  { label: 'Delete', value: 'deleted' },
];

export const DEFAULT_SEVERITY_RULES: AuditSeverityRule[] = [];
