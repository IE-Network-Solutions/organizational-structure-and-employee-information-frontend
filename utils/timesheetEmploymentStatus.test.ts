import {
  isTimesheetInactiveStatus,
  resolveTimesheetDeletedAtParam,
  resolveTimesheetUserIdsFilter,
  TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
  TIMESHEET_EMPLOYMENT_STATUS_INACTIVE,
  TIMESHEET_EMPTY_USER_ID_SENTINEL,
} from '@/utils/timesheetEmploymentStatus';

describe('timesheetEmploymentStatus', () => {
  it('defaults cleared/undefined status to Active (null)', () => {
    expect(resolveTimesheetDeletedAtParam(undefined)).toBe(
      TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
    );
    expect(resolveTimesheetDeletedAtParam('')).toBe(
      TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
    );
    expect(resolveTimesheetDeletedAtParam(null)).toBe(
      TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
    );
  });

  it('maps Inactive to notNull', () => {
    expect(
      resolveTimesheetDeletedAtParam(TIMESHEET_EMPLOYMENT_STATUS_INACTIVE),
    ).toBe(TIMESHEET_EMPLOYMENT_STATUS_INACTIVE);
    expect(isTimesheetInactiveStatus('notNull')).toBe(true);
    expect(isTimesheetInactiveStatus('null')).toBe(false);
  });

  it('returns selected employee userIds for both statuses', () => {
    expect(
      resolveTimesheetUserIdsFilter({
        employmentStatus: 'null',
        employeeId: 'u1',
      }),
    ).toEqual(['u1']);
    expect(
      resolveTimesheetUserIdsFilter({
        employmentStatus: 'notNull',
        employeeId: ['u2'],
      }),
    ).toEqual(['u2']);
  });

  it('uses empty sentinel for Inactive with no employee', () => {
    expect(
      resolveTimesheetUserIdsFilter({
        employmentStatus: 'notNull',
        employeeId: undefined,
      }),
    ).toEqual([TIMESHEET_EMPTY_USER_ID_SENTINEL]);
  });

  it('leaves Active with no employee unscoped (undefined userIds)', () => {
    expect(
      resolveTimesheetUserIdsFilter({
        employmentStatus: 'null',
        employeeId: undefined,
      }),
    ).toBeUndefined();
  });
});
