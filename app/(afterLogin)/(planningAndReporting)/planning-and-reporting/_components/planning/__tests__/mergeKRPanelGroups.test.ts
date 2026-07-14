import {
  aggregateKeyResultForPanel,
  collectPlanKeyResultIds,
  collectPlanOwnerUserIds,
  buildKrMetricLookupMap,
  reconcileOwnerGroupMetrics,
} from '../mergeKRPanelGroups';

describe('mergeKRPanelGroups — per-owner panel enrichment', () => {
  it('collects distinct plan owner user ids including logged-in user', () => {
    const ids = collectPlanOwnerUserIds(
      [
        { id: 'p1', ownerUserId: 'user-a' } as any,
        { id: 'p2', ownerUserId: 'user-b' } as any,
        { id: 'p3', ownerUserId: 'user-a' } as any,
      ],
      'viewer-1',
    );

    expect(ids.sort()).toEqual(['user-a', 'user-b', 'viewer-1'].sort());
  });

  it('collects kr ids from plan summaries', () => {
    const ids = collectPlanKeyResultIds([
      {
        id: 'p1',
        keyResults: [{ id: 'kr-1' }, { id: 'kr-2' }],
      } as any,
    ]);
    expect(ids.sort()).toEqual(['kr-1', 'kr-2']);
  });

  it('resolves metric type from plan owner apiKr, not only logged-in viewer', () => {
    const planKr = {
      id: 'kr-team',
      title: 'Team KR',
      progress: 40,
      targetValue: 0,
      milestones: [],
    };
    const ownerApiKr = {
      id: 'kr-team',
      metricType: { name: 'Percentage' },
      progress: 40,
      milestones: [],
    };
    const viewerApiKr = {
      id: 'kr-viewer',
      metricType: { name: 'Numeric' },
      progress: 10,
      milestones: [],
    };

    const aggregated = aggregateKeyResultForPanel(planKr, 2, [
      ownerApiKr,
      viewerApiKr,
    ]);

    expect(aggregated.metricType).toBe('Percentage');
    expect(aggregated.progressLabel).toBe('40/100');
  });

  it('reconciles plan-backed rows missing metric labels using api + plan kr', () => {
    const plans = [
      {
        id: 'plan-1',
        ownerUserId: 'lead-1',
        keyResults: [
          {
            id: 'kr-own',
            title: 'Own KR',
            progress: 50,
            milestones: [],
          },
        ],
      },
    ] as any;

    const apiItems = [
      {
        id: 'kr-own',
        metricType: { name: 'Achieve' },
        progress: 50,
      },
    ];

    const groups = [
      {
        ownerKey: 'Lead',
        owner: { name: 'Lead' },
        avgProgress: 50,
        krs: [
          {
            id: 'kr-own',
            title: 'Own KR',
            progress: 50,
            taskCount: 1,
            metricType: '',
            progressLabel: '50/100',
            targetValue: 0,
            currentValue: 0,
            isDeleted: false,
            planningBlocked: false,
          },
        ],
      },
    ] as any;

    const [group] = reconcileOwnerGroupMetrics(groups, plans, apiItems);
    expect(group.krs[0].metricType).toBe('Achieve');
  });

  it('keeps plan metric when api row exists but has no metricType (own-user path)', () => {
    const planKr = {
      id: 'kr-own',
      title: 'Own KR',
      metricType: { name: 'Currency' },
      progress: 20,
      milestones: [],
    };
    const thinApiKr = {
      id: 'kr-own',
      progress: 20,
      milestones: [],
    };

    const aggregated = aggregateKeyResultForPanel(planKr, 1, [thinApiKr]);
    expect(aggregated.metricType).toBe('Currency');
  });

  it('uses api metric when plan row has none (own daily/monthly thin plan payload)', () => {
    const planKr = {
      id: 'kr-own',
      title: 'Own KR',
      progress: 20,
      milestones: [],
    };
    const apiKr = {
      id: 'kr-own',
      metricType: { name: 'Numeric' },
      key_type: 'Numeric',
      progress: 20,
      milestones: [],
    };

    const aggregated = aggregateKeyResultForPanel(planKr, 1, [apiKr]);
    expect(aggregated.metricType).toBe('Numeric');
  });

  it('buildKrMetricLookupMap keeps Numeric from API when plan row is thin', () => {
    const map = buildKrMetricLookupMap(
      [{ id: 'kr-n', metricType: { name: 'Numeric' }, progress: 100 }],
      [
        {
          id: 'plan-1',
          keyResults: [{ id: 'kr-n', progress: 100, targetValue: 6 }],
        },
      ] as any,
    );

    expect(map.get('kr-n')?.metricType?.name).toBe('Numeric');
  });
});
