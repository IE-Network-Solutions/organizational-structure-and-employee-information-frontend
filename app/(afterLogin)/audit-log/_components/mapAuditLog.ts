import { AuditLog } from '@/types/tenant-management';
import {
  PrototypeAuditChange,
  PrototypeAuditEvent,
  PrototypeAuditPerson,
} from './types';
import { getModuleLabel, humanizeAuditLabel } from './utils';

const SKIP_FIELD =
  /^(id|createdat|updatedat|deletedat|createdby|updatedby|deletedby|tenantid)$/i;
const SKIP_ID_SUFFIX = /(id|uuid|identifier)$/i;
const SENSITIVE_FIELD =
  /(password|secret|token|salary|accountnumber|bank|tin|pension|ssn|pin)/i;

const ACTION_TO_VERB: Record<string, string> = {
  create: 'created',
  created: 'created',
  update: 'updated',
  updated: 'updated',
  delete: 'deleted',
  deleted: 'deleted',
  read: 'read',
};

export const ACTION_TO_API: Record<string, string> = {
  created: 'CREATE',
  updated: 'UPDATE',
  deleted: 'DELETE',
  create: 'CREATE',
  update: 'UPDATE',
  delete: 'DELETE',
};

const unknownPerson = (id?: string): PrototypeAuditPerson => ({
  id: id || 'unknown',
  firstName: 'Unknown',
  lastName: 'User',
});

const systemPerson = (): PrototypeAuditPerson => ({
  id: 'user-system',
  firstName: 'System',
  lastName: '',
  isSystem: true,
});

const toPerson = (
  user?: AuditLog['performedByUser'] | AuditLog['targetUser'] | null,
  fallbackId?: string,
): PrototypeAuditPerson => {
  if (!user && !fallbackId) return unknownPerson();
  if (!user) return unknownPerson(fallbackId);
  return {
    id: user.id || fallbackId || 'unknown',
    firstName: user.firstName || 'Unknown',
    lastName: user.lastName || '',
    profileImage: user.profileImage,
    role: user.role,
  };
};

const shouldSkipField = (key: string) => {
  const compact = key.replace(/[_-\s]/g, '');
  return SKIP_FIELD.test(compact) || SKIP_ID_SUFFIX.test(compact);
};

const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '--';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const valuesEqual = (left: unknown, right: unknown) =>
  stringifyValue(left) === stringifyValue(right);

export const diffAuditValues = (
  previousValue?: Record<string, any> | null,
  newValue?: Record<string, any> | null,
): PrototypeAuditChange[] => {
  const previous =
    previousValue && typeof previousValue === 'object' ? previousValue : {};
  const next = newValue && typeof newValue === 'object' ? newValue : {};
  const keys = Array.from(
    new Set([...Object.keys(previous), ...Object.keys(next)]),
  ).filter((key) => !shouldSkipField(key));

  return keys
    .filter((key) => !valuesEqual(previous[key], next[key]))
    .map((key) => ({
      field: humanizeAuditLabel(key),
      previous: stringifyValue(previous[key]),
      next: stringifyValue(next[key]),
      sensitive: SENSITIVE_FIELD.test(key.replace(/[_-\s]/g, '')),
    }));
};

export const mapAuditLogToEvent = (log: AuditLog): PrototypeAuditEvent => {
  const actionKey = (log.action || '').toLowerCase();
  const actionVerb = ACTION_TO_VERB[actionKey] || actionKey || 'updated';
  const moduleValue = log.module || 'OrgAndEmpAuditLog';
  const changes = diffAuditValues(log.previousValue, log.newValue);
  const fieldOrResource =
    changes[0]?.field || humanizeAuditLabel(log.entityType) || 'Record';
  const actor = log.performedBy
    ? toPerson(log.performedByUser, log.performedBy)
    : systemPerson();
  const target = toPerson(log.targetUser, log.entityId || log.targetUser?.id);

  return {
    id: log.id,
    eventId: log.id,
    performedAt: log.performedAt || log.createdAt,
    severity:
      log.severity === 'MEDIUM' ||
      log.severity === 'HIGH' ||
      log.severity === 'CRITICAL'
        ? log.severity
        : 'INFO',
    actor,
    target,
    actionVerb,
    fieldOrResource,
    module: moduleValue,
    moduleLabel: getModuleLabel(moduleValue),
    ipAddress: '',
    geoLocation: '',
    browser: '',
    os: '',
    sessionId: '',
    changes,
    remarks: log.remarks || undefined,
  };
};

export const toApiAction = (action?: string) => {
  if (!action) return undefined;
  return ACTION_TO_API[action.toLowerCase()] || action.toUpperCase();
};
