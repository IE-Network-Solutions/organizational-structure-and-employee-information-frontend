import {
  formatKrMetricTypeDisplayName,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  mergeKeyResultWithUserApi,
  resolveKrPanelMetricType,
  resolveOkrMilestones,
} from '@/utils/okrKeyResultProgressDisplay';

const apiKrCase1 = {
  id: 'kr-1',
  metricType: { name: 'Milestone' },
  progress: 34,
  milestones: [
    { id: 'm1', status: 'completed' },
    { id: 'm2', status: 'pending' },
    { id: 'm3', status: 'pending' },
  ],
};

const apiKrCase2 = {
  id: 'kr-2',
  metricType: { name: 'Milestone' },
  progress: 25,
  milestones: [
    { id: 'm1', status: 'completed' },
    { id: 'm2', status: 'pending' },
    { id: 'm3', status: 'pending' },
    { id: 'm4', status: 'pending' },
  ],
};

describe('okrKeyResultProgressDisplay — OKR vs Plan & Report sync', () => {
  it('ignores plan task-group milestones when OKR API milestones exist', () => {
    const planKr = {
      id: 'kr-2',
      metricType: { name: 'Milestone' },
      progress: 0,
      milestones: [
        { id: 'plan-ms-1', tasks: [{ id: 't1' }] },
        { id: 'plan-ms-2', tasks: [{ id: 't2' }] },
      ],
    };

    const merged = mergeKeyResultWithUserApi(planKr, [apiKrCase2]);

    expect(getKeyResultProgressPercent(merged)).toBe(25);
    expect(getKeyResultProgressRatioText(merged)).toBe('1/4');
    expect(resolveKrPanelMetricType(merged)).toBe('Milestone');
  });

  it('rejects plan progress=100 when OKR milestones are incomplete', () => {
    const planKr = {
      id: 'kr-1',
      metricType: { name: 'Milestone' },
      progress: 100,
      milestones: [{ id: 'plan-ms', tasks: [{ id: 't1' }] }],
    };

    const merged = mergeKeyResultWithUserApi(planKr, [apiKrCase1]);

    expect(getKeyResultProgressPercent(merged)).toBe(34);
    expect(getKeyResultProgressRatioText(merged)).toBe('1/3');
  });

  it('infers Achieve metric from progress when metadata is missing', () => {
    const planKr = {
      progress: 50,
      targetValue: 0,
      milestones: [],
    };

    expect(resolveKrPanelMetricType(planKr)).toBe('Achieve');
  });

  it('resolves metric type from key_type when metricType object is missing', () => {
    expect(
      resolveKrPanelMetricType({
        key_type: 'Percentage',
        progress: 25,
        targetValue: 100,
      }),
    ).toBe('Percent');
  });

  it('formats each metric type explicitly', () => {
    expect(formatKrMetricTypeDisplayName('Numeric')).toBe('Numeric');
    expect(formatKrMetricTypeDisplayName('Achieved')).toBe('Achieve');
    expect(formatKrMetricTypeDisplayName('Percentage')).toBe('Percent');
    expect(formatKrMetricTypeDisplayName('Currency')).toBe('Currency');
    expect(formatKrMetricTypeDisplayName('Milestone')).toBe('Milestone');
    expect(formatKrMetricTypeDisplayName('KPI')).toBe('KPI');
  });

  it('does not treat plan-only milestone shells as OKR milestones', () => {
    const planOnly = {
      metricType: { name: 'Milestone' },
      progress: 100,
      milestones: [{ id: 'p1', tasks: [{ id: 't1' }] }],
    };

    expect(resolveOkrMilestones(planOnly)).toEqual([]);
    expect(getKeyResultProgressPercent(planOnly)).toBe(0);
  });
});
