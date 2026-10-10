import {
  getKeyResultBandValidationError,
  getKeyResultBandValidationIssue,
  shouldIncludeScoringBands,
} from '@/utils/okrScoringBands';

describe('okrScoringBands', () => {
  it('includes threshold and stretch only for type-weighted scoring', () => {
    expect(shouldIncludeScoringBands('TYPE_WEIGHTED')).toBe(true);
    expect(shouldIncludeScoringBands('CLASSIC_AVERAGE')).toBe(false);
    expect(shouldIncludeScoringBands(undefined)).toBe(false);
  });

  it('accepts valid type-weighted score bands', () => {
    expect(
      getKeyResultBandValidationError(
        {
          initialValue: 10,
          thresholdValue: 10,
          targetValue: 50,
          stretchValue: 75,
        },
        'TYPE_WEIGHTED',
      ),
    ).toBeNull();
  });

  it('requires baseline <= threshold < target <= stretch in type-weighted scoring', () => {
    expect(
      getKeyResultBandValidationError(
        {
          initialValue: 20,
          thresholdValue: 10,
          targetValue: 50,
          stretchValue: 75,
        },
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/baseline.*threshold/i);
    expect(
      getKeyResultBandValidationError(
        {
          initialValue: 10,
          thresholdValue: 50,
          targetValue: 50,
          stretchValue: 75,
        },
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/threshold.*target/i);
    expect(
      getKeyResultBandValidationError(
        {
          initialValue: 10,
          thresholdValue: 20,
          targetValue: 75,
          stretchValue: 70,
        },
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/stretch.*target/i);
  });

  it('allows stretch to equal target', () => {
    expect(
      getKeyResultBandValidationError(
        {
          initialValue: 0,
          thresholdValue: 90,
          targetValue: 100,
          stretchValue: 100,
        },
        'TYPE_WEIGHTED',
      ),
    ).toBeNull();
  });

  it('flags only the field the message belongs to', () => {
    const base = { initialValue: 0, thresholdValue: 50, targetValue: 100 };
    expect(
      getKeyResultBandValidationIssue(
        { ...base, stretchValue: 90 },
        'TYPE_WEIGHTED',
      )?.field,
    ).toBe('stretchValue');
    expect(
      getKeyResultBandValidationIssue(
        { ...base, thresholdValue: 100, stretchValue: 120 },
        'TYPE_WEIGHTED',
      )?.field,
    ).toBe('thresholdValue');
    expect(
      getKeyResultBandValidationIssue(
        { initialValue: 10, targetValue: 10 },
        'CLASSIC_AVERAGE',
      )?.field,
    ).toBe('targetValue');
  });

  it('retains classic baseline-to-target validation', () => {
    expect(
      getKeyResultBandValidationError(
        { initialValue: 10, targetValue: 10 },
        'CLASSIC_AVERAGE',
      ),
    ).toMatch(/target.*baseline/i);
  });
});
