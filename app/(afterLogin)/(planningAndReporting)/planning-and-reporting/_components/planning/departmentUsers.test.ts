import { describe, expect, it } from '@jest/globals';
import {
  extractDepartmentUserIds,
  getEmployeeItems,
  getDepartmentUserTotal,
  getSubordinateIds,
  resolveDefaultPlanScope,
} from './departmentUsers';

describe('department user helpers', () => {
  it('reads user ids from a paginated items payload', () => {
    expect(
      extractDepartmentUserIds({
        items: [{ id: 'a' }, { userId: 'b' }],
        meta: { totalItems: 40 },
      }),
    ).toEqual(['a', 'b']);
  });

  it('reads user ids from a flat array payload', () => {
    expect(extractDepartmentUserIds([{ id: 'a' }, { id: 'b' }])).toEqual([
      'a',
      'b',
    ]);
  });

  it('uses meta.totalItems instead of the current page size', () => {
    expect(
      getDepartmentUserTotal(
        { meta: { totalItems: 42 }, items: [{ id: 'a' }] },
        1,
      ),
    ).toBe(42);
  });

  it('finds direct reports by reportingTo or delegatedTo', () => {
    expect(
      getSubordinateIds(
        {
          items: [
            { id: 'me', reportingTo: { id: 'boss' } },
            { id: 'a', reportingTo: { id: 'mgr' } },
            { id: 'b', delegatedTo: { id: 'mgr' } },
            { id: 'c', reportingTo: { id: 'other' } },
          ],
        },
        'mgr',
      ),
    ).toEqual(['a', 'b']);
  });

  it('defaults managers to subordinate scope and others to my plan', () => {
    expect(resolveDefaultPlanScope('mgr', ['a', 'b'])).toEqual({
      planningFilterPlanType: 'subordinatePlan',
      selectedUser: ['subordinate', 'a', 'b'],
    });
    expect(resolveDefaultPlanScope('me', [])).toEqual({
      planningFilterPlanType: 'myPlan',
      selectedUser: ['me'],
    });
  });

  it('normalizes employee lists from items or a raw array', () => {
    expect(getEmployeeItems({ items: [{ id: '1' }] })).toEqual([{ id: '1' }]);
    expect(getEmployeeItems([{ id: '2' }])).toEqual([{ id: '2' }]);
  });
});
