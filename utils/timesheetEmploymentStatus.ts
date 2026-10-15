/** Org user membership status for Timesheet admin filters (mirrors Manage Employees). */
export type TimesheetEmploymentStatus = 'null' | 'notNull';

export const TIMESHEET_EMPLOYMENT_STATUS_ACTIVE: TimesheetEmploymentStatus =
  'null';
export const TIMESHEET_EMPLOYMENT_STATUS_INACTIVE: TimesheetEmploymentStatus =
  'notNull';

/** Map UI/status value to Org `deletedAt` query param. Default Active. */
export function resolveTimesheetDeletedAtParam(
  status: TimesheetEmploymentStatus | '' | null | undefined,
): TimesheetEmploymentStatus {
  return status === TIMESHEET_EMPLOYMENT_STATUS_INACTIVE
    ? TIMESHEET_EMPLOYMENT_STATUS_INACTIVE
    : TIMESHEET_EMPLOYMENT_STATUS_ACTIVE;
}

export function isTimesheetInactiveStatus(
  status: TimesheetEmploymentStatus | '' | null | undefined,
): boolean {
  return (
    resolveTimesheetDeletedAtParam(status) ===
    TIMESHEET_EMPLOYMENT_STATUS_INACTIVE
  );
}

/**
 * When Status is Inactive and no employee is selected, pass a non-matching
 * userId so list APIs do not return the full (active) tenant history.
 */
export const TIMESHEET_EMPTY_USER_ID_SENTINEL = '__no_inactive_employee__';

export function resolveTimesheetUserIdsFilter(options: {
  employmentStatus: TimesheetEmploymentStatus | '' | null | undefined;
  employeeId?: string | string[] | null;
}): string[] | undefined {
  const inactive = isTimesheetInactiveStatus(options.employmentStatus);
  const raw = options.employeeId;
  const selected = Array.isArray(raw) ? raw.filter(Boolean) : raw ? [raw] : [];

  if (selected.length > 0) {
    return selected;
  }

  if (inactive) {
    return [TIMESHEET_EMPTY_USER_ID_SENTINEL];
  }

  return undefined;
}
