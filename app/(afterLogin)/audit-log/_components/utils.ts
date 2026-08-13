import dayjs, { Dayjs } from 'dayjs';
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_LOG_MODULE_OPTIONS,
  AUDIT_MODULE_FIELDS,
  AuditLogFilters,
  AuditSeverity,
  AuditSeverityRule,
  DEFAULT_SEVERITY_RULES,
  PrototypeAuditEvent,
  PrototypeAuditPerson,
} from './types';

export const SENSITIVE_MASK = '••••••••';

export const AUDIT_SELECT_CLASS =
  'w-full h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!max-h-10 [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!py-0 [&_.ant-select-selection-wrap]:!h-full [&_.ant-select-selection-wrap]:!flex [&_.ant-select-selection-wrap]:!items-center [&_.ant-select-selection-overflow]:!h-full [&_.ant-select-selection-overflow]:!flex [&_.ant-select-selection-overflow]:!items-center [&_.ant-select-selection-overflow]:!flex-nowrap [&_.ant-select-selection-item]:!my-0 [&_.ant-select-selection-item]:!leading-[22px] [&_.ant-select-selection-search]:!ml-0 [&_.ant-select-selection-search]:!h-full [&_.ant-select-selection-search]:!flex [&_.ant-select-selection-search]:!items-center [&_.ant-select-selection-search-input]:!h-8 [&.ant-select-multiple_.ant-select-selection-placeholder]:!m-0 [&.ant-select-multiple_.ant-select-selection-placeholder]:!top-1/2 [&.ant-select-multiple_.ant-select-selection-placeholder]:!-translate-y-1/2 [&.ant-select-multiple_.ant-select-selection-placeholder]:!leading-none';

export const formatFullName = (person?: PrototypeAuditPerson | null) => {
  if (!person) return 'Unknown User';
  return (
    `${person.firstName || ''} ${person.lastName || ''}`.trim() ||
    'Unknown User'
  );
};

export const formatShortName = (person?: PrototypeAuditPerson | null) => {
  if (!person) return 'Unknown';
  const lastInitial = person.lastName?.charAt(0);
  if (lastInitial) return `${person.firstName} ${lastInitial}.`;
  return person.firstName || 'Unknown';
};

export const humanizeEntityName = (moduleValue?: string) => {
  if (!moduleValue) return 'Audit Log';
  const knownNames: Record<string, string> = {
    PayrollAuditLog: 'Payroll Audit Log',
    OrgAndEmpAuditLog: 'Org and Emp Audit Log',
    RecruitmentAuditLog: 'Recruitment Audit Log',
    OKRAuditLog: 'OKR Audit Log',
    CFRAuditLog: 'CFR Audit Log',
    TNAAuditLog: 'TNA Audit Log',
    TimesheetAuditLog: 'Timesheet Audit Log',
  };
  if (knownNames[moduleValue]) return knownNames[moduleValue];
  return moduleValue
    .replace(/AuditLog$/, ' Audit Log')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatEventRemark = (
  event: Pick<PrototypeAuditEvent, 'module' | 'actionVerb'>,
) => {
  const action = (event.actionVerb || 'updated').toLowerCase();
  return `${humanizeEntityName(event.module)} ${action}`;
};

export const getModuleFieldOptions = (moduleValue?: string) =>
  (moduleValue ? AUDIT_MODULE_FIELDS[moduleValue] || [] : []).map((field) => ({
    label: field,
    value: field,
  }));

export const getRuleFields = (rule: AuditSeverityRule) => {
  if (rule.fields?.length) return rule.fields;
  if (rule.fieldOrResource) return [rule.fieldOrResource];
  return [];
};

export const formatEventTimestamp = (dateString?: string) => {
  if (!dateString) return '--';
  const parsed = dayjs(dateString);
  return parsed.isValid() ? parsed.format('MMM DD, YYYY HH:mm') : '--';
};

export const getSeverityTagColor = (severity: AuditSeverity) => {
  switch (severity) {
    case 'INFO':
      return 'green';
    case 'MEDIUM':
      return 'gold';
    case 'HIGH':
      return 'orange';
    case 'CRITICAL':
      return 'red';
    default:
      return 'default';
  }
};

export const maskIfSensitive = (value: string, sensitive?: boolean) =>
  sensitive ? SENSITIVE_MASK : value || '--';

export const getModuleLabel = (moduleValue?: string) =>
  AUDIT_LOG_MODULE_OPTIONS.find((module) => module.value === moduleValue)
    ?.label ||
  moduleValue ||
  '--';

export const getActionLabel = (actionVerb?: string) =>
  AUDIT_ACTION_OPTIONS.find((action) => action.value === actionVerb)?.label ||
  (actionVerb
    ? actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)
    : '--');

export const SEVERITY_RULES_STORAGE_KEY = 'audit-log-severity-rules-v5';

