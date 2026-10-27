import { resolvePpPeriodRange } from './ppApproval';

describe('resolvePpPeriodRange', () => {
  const sessions = [
    {
      id: 's1',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      months: [
        { id: 'm7', startDate: '2026-07-01', endDate: '2026-07-31' },
        { id: 'm8', startDate: '2026-08-01', endDate: '2026-08-31' },
      ],
    },
    {
      id: 's2',
      startDate: '2026-10-01',
      endDate: '2026-12-31',
      months: [{ id: 'm10', startDate: '2026-10-01', endDate: '2026-10-31' }],
    },
  ];

  it('MONTH: returns the month range from any session', () => {
    expect(resolvePpPeriodRange(sessions, 'MONTH', 'm10')).toEqual({
      periodStart: '2026-10-01',
      periodEnd: '2026-10-31',
    });
  });

  it('SESSION: returns the quarter range', () => {
    expect(resolvePpPeriodRange(sessions, 'SESSION', undefined, 's1')).toEqual(
      {
        periodStart: '2026-07-01',
        periodEnd: '2026-09-30',
      },
    );
  });

  it('returns an empty range when the period is unknown or undated', () => {
    expect(resolvePpPeriodRange(sessions, 'MONTH', 'nope')).toEqual({});
    expect(resolvePpPeriodRange(undefined, 'SESSION', undefined, 's1')).toEqual(
      {},
    );
    const undated = [{ id: 's3', months: [] }];
    expect(resolvePpPeriodRange(undated, 'SESSION', undefined, 's3')).toEqual(
      {},
    );
  });
});
