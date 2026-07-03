import {
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
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
});
