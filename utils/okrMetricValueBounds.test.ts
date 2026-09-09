import {
  getMetricValueInputMax,
  getMetricValueInputMin,
  getQuantitativeMetricValueBounds,
  validateMetricValueAgainstInitial,
} from '@/utils/okrMetricValueBounds';

describe('okrMetricValueBounds', () => {
  it('does not apply KR initial floor to Achieve / Milestone', () => {
    expect(
      getQuantitativeMetricValueBounds({
        metricType: { name: 'Achieve' },
        initialValue: 10,
        targetValue: 100,
      }).applies,
    ).toBe(false);
    expect(
      validateMetricValueAgainstInitial(1, {
        metricType: { name: 'Milestone' },
        initialValue: 10,
      }),
    ).toBeNull();
  });

  it('always rejects negative values', () => {
    expect(
      validateMetricValueAgainstInitial(-1, {
        metricType: { name: 'Numeric' },
        initialValue: 0,
      }),
    ).toMatch(/negative/i);
    expect(
      validateMetricValueAgainstInitial(-5, {
        metricType: { name: 'Milestone' },
      }),
    ).toMatch(/negative/i);
    expect(validateMetricValueAgainstInitial(-1, null)).toMatch(/negative/i);
  });

  it('floors increasing Numeric / Currency / Percentage at initial', () => {
    const kr = {
      metricType: { name: 'Numeric' },
      initialValue: 40,
      targetValue: 100,
    };
    expect(getQuantitativeMetricValueBounds(kr)).toMatchObject({
      applies: true,
      direction: 'increasing',
      min: 40,
      max: null,
    });
    expect(validateMetricValueAgainstInitial(39, kr)).toMatch(/initial/);
    expect(validateMetricValueAgainstInitial(40, kr)).toBeNull();
    expect(getMetricValueInputMin(kr)).toBe(40);
  });

  it('caps decreasing Currency between target and initial', () => {
    const kr = {
      metricType: { name: 'Currency' },
      initialValue: 100,
      targetValue: 50,
    };
    expect(getQuantitativeMetricValueBounds(kr)).toMatchObject({
      applies: true,
      direction: 'decreasing',
      min: 50,
      max: 100,
    });
    expect(validateMetricValueAgainstInitial(101, kr)).toMatch(/initial/);
    expect(validateMetricValueAgainstInitial(40, kr)).toMatch(/target/);
    expect(validateMetricValueAgainstInitial(75, kr)).toBeNull();
    expect(getMetricValueInputMax(kr)).toBe(100);
    expect(getMetricValueInputMin(kr)).toBe(50);
  });

  it('treats missing initialValue as 0 for quantitative metrics', () => {
    const bounds = getQuantitativeMetricValueBounds({
      metricType: { name: 'Percentage' },
      targetValue: 80,
    });
    expect(bounds).toMatchObject({
      applies: true,
      direction: 'increasing',
      min: 0,
    });
    expect(
      validateMetricValueAgainstInitial(-2, {
        metricType: { name: 'Percentage' },
        targetValue: 80,
      }),
    ).toMatch(/negative/i);
  });
});
