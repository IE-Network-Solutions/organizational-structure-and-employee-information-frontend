import {
  formatRollupAverage,
  formatRollupCoverage,
  type RollupSummary,
} from './rollup';

function summary(
  overrides: Partial<RollupSummary> = {},
): Pick<
  RollupSummary,
  'averageScore' | 'evaluatedCount' | 'totalCount' | 'pendingCount'
> {
  return {
    averageScore: 0,
    evaluatedCount: 0,
    totalCount: 0,
    pendingCount: 0,
    ...overrides,
  };
}

describe('formatRollupAverage', () => {
  it('returns em dash when nothing is evaluated', () => {
    expect(
      formatRollupAverage(summary({ averageScore: 0, evaluatedCount: 0 })),
    ).toBe('—');
  });

  it('formats a real average including zero when evaluated', () => {
    expect(
      formatRollupAverage(summary({ averageScore: 0, evaluatedCount: 2 })),
    ).toBe('0%');
    expect(
      formatRollupAverage(summary({ averageScore: 80.3, evaluatedCount: 1 })),
    ).toBe('80.3%');
  });
});

describe('formatRollupCoverage', () => {
  it('shows evaluated over total', () => {
    expect(
      formatRollupCoverage(summary({ evaluatedCount: 3, totalCount: 10 })),
    ).toBe('3/10 evaluated');
  });
});
