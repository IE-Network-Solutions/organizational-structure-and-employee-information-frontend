import {
  formatKrMetricTypeDisplayName,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  isKeyResultFullyCompletedForPlanning,
  mergeKeyResultWithUserApi,
  resolveKrPanelMetricType,
  resolveOkrMilestones,
  type KeyResultLikeInput,
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
    expect(resolveKrPanelMetricType(merged, apiKrCase2)).toBe('Milestone');
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

  it('uses OKR API metric over plan payload for every metric type', () => {
    const cases = [
      { api: 'Milestone', plan: 'Achieve' },
      { api: 'Achieve', plan: 'Milestone' },
      { api: 'Numeric', plan: 'Achieve' },
      { api: 'Percentage', plan: 'Numeric' },
      { api: 'Currency', plan: 'Numeric' },
      { api: 'KPI', plan: 'Achieve' },
    ] as const;

    for (const { api, plan } of cases) {
      const planKr = {
        id: 'kr-x',
        metricType: { name: plan },
        progress: 40,
        targetValue: 0,
      };
      const apiKr = { id: 'kr-x', metricType: { name: api }, progress: 40 };
      expect(resolveKrPanelMetricType(planKr, apiKr)).toBe(api);
    }
  });

  it('does not label Milestone KRs as Achieve when plan only has milestone task shells', () => {
    const planKr = {
      id: 'kr-milestone',
      progress: 50,
      targetValue: 0,
      milestones: [
        { id: 'plan-ms-1', title: 'Phase 1', tasks: [{ id: 't1' }] },
        { id: 'plan-ms-2', title: 'Phase 2', tasks: [{ id: 't2' }] },
      ],
    };
    const apiKr = {
      id: 'kr-milestone',
      metricType: { name: 'Milestone' },
      progress: 50,
      milestones: [
        { id: 'm1', status: 'pending' },
        { id: 'm2', status: 'pending' },
      ],
    };

    expect(resolveKrPanelMetricType(planKr, apiKr)).toBe('Milestone');
    expect(resolveKrPanelMetricType(planKr)).toBe('Milestone');
  });

  it('does not infer Achieve from progress alone', () => {
    expect(
      resolveKrPanelMetricType({
        progress: 50,
        targetValue: 0,
        milestones: [],
      }),
    ).toBe('');
  });

  it('resolves each metric type from key_type when metricType object is missing', () => {
    const types = [
      'Numeric',
      'Percentage',
      'Currency',
      'Milestone',
      'Achieve',
      'KPI',
    ] as const;

    for (const metricKeyType of types) {
      expect(
        resolveKrPanelMetricType({ key_type: metricKeyType, progress: 10 }),
      ).toBe(metricKeyType);
    }
  });

  it('formats each metric type with exact OKR names', () => {
    expect(formatKrMetricTypeDisplayName('Numeric')).toBe('Numeric');
    expect(formatKrMetricTypeDisplayName('Achieved')).toBe('Achieve');
    expect(formatKrMetricTypeDisplayName('Percentage')).toBe('Percentage');
    expect(formatKrMetricTypeDisplayName('Percent')).toBe('Percentage');
    expect(formatKrMetricTypeDisplayName('Currency')).toBe('Currency');
    expect(formatKrMetricTypeDisplayName('Milestone')).toBe('Milestone');
    expect(formatKrMetricTypeDisplayName('KPI')).toBe('KPI');
  });

  it('does not guess Numeric/Currency/Percentage from target without metadata', () => {
    expect(
      resolveKrPanelMetricType({
        targetValue: 100,
        currentValue: 25,
        milestones: [],
      }),
    ).toBe('');
  });

  it('accepts KeyResultLikeInput in milestone and panel metric helpers without casts', () => {
    const kr: KeyResultLikeInput = {
      key_type: 'Milestone',
      progress: 25,
      milestones: [{ id: 'm1', status: 'pending' }],
    };

    expect(resolveOkrMilestones(kr)).toHaveLength(1);
    expect(resolveKrPanelMetricType(kr)).toBe('Milestone');
  });

  it('does not treat plan-only milestone shells as OKR milestones', () => {
    const planOnly = {
      metricType: { name: 'Milestone' },
      progress: 100,
      milestones: [{ id: 'p1', tasks: [{ id: 't1' }] }],
    };

    expect(resolveOkrMilestones(planOnly)).toEqual([]);
    expect(getKeyResultProgressPercent(planOnly)).toBe(0);
    expect(resolveKrPanelMetricType(planOnly)).toBe('Milestone');
  });

  it('keeps status-null OKR milestones plan-eligible alongside completed ones', () => {
    const kr = {
      metricType: { name: 'Milestone' },
      progress: 50,
      milestones: [
        { id: 'm-done', title: '12345555', status: 'Completed' },
        {
          id: 'm-open',
          title: 'Finalize Selamnew Collaboration New Feature  Implimentationes',
          status: null,
        },
      ],
    };

    const resolved = resolveOkrMilestones(kr);
    expect(resolved).toHaveLength(2);
    expect(getKeyResultProgressRatioText(kr)).toBe('1/2');
    expect(getKeyResultProgressPercent(kr)).toBe(50);
    expect(isKeyResultFullyCompletedForPlanning(kr)).toBe(false);
  });

  it('excludes plan-grouping rows while keeping null-status OKR milestones', () => {
    const kr = {
      metricType: { name: 'Milestone' },
      progress: 50,
      milestones: [
        { id: 'm-done', status: 'Completed' },
        { id: 'm-open', status: null },
        { id: 'plan-shell', tasks: [{ id: 't1' }] },
      ],
    };

    expect(resolveOkrMilestones(kr)).toHaveLength(2);
    expect(isKeyResultFullyCompletedForPlanning(kr)).toBe(false);
  });
});
