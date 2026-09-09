import { describe, expect, it } from '@jest/globals';
import { isOwnPlanSummary } from './planOwnership';
import type { PlanSummary } from '../types';

const basePlan = (ownerUserId: string, summary: string): PlanSummary =>
  ({
    id: 'p1',
    ownerUserId,
    summary,
    owner: { name: summary, role: 'Plan', avatarInitials: 'PL' },
    cadence: 'weekly',
    status: { label: 'Open', updatedAt: '', tone: '' },
    metricLabel: '',
    milestoneLabel: '',
    target: 0,
    achieved: 0,
    progress: 0,
    tasks: [],
    commentCount: 0,
    commentAvatars: [],
    createdAt: '',
  }) as PlanSummary;

describe('isOwnPlanSummary', () => {
  it('matches by ownerUserId or My Plan label', () => {
    expect(isOwnPlanSummary(basePlan('me', 'My Plan'), 'me')).toBe(true);
    expect(isOwnPlanSummary(basePlan('other', 'Other Plan'), 'me')).toBe(false);
  });
});