const SEVERITY_RANK: Record<AuditSeverity, number> = {
  INFO: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const normalizeKey = (value?: string) =>
  (value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const highestSeverity = (severities: AuditSeverity[]): AuditSeverity =>
  severities.reduce(
    (max, severity) =>
      SEVERITY_RANK[severity] > SEVERITY_RANK[max] ? severity : max,
    severities[0],
  );

export const resolveSeverity = (
  event: Pick<
    PrototypeAuditEvent,
    'module' | 'actionVerb' | 'severity' | 'fieldOrResource' | 'changes'
  >,
  rules: AuditSeverityRule[],
): AuditSeverity => {
  const action = normalizeKey(event.actionVerb);
  const eventFields = [
    event.fieldOrResource,
    ...(event.changes || []).map((change) => change.field),
  ]
    .map((field) => normalizeKey(field))
    .filter(Boolean);

  const matchingSpecific = rules.filter((rule) => {
    const ruleFields = getRuleFields(rule).map((field) => normalizeKey(field));
    return (
      rule.module === event.module &&
      normalizeKey(rule.actionVerb) === action &&
      ruleFields.length > 0 &&
      ruleFields.some((field) => eventFields.includes(field))
    );
  });

  if (matchingSpecific.length > 0) {
    return highestSeverity(matchingSpecific.map((rule) => rule.severity));
  }

  return 'INFO';
};

export const applySeverityRules = (
  events: PrototypeAuditEvent[],
  rules: AuditSeverityRule[],
): PrototypeAuditEvent[] =>
  events.map((event) => ({
    ...event,
    severity: resolveSeverity(event, rules),
  }));

export const loadSeverityRules = (): AuditSeverityRule[] => {
  if (typeof window === 'undefined') return DEFAULT_SEVERITY_RULES;
  try {
    const raw = window.localStorage.getItem(SEVERITY_RULES_STORAGE_KEY);
    if (!raw) return DEFAULT_SEVERITY_RULES;
    const parsed = JSON.parse(raw) as AuditSeverityRule[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_SEVERITY_RULES;
    }
    return parsed.map((rule) => ({
      ...rule,
      fields: getRuleFields(rule),
      fieldOrResource: undefined,
    }));
  } catch {
    return DEFAULT_SEVERITY_RULES;
  }
};

export const saveSeverityRules = (rules: AuditSeverityRule[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    SEVERITY_RULES_STORAGE_KEY,
    JSON.stringify(rules),
  );
};

const normalizeName = (value?: string) =>
  (value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const matchesProfileTarget = (
  event: PrototypeAuditEvent,
  targetId?: string,
  targetName?: string,
) => {
  if (targetId && event.target.id === targetId) return true;

  const profileName = normalizeName(targetName);
  if (!profileName) return false;

  const full = normalizeName(formatFullName(event.target));
  const short = normalizeName(formatShortName(event.target));
  const first = normalizeName(event.target.firstName);

  return (
    full === profileName ||
    short === profileName ||
    profileName === first ||
    full.includes(profileName) ||
    profileName.includes(full)
  );
};

export const uniquePeople = (people: PrototypeAuditPerson[]) => {
  const seen = new Map<string, PrototypeAuditPerson>();
  people.forEach((person) => {
    if (!seen.has(person.id)) seen.set(person.id, person);
  });
  return Array.from(seen.values()).sort((a, b) =>
    formatFullName(a).localeCompare(formatFullName(b)),
  );
};

export const createEmptyAuditFilters = (): AuditLogFilters => ({
  search: '',
  actorId: undefined,
  targetId: undefined,
  severities: [],
  module: undefined,
  dateFrom: null,
  dateTo: null,
});

export const filterAuditEvents = (
  events: PrototypeAuditEvent[],
  filters: AuditLogFilters,
  scope?: { targetId?: string; targetName?: string },
) => {
  const search = filters.search.trim().toLowerCase();
  const dateFrom = filters.dateFrom
    ? dayjs(filters.dateFrom).startOf('day')
    : null;
  const dateTo = filters.dateTo ? dayjs(filters.dateTo).endOf('day') : null;

  return events
    .filter((event) => {
      if (scope?.targetId || scope?.targetName) {
        if (!matchesProfileTarget(event, scope.targetId, scope.targetName)) {
          return false;
        }
      }

      if (search) {
        const haystack = [
          formatFullName(event.actor),
          formatShortName(event.actor),
          formatFullName(event.target),
          formatShortName(event.target),
          event.fieldOrResource,
          event.actionVerb,
          event.moduleLabel,
          event.eventId,
          formatEventRemark(event),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (filters.actorId && event.actor.id !== filters.actorId) return false;
      if (filters.targetId && event.target.id !== filters.targetId)
        return false;
      if (
        filters.severities.length > 0 &&
        !filters.severities.includes(event.severity)
      ) {
        return false;
      }
      if (filters.module && event.module !== filters.module) return false;

      const performedAt = dayjs(event.performedAt);
      if (dateFrom && performedAt.isBefore(dateFrom)) return false;
      if (dateTo && performedAt.isAfter(dateTo)) return false;

      return true;
    })
    .sort(
      (a, b) => dayjs(b.performedAt).valueOf() - dayjs(a.performedAt).valueOf(),
    );
};

const csvCell = (value: string | number | undefined | null) => {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

export const exportAuditEventsCsv = (events: PrototypeAuditEvent[]) => {
  const header = [
    'Event ID',
    'Timestamp',
    'Severity',
    'Actor',
    'Actor Role',
    'Target',
    'Action',
    'Field',
    'Module',
    'Remarks',
  ];
  const rows = events.map((event) =>
    [
      event.eventId,
      formatEventTimestamp(event.performedAt),
      event.severity,
      formatFullName(event.actor),
      event.actor.role || '',
      formatFullName(event.target),
      event.actionVerb,
      event.fieldOrResource,
      event.moduleLabel,
      formatEventRemark(event),
    ]
      .map(csvCell)
      .join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-log-${dayjs().format('YYYY-MM-DD')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const toDayjsRange = (
  dateFrom: string | null,
  dateTo: string | null,
): [Dayjs | null, Dayjs | null] => [
  dateFrom ? dayjs(dateFrom) : null,
  dateTo ? dayjs(dateTo) : null,
];
