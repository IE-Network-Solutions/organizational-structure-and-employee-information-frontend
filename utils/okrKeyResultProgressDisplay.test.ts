import {
  buildKrPlanningSource,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  getMetricTypeName,
  mergeKeyResultWithUserApi,
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
  });

  it('rejects plan progress=100 when OKR milestones are incomplete (case 1)', () => {
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

  it('does not treat plan-only milestone shells as OKR milestones', () => {
    const planOnly = {
      metricType: { name: 'Milestone' },
      progress: 100,
      milestones: [{ id: 'p1', tasks: [{ id: 't1' }] }],
    };

    expect(resolveOkrMilestones(planOnly)).toEqual([]);
    expect(getKeyResultProgressPercent(planOnly)).toBe(0);
    expect(getKeyResultProgressRatioText(planOnly)).toBe('');
  });

  it('returns API milestone fraction when plan payload has no OKR milestones', () => {
    const planKr = {
      id: 'kr-1',
      metricType: { name: 'Milestone' },
      progress: 100,
      milestones: [],
    };

    const merged = mergeKeyResultWithUserApi(planKr, [apiKrCase1]);

    expect(getKeyResultProgressPercent(merged)).toBe(34);
    expect(getKeyResultProgressRatioText(merged)).toBe('1/3');
  });

  it('reads metricType when the plan panel stores it as a plain string', () => {
    // AggregatedKR / buildKrPlanningSource panel rows use metricType: 'Milestone'
    const panelKr = {
      metricType: 'Milestone',
      progress: 100,
      currentValue: 0,
      targetValue: 0,
      milestones: [{ id: 'plan-ms', tasks: [{ id: 't1' }] }],
    };

    expect(getMetricTypeName(panelKr)).toBe('Milestone');
    expect(getKeyResultProgressPercent(panelKr)).toBe(0);
    // No OKR milestone rows → empty ratio (not misleading 0/0)
    expect(getKeyResultProgressRatioText(panelKr)).toBe('');

    const planningSource = buildKrPlanningSource(panelKr, apiKrCase1);
    expect(getKeyResultProgressPercent(planningSource)).toBe(34);
    expect(getKeyResultProgressRatioText(planningSource)).toBe('1/3');
  });

  it('restores OKR progress after report cancel returns the plan (stale plan 100%)', () => {
    // After cancel: plan payload still has progress=100 from the cancelled report flow,
    // while user KR API (source of truth) still shows partial milestone completion.
    const restoredPlanKr = {
      id: 'kr-1',
      metricType: 'Milestone',
      progress: 100,
      currentValue: 0,
      targetValue: 0,
      milestones: [
        { id: 'plan-ms-1', tasks: [{ id: 't1' }] },
        { id: 'plan-ms-2', tasks: [{ id: 't2' }] },
      ],
      status: 'on_progress',
    };

    const merged = mergeKeyResultWithUserApi(restoredPlanKr, [apiKrCase1]);

    expect(getKeyResultProgressPercent(merged)).toBe(34);
    expect(getKeyResultProgressRatioText(merged)).toBe('1/3');
    expect(merged.status).toBe(apiKrCase1.status ?? merged.status);

    const fromPanel = buildKrPlanningSource(
      {
        metricType: 'Milestone',
        progress: 100,
        currentValue: 0,
        targetValue: 0,
        milestones: restoredPlanKr.milestones,
        status: 'on_progress',
      },
      apiKrCase1,
    );
    expect(getKeyResultProgressPercent(fromPanel)).toBe(34);
    expect(getKeyResultProgressRatioText(fromPanel)).toBe('1/3');
  });

  it('keeps plan task trees while overwriting measured progress from the user KR API', () => {
    const planKr = {
      id: 'kr-1',
      metricType: { name: 'Milestone' },
      progress: 100,
      tasks: [{ id: 'plan-task-1', title: 'Restored task' }],
      milestones: [{ id: 'plan-ms', tasks: [{ id: 't1' }] }],
    };

    const merged = mergeKeyResultWithUserApi(planKr, [apiKrCase1]);

    expect(merged.tasks).toEqual(planKr.tasks);
    expect(getKeyResultProgressPercent(merged)).toBe(34);
    expect(getKeyResultProgressRatioText(merged)).toBe('1/3');
  });
});
