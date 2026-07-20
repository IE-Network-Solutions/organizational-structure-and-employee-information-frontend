import {
  collectAchievedMilestoneIdsFromReport,
  isRecentlyAchievedMilestone,
  rememberAchievedMilestones,
  useRecentlyAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';

describe('recentlyAchievedMilestones', () => {
  beforeEach(() => {
    useRecentlyAchievedMilestones.getState().clear();
  });

  it('remembers ids so disable works before API refetch', () => {
    expect(isRecentlyAchievedMilestone('m-new')).toBe(false);
    rememberAchievedMilestones(['m-new', 'm-old']);
    expect(isRecentlyAchievedMilestone('m-new')).toBe(true);
    expect(isRecentlyAchievedMilestone('m-old')).toBe(true);
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
});
