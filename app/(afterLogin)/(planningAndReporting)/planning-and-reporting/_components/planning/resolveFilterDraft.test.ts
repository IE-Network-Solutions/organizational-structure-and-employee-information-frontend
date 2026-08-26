import { describe, expect, it } from '@jest/globals';
import { resolveEmployeeAndPlanType } from './resolveFilterDraft';

describe('resolveEmployeeAndPlanType', () => {
  it('restores a specific employee and all-plans type', () => {
    expect(
      resolveEmployeeAndPlanType({
        planningFilterPlanType: 'all',
        planningFilterEmployee: 'emp-1',
        selectedUser: ['emp-1'],
      }),
    ).toEqual({ employeeSelect: 'emp-1', planType: 'all' });
  });

  it('restores my-plan type without treating the current user as an employee filter', () => {
    expect(
      resolveEmployeeAndPlanType({
        planningFilterPlanType: 'myPlan',
        planningFilterEmployee: 'all',
        selectedUser: ['me'],
      }),
    ).toEqual({ employeeSelect: 'all', planType: 'myPlan' });
  });

  it('falls back to selectedUser when employee was applied but not stored', () => {
    expect(
      resolveEmployeeAndPlanType({
        planningFilterPlanType: 'all',
        selectedUser: ['emp-2'],
      }),
    ).toEqual({ employeeSelect: 'emp-2', planType: 'all' });
  });

  it('defaults missing plan type to my-plan', () => {
    expect(
      resolveEmployeeAndPlanType({
        selectedUser: [],
      }),
    ).toEqual({ employeeSelect: 'all', planType: 'myPlan' });
  });
});
