import { describe, expect, it } from '@jest/globals';
import { UNLINKED_KR_ID } from '../prototype/mockPlanningConstants';
import type { PlanningTarget } from './buildPlanningTargets';
import {
  applyTargetToDraftLine,
  createEmptyDraftLine,
  validateDraftLinesForCreate,
  apiKeyResultId,
} from './planDraft';

const sampleTarget = (
  overrides: Partial<PlanningTarget> = {},
): PlanningTarget => ({
  id: 't1',
  keyResultId: 'kr-1',
  keyResultTitle: 'Ship feature',
  milestoneId: null,
  parentTaskId: null,
  isDailySlot: false,
  metricTypeName: 'Currency',
  ...overrides,
});

describe('planDraft', () => {
  it('creates an empty unlinked draft line', () => {
    const line = createEmptyDraftLine();
    expect(line.task).toBe('');
    expect(line.keyResultId).toBe(UNLINKED_KR_ID);
    expect(line.priority).toBe('medium');
  });

  it('applies and clears planning targets', () => {
    const base = createEmptyDraftLine();
    const linked = applyTargetToDraftLine(base, sampleTarget());
    expect(linked.keyResultId).toBe('kr-1');
    expect(linked.label).toBe('Ship feature');
    const cleared = applyTargetToDraftLine(linked, null);
    expect(cleared.keyResultId).toBe(UNLINKED_KR_ID);
    expect(apiKeyResultId(cleared.keyResultId)).toBeNull();
  });

  it('validates required title and dates', () => {
    expect(validateDraftLinesForCreate([])).toMatch(/at least one/i);
    const empty = createEmptyDraftLine();
    expect(validateDraftLinesForCreate([empty])).toMatch(/title/i);
    expect(
      validateDraftLinesForCreate([{ ...empty, task: 'Do work' }]),
    ).toBeNull();
  });
});
