import { describe, expect, it } from '@jest/globals';
import {
  appendApplyToOkrQuery,
  doesPlanningPeriodAffectOkr,
  getHighestAssignedPlanningPeriod,
  getOkrCountingPeriodName,
  planningPeriodIntervalRank,
  resolveAssignedPlanningPeriods,
} from './okrCountingPlanningPeriod';

const daily = {
  planningPeriodId: 'daily-id',
  planningPeriod: {
    id: 'daily-id',
    name: 'Daily',
    intervalLength: 1,
    intervalType: 'days',
  },
};
const weekly = {
  planningPeriodId: 'weekly-id',
  planningPeriod: {
    id: 'weekly-id',
    name: 'Weekly',
    intervalLength: 7,
    intervalType: 'days',
  },
};
const monthly = {
  planningPeriodId: 'monthly-id',
  planningPeriod: {
    id: 'monthly-id',
    name: 'Monthly',
    intervalLength: 30,
    intervalType: 'days',
  },
};

describe('okrCountingPlanningPeriod', () => {
  it('ranks named periods when intervalLength is missing', () => {
    expect(planningPeriodIntervalRank({ name: 'Daily' })).toBe(1);
    expect(planningPeriodIntervalRank({ name: 'Weekly' })).toBe(7);
    expect(planningPeriodIntervalRank({ name: 'Monthly' })).toBe(30);
  });

  it('counts Daily when that is the only assignment', () => {
    expect(doesPlanningPeriodAffectOkr('daily-id', [daily])).toBe(true);
    expect(getOkrCountingPeriodName([daily])).toBe('Daily');
  });

  it('counts Weekly — not Daily — when both are assigned', () => {
    const assigned = [daily, weekly];
    expect(doesPlanningPeriodAffectOkr('daily-id', assigned)).toBe(false);
    expect(doesPlanningPeriodAffectOkr('weekly-id', assigned)).toBe(true);
    expect(getHighestAssignedPlanningPeriod(assigned)?.planningPeriodId).toBe(
      'weekly-id',
    );
  });

  it('counts Monthly — not Daily or Weekly — when all three are assigned', () => {
    const assigned = [daily, weekly, monthly];
    expect(doesPlanningPeriodAffectOkr('daily-id', assigned)).toBe(false);
    expect(doesPlanningPeriodAffectOkr('weekly-id', assigned)).toBe(false);
    expect(doesPlanningPeriodAffectOkr('monthly-id', assigned)).toBe(true);
    expect(getOkrCountingPeriodName(assigned)).toBe('Monthly');
  });

  it('counts Monthly when only Weekly and Monthly are assigned', () => {
    const assigned = [weekly, monthly];
    expect(doesPlanningPeriodAffectOkr('weekly-id', assigned)).toBe(false);
    expect(doesPlanningPeriodAffectOkr('monthly-id', assigned)).toBe(true);
  });

  it('fails closed when assignments are unknown so Daily cannot write OKR early', () => {
    expect(doesPlanningPeriodAffectOkr('weekly-id', [])).toBe(false);
    expect(doesPlanningPeriodAffectOkr('weekly-id', null)).toBe(false);
    expect(doesPlanningPeriodAffectOkr('', [weekly])).toBe(false);
  });

  it('reads assignment lists wrapped in { items }', () => {
    const wrapped = { items: [daily, weekly] };
    expect(doesPlanningPeriodAffectOkr('daily-id', wrapped)).toBe(false);
    expect(doesPlanningPeriodAffectOkr('weekly-id', wrapped)).toBe(true);
  });

  it('ranks assignment ids against the period catalog when nested period is missing', () => {
    const assigned = [{ planningPeriodId: 'weekly-id' }];
    const catalog = [
      { id: 'daily-id', name: 'Daily', intervalLength: 1 },
      { id: 'weekly-id', name: 'Weekly', intervalLength: 7 },
    ];
    const resolved = resolveAssignedPlanningPeriods(assigned, catalog);
    expect(doesPlanningPeriodAffectOkr('daily-id', resolved)).toBe(false);
    expect(doesPlanningPeriodAffectOkr('weekly-id', resolved)).toBe(true);
    expect(getOkrCountingPeriodName(resolved)).toBe('Weekly');
  });

  it('ranks {days}/{months} intervalLength objects', () => {
    expect(
      planningPeriodIntervalRank({
        name: 'Weekly',
        intervalLength: { days: 7 },
      }),
    ).toBe(7);
    expect(
      planningPeriodIntervalRank({
        name: 'Monthly',
        intervalLength: { months: 1 },
      }),
    ).toBe(30);
  });

  it('appends applyToOkr to urls with or without an existing query', () => {
    expect(appendApplyToOkrQuery('/report', false)).toBe(
      '/report?applyToOkr=false',
    );
    expect(appendApplyToOkrQuery('/report?planningId=1', true)).toBe(
      '/report?planningId=1&applyToOkr=true',
    );
  });
});
