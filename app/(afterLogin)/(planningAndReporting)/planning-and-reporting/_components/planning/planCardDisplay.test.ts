import { describe, expect, it } from '@jest/globals';
import {
  planCardAssigneeLabel,
  resolvePlanCardDisplayMode,
} from './planCardDisplay';

describe('resolvePlanCardDisplayMode', () => {
  it('uses full layout for reporting', () => {
    expect(resolvePlanCardDisplayMode(1, 'reporting')).toBe('full');
    expect(resolvePlanCardDisplayMode(5, 'reporting')).toBe('full');
  });

  it('uses compact when one assignee is selected', () => {
    expect(resolvePlanCardDisplayMode(0, 'planning')).toBe('compact');
    expect(resolvePlanCardDisplayMode(1, 'planning')).toBe('compact');
  });

  it('uses team when multiple assignees are selected', () => {
    expect(resolvePlanCardDisplayMode(2, 'planning')).toBe('team');
    expect(resolvePlanCardDisplayMode(4, 'planning')).toBe('team');
  });
});

describe('planCardAssigneeLabel', () => {
  it('normalizes possessive plan titles and My Plan', () => {
    expect(planCardAssigneeLabel("Alice's Plan")).toBe('Alice');
    expect(planCardAssigneeLabel('My Plan')).toBe('You');
    expect(planCardAssigneeLabel('Bob')).toBe('Bob');
  });
});
