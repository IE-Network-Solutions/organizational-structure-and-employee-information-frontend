import type { PlanningTarget } from './buildPlanningTargets';
import {
  buildPlanAllDrafts,
  isQuarterlyPlanningPeriod,
} from './planAllKeyResults';

const target = (overrides: Partial<PlanningTarget>): PlanningTarget => ({
  id: 'okr-kr-1',
  keyResultId: 'kr-1',
  keyResultTitle: 'Key result',
  milestoneId: null,
  parentTaskId: null,
  isDailySlot: false,
  metricTypeName: 'Percentage',
  isCompleted: false,
  ...overrides,
});

describe('isQuarterlyPlanningPeriod', () => {
  it('matches quarterly period names only', () => {
    expect(isQuarterlyPlanningPeriod('Quarterly')).toBe(true);
    expect(isQuarterlyPlanningPeriod(' quarter ')).toBe(true);
    expect(isQuarterlyPlanningPeriod('Monthly')).toBe(false);
    expect(isQuarterlyPlanningPeriod('Weekly')).toBe(false);
  });
});

describe('buildPlanAllDrafts', () => {
  it('creates one task per key result with weights totalling 100', () => {
    const drafts = buildPlanAllDrafts(
      [
        target({ id: 't1', keyResultId: 'kr-1', keyResultTitle: 'A' }),
        target({ id: 't2', keyResultId: 'kr-2', keyResultTitle: 'B' }),
        target({ id: 't3', keyResultId: 'kr-3', keyResultTitle: 'C' }),
      ],
      [
        { id: 'kr-1', targetValue: 98 },
        { id: 'kr-2', targetValue: '95' },
        { id: 'kr-3', targetValue: 100 },
      ],
    );

    expect(drafts.map((d) => d.task)).toEqual(['A', 'B', 'C']);
    expect(drafts.map((d) => d.weight)).toEqual([34, 33, 33]);
    expect(drafts.map((d) => d.targetValue)).toEqual([98, 95, 100]);
    expect(drafts.every((d) => !d.achieveMK && d.priority === 'medium')).toBe(
      true,
    );
  });

  it('plans achieve key results and milestones as outcome tasks', () => {
    const drafts = buildPlanAllDrafts([
      target({ id: 't1', metricTypeName: 'Achieve', keyResultTitle: 'Ship' }),
      target({
        id: 't2',
        keyResultId: 'kr-2',
        metricTypeName: 'Milestone',
        milestoneId: 'm-1',
        milestoneTitle: 'Beta',
      }),
    ]);

    expect(drafts[0]).toMatchObject({
      task: 'Ship',
      achieveMK: true,
      targetValue: 0,
      milestoneId: null,
    });
    expect(drafts[1]).toMatchObject({
      task: 'Beta',
      label: 'Beta',
      achieveMK: true,
      targetValue: 0,
      milestoneId: 'm-1',
    });
  });

  it('skips completed milestones, daily slots and duplicates', () => {
    const drafts = buildPlanAllDrafts([
      target({ id: 't1' }),
      target({ id: 't1' }),
      target({ id: 't2', milestoneId: 'm-1', isCompleted: true }),
      target({ id: 't3', isDailySlot: true }),
    ]);

    expect(drafts).toHaveLength(1);
    expect(drafts[0].weight).toBe(100);
  });

  it('returns nothing when there is nothing to plan', () => {
    expect(buildPlanAllDrafts([])).toEqual([]);
  });
});
