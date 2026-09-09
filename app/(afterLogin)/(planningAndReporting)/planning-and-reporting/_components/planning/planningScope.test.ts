import { describe, expect, it } from '@jest/globals';
import { resolveSelectedUserForScope } from './planningScope';

describe('planningScope', () => {
  it('resolves my plan scope to current user', () => {
    expect(resolveSelectedUserForScope('myPlan', 'u1', [], undefined)).toEqual([
      'u1',
    ]);
  });

  it('resolves team scope to subordinate marker + ids', () => {
    expect(
      resolveSelectedUserForScope('subordinatePlan', 'u1', ['u2', 'u3'], undefined),
    ).toEqual(['subordinate', 'u2', 'u3']);
  });

  it('scopes subordinates to department when provided', () => {
    expect(
      resolveSelectedUserForScope('subordinatePlan', 'u1', ['u2', 'u3'], [
        'u3',
      ]),
    ).toEqual(['subordinate', 'u3']);
  });

});
