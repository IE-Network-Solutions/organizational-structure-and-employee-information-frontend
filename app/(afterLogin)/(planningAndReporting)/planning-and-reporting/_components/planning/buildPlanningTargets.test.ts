import {
  buildPickTargetsForKeyResult,
  buildPlanningTargetsFromObjectives,
  hasSelectablePlanningTargets,
} from './buildPlanningTargets';

describe('buildPlanningTargetsFromObjectives', () => {
  const objective = {
    items: [
      {
        keyResults: [
          {
            id: 'kr-2',
            title: 'Test-KR2',
            metricType: { name: 'Milestone' },
            milestones: [
              { id: 'm-1', title: 'First milestone', status: 'Completed' },
              { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
            ],
          },
        ],
      },
    ],
  };

  it('shows milestone labels, not the parent key-result title', () => {
    const apiRows = [
      {
        id: 'kr-2',
        metricType: { name: 'Milestone' },
        milestones: [
          // Simulates a plan/API shell carrying the parent KR title.
          { id: 'm-1', title: 'Test-KR2', status: 'Completed' },
          { id: 'm-2', title: 'Test-KR2', status: 'In Progress' },
        ],
      },
    ];

    const targets = buildPlanningTargetsFromObjectives(objective, apiRows);

    expect(targets.map((target) => target.milestoneTitle)).toEqual([
      'First milestone',
      'Second milestone',
    ]);
    expect(targets.every((target) => target.milestoneId != null)).toBe(true);
  });

  it('disables achieved milestones while keeping + for remaining milestones', () => {
    const targets = buildPlanningTargetsFromObjectives(objective);

    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });

  it('hides + only when every milestone is achieved', () => {
    const allAchieved = {
      items: [
        {
          keyResults: [
            {
              ...objective.items[0].keyResults[0],
              milestones: objective.items[0].keyResults[0].milestones.map(
                (milestone) => ({ ...milestone, status: 'Completed' }),
              ),
            },
          ],
        },
      ],
    };

    const targets = buildPlanningTargetsFromObjectives(allAchieved);

    expect(targets.every((target) => target.isCompleted)).toBe(true);
    expect(hasSelectablePlanningTargets(targets)).toBe(false);
  });
});

describe('buildPickTargetsForKeyResult', () => {
  it('uses objective milestone titles and disables Completed in the modal', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-2',
      keyResultTitle: 'Test-KR2',
      metricTypeName: 'Milestone',
      objectiveMilestones: [
        { id: 'm-1', title: 'First milestone', status: 'Completed' },
        { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
      ],
      // API wrongly labels milestones with the KR title
      apiKr: {
        id: 'kr-2',
        milestones: [
          { id: 'm-1', title: 'Test-KR2', status: 'Completed' },
          { id: 'm-2', title: 'Test-KR2', status: 'In Progress' },
        ],
      },
      // Old broken slot was KR-level only
      slots: [
        {
          id: 'okr-kr-kr-2',
          keyResultId: 'kr-2',
          keyResultTitle: 'Test-KR2',
          milestoneId: null,
          parentTaskId: null,
          isDailySlot: false,
        },
      ],
      userKeyResultItems: [],
    });

    expect(targets.map((t) => t.milestoneTitle)).toEqual([
      'First milestone',
      'Second milestone',
    ]);
    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });
});
