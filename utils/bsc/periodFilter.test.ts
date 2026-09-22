import type { EmployeeScorecard } from '@/types/bsc';
import { ScorecardStatus } from '@/types/bsc';
import {
  filterScorecardsByFiscalMonths,
  scorecardInCalendarMonth,
  scorecardOverlapsFiscalMonth,
  toUtcDayString,
} from './periodFilter';

function card(
  overrides: Partial<EmployeeScorecard> = {},
): EmployeeScorecard {
  return {
    id: 'esc-1',
    userId: 'u1',
    userName: 'User',
    managerId: 'm1',
    cycleId: 'sc-1',
    cycleLabel: 'Company Scorecard',
    status: ScorecardStatus.Active,
    targets: [],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('periodFilter', () => {
  it('toUtcDayString normalizes ISO dates', () => {
    expect(toUtcDayString('2026-09-15T12:00:00.000Z')).toBe('2026-09-15');
    expect(toUtcDayString('2026-09-01')).toBe('2026-09-01');
  });

  it('matches weekly period overlapping a fiscal September', () => {
    const weekly = card({
      periodKey: '2026-W38',
      periodMonthName: 'Week 38, 2026',
      periodStart: '2026-09-14',
      periodEnd: '2026-09-20',
    });
    expect(
      scorecardOverlapsFiscalMonth(weekly, {
        name: 'September',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      }),
    ).toBe(true);
    expect(
      scorecardOverlapsFiscalMonth(weekly, {
        name: 'August',
        startDate: '2026-08-01',
        endDate: '2026-08-31',
      }),
    ).toBe(false);
  });

  it('matches monthly label when dates are missing', () => {
    const monthly = card({
      periodKey: '2026-09',
      periodMonthName: 'September 2026',
    });
    expect(
      scorecardOverlapsFiscalMonth(monthly, {
        name: 'September',
        startDate: null,
        endDate: null,
      }),
    ).toBe(true);
  });

  it('filters a list by any overlapping fiscal month in a session', () => {
    const cards = [
      card({
        id: 'a',
        periodStart: '2026-09-14',
        periodEnd: '2026-09-20',
        periodMonthName: 'Week 38, 2026',
      }),
      card({
        id: 'b',
        periodStart: '2026-10-01',
        periodEnd: '2026-10-31',
        periodMonthName: 'October 2026',
      }),
    ];
    const filtered = filterScorecardsByFiscalMonths(cards, [
      { name: 'September', startDate: '2026-09-01', endDate: '2026-09-30' },
    ]);
    expect(filtered.map((c) => c.id)).toEqual(['a']);
  });

  it('scorecardInCalendarMonth uses period dates', () => {
    const weekly = card({
      periodStart: '2026-09-14',
      periodEnd: '2026-09-20',
      periodMonthName: 'Week 38, 2026',
      periodYear: 2026,
    });
    expect(scorecardInCalendarMonth(weekly, 'September', 2026)).toBe(true);
    expect(scorecardInCalendarMonth(weekly, 'October', 2026)).toBe(false);
  });
});
