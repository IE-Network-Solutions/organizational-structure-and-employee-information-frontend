import {
  clearReopenedPlanningTargets,
  forgetAchievedMilestones,
  collectAchievedMilestoneIdsFromReport,
  collectLinkedMilestoneIdsFromReport,
  isRecentlyAchievedMilestone,
  isRecentlyReopenedKeyResult,
  isRecentlyReopenedMilestone,
  mergePreviousAchievedWithSession,
  rememberAchievedMilestones,
  rememberReopenedPlanningTargets,
  useRecentlyAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';

describe('recentlyAchievedMilestones', () => {
  beforeEach(() => {
    useRecentlyAchievedMilestones.getState().clear();
    useRecentlyAchievedMilestones.persist.clearStorage();
  });

  it('remembers ids so disable works before API refetch', () => {
    expect(isRecentlyAchievedMilestone('m-new')).toBe(false);
    rememberAchievedMilestones(['m-new', 'm-old']);
    expect(isRecentlyAchievedMilestone('m-new')).toBe(true);
    expect(isRecentlyAchievedMilestone('m-old')).toBe(true);
  });

  it('persists achieved ids so refresh can keep them disabled', () => {
    rememberAchievedMilestones(['m-persist']);
    const raw = window.localStorage.getItem('recently-achieved-milestones');
    expect(raw).toBeTruthy();
    expect(raw).toContain('m-persist');
  });

  it('can reopen milestones and KRs without refresh', () => {
    rememberAchievedMilestones(['m-new']);
    rememberReopenedPlanningTargets({
      milestoneIds: ['m-new'],
      keyResultIds: ['kr-1'],
    });

    expect(isRecentlyAchievedMilestone('m-new')).toBe(false);
    expect(isRecentlyReopenedMilestone('m-new')).toBe(true);
    expect(isRecentlyReopenedKeyResult('kr-1')).toBe(true);

    clearReopenedPlanningTargets({
      milestoneIds: ['m-new'],
      keyResultIds: ['kr-1'],
    });
    expect(isRecentlyReopenedMilestone('m-new')).toBe(false);
    expect(isRecentlyReopenedKeyResult('kr-1')).toBe(false);

    rememberAchievedMilestones(['m-new']);
    forgetAchievedMilestones(['m-new']);
    expect(isRecentlyAchievedMilestone('m-new')).toBe(false);
  });

  it('collects milestone ids from Done achieveMK report rows', () => {
    const formattedData = [
      {
        keyResults: [
          {
            milestones: [
              {
                id: 'ms-1',
                tasks: [
                  { taskId: 't1', achieveMK: true },
                  { taskId: 't2', achieveMK: false },
                ],
              },
              {
                id: 'ms-2',
                tasks: [{ taskId: 't3', achieveMK: true }],
              },
            ],
          },
        ],
      },
    ];

    expect(
      collectAchievedMilestoneIdsFromReport(formattedData, {
        t1: 'Done',
        t2: 'Done',
        t3: 'Not',
      }),
    ).toEqual(['ms-1']);
  });

  it('also reads Done status from Ant form values', () => {
    const formattedData = [
      {
        keyResults: [
          {
            milestones: [
              {
                id: 'ms-form',
                tasks: [{ taskId: 'tf', achieveMK: true }],
              },
            ],
          },
        ],
      },
    ];

    expect(
      collectAchievedMilestoneIdsFromReport(
        formattedData,
        {},
        {
          tf: { status: 'Done', actualValue: 1 },
        },
      ),
    ).toEqual(['ms-form']);
  });

  it('collects KR-level achieveMK tasks linked to a milestone', () => {
    const formattedData = [
      {
        keyResults: [
          {
            tasks: [
              {
                taskId: 't-kr',
                achieveMK: true,
                milestoneId: 'ms-kr',
              },
            ],
            milestones: [],
          },
        ],
      },
    ];

    expect(
      collectAchievedMilestoneIdsFromReport(formattedData, {
        't-kr': 'Done',
      }),
    ).toEqual(['ms-kr']);
  });

  it('does not treat Done sub-key-result tasks as milestone achieved', () => {
    const formattedData = [
      {
        keyResults: [
          {
            milestones: [
              {
                id: 'ms-sub',
                tasks: [
                  {
                    taskId: 't-sub',
                    achieveMK: false,
                    milestoneId: 'ms-sub',
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    expect(
      collectAchievedMilestoneIdsFromReport(formattedData, {
        't-sub': 'Done',
      }),
    ).toEqual([]);
  });

  it('treats completed/done status variants as achieved', () => {
    const formattedData = [
      {
        keyResults: [
          {
            milestones: [
              {
                id: 'ms-done',
                tasks: [{ taskId: 't-done', achieveMK: true }],
              },
            ],
          },
        ],
      },
    ];

    expect(
      collectAchievedMilestoneIdsFromReport(formattedData, {
        't-done': 'completed',
      }),
    ).toEqual(['ms-done']);
  });

  it('merges sticky session ids when computing previous achieved for Done→Not', () => {
    rememberAchievedMilestones(['ms-1', 'ms-other']);
    const formattedData = [
      {
        keyResults: [
          {
            milestones: [
              {
                id: 'ms-1',
                tasks: [{ taskId: 't1', achieveMK: true }],
              },
              {
                id: 'ms-2',
                tasks: [{ taskId: 't2', achieveMK: true }],
              },
            ],
          },
        ],
      },
    ];

    expect(collectLinkedMilestoneIdsFromReport(formattedData)).toEqual([
      'ms-1',
      'ms-2',
    ]);
    expect(mergePreviousAchievedWithSession(formattedData, [])).toEqual([
      'ms-1',
    ]);
  });
});
