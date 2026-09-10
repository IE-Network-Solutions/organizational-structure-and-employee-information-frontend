import { describe, expect, it } from '@jest/globals';
import {
  planCardAssigneeLabel,
  planCardAssigneeRole,
  resolvePlanCardDisplayMode,
} from './planCardDisplay';

describe('resolvePlanCardDisplayMode', () => {
  it('uses compact/team from assignee count for planning and reporting', () => {
    expect(resolvePlanCardDisplayMode(1, 'reporting')).toBe('compact');
    expect(resolvePlanCardDisplayMode(5, 'reporting')).toBe('team');
    expect(resolvePlanCardDisplayMode(0, 'planning')).toBe('compact');
    expect(resolvePlanCardDisplayMode(1, 'planning')).toBe('compact');
    expect(resolvePlanCardDisplayMode(2, 'planning')).toBe('team');
    expect(resolvePlanCardDisplayMode(4, 'planning')).toBe('team');
  });
});

describe('planCardAssigneeLabel', () => {
  it('normalizes possessive plan titles and My Plan', () => {
    expect(planCardAssigneeLabel("Alice's Plan")).toBe('Alice');
    expect(planCardAssigneeLabel('My Plan')).toBe('You');
    expect(planCardAssigneeLabel('Bob Okonkwo')).toBe('Bob Okonkwo');
  });
});

describe('planCardAssigneeRole', () => {
  it('hides empty or placeholder roles', () => {
    expect(planCardAssigneeRole('Product')).toBe('Product');
    expect(planCardAssigneeRole('Plan')).toBeNull();
    expect(planCardAssigneeRole('N/A')).toBeNull();
    expect(planCardAssigneeRole('')).toBeNull();
  });
});
