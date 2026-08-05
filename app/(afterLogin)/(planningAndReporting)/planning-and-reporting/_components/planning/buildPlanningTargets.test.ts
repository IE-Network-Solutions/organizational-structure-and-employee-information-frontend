import {
  buildPickTargetsForKeyResult,
  buildPlanningTargetsFromObjectives,
  hasSelectablePlanningTargets,
} from './buildPlanningTargets';
import {
  rememberAchievedMilestones,
  rememberReopenedPlanningTargets,
  useRecentlyAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';

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

  it('keeps remaining milestones selectable when KR progress is 100 from sub-tasks', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-partial',
      keyResultTitle: 'Partial KR',
      metricTypeName: 'Milestone',
      planningBlocked: false,
      objectiveMilestones: [
        { id: 'm-1', title: 'First', status: 'In Progress', progress: 100 },
        { id: 'm-2', title: 'Second', status: 'In Progress', progress: 0 },
      ],
      apiKr: {
        id: 'kr-partial',
        progress: 100,
        metricType: { name: 'Milestone' },
        milestones: [
          { id: 'm-1', title: 'First', status: 'In Progress', progress: 100 },
          { id: 'm-2', title: 'Second', status: 'In Progress', progress: 0 },
        ],
      },
      userKeyResultItems: [],
    });

    expect(targets).toHaveLength(2);
    expect(targets.every((t) => t.isCompleted)).toBe(false);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });

  it('marks every milestone disabled when planningBlocked', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-done',
      keyResultTitle: 'Done KR',
      metricTypeName: 'Milestone',
      planningBlocked: true,
      objectiveMilestones: [
        { id: 'm-1', title: 'A', status: 'Completed' },
        { id: 'm-2', title: 'B', status: 'Completed' },
      ],
      apiKr: {
        id: 'kr-done',
        progress: 100,
        milestones: [
          { id: 'm-1', title: 'Done KR', status: 'Completed' },
          { id: 'm-2', title: 'Done KR', status: 'Completed' },
        ],
      },
    });

    expect(targets.every((t) => t.isCompleted)).toBe(true);
    expect(hasSelectablePlanningTargets(targets)).toBe(false);
  });

  it('hides selectable KR-level slot when the key result is fully achieved', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-achieve',
      keyResultTitle: 'Achieve KR',
      metricTypeName: 'Achieve',
      planningBlocked: true,
      objectiveMilestones: [],
      apiKr: {
        id: 'kr-achieve',
        progress: 100,
        currentValue: 1,
        targetValue: 1,
        metricType: { name: 'Achieve' },
      },
      slots: [
        {
          id: 'okr-kr-kr-achieve',
          keyResultId: 'kr-achieve',
          keyResultTitle: 'Achieve KR',
          milestoneId: null,
          parentTaskId: null,
          isDailySlot: false,
        },
      ],
    });

    expect(targets).toEqual([]);
    expect(hasSelectablePlanningTargets(targets)).toBe(false);
  });

  it('keeps Completed from API when objective status is empty', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-2',
      keyResultTitle: 'Test-KR2',
      metricTypeName: 'Milestone',
      objectiveMilestones: [
        { id: 'm-1', title: 'First milestone' },
        { id: 'm-2', title: 'Second milestone' },
      ],
      apiKr: {
        id: 'kr-2',
        milestones: [
          { id: 'm-1', title: 'Test-KR2', status: 'Completed' },
          { id: 'm-2', title: 'Test-KR2', status: 'In Progress' },
        ],
      },
    });

    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
    expect(targets.map((t) => t.milestoneTitle)).toEqual([
      'First milestone',
      'Second milestone',
    ]);
  });

  it('disables when only the objective row carries Completed', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-2',
      keyResultTitle: 'Test-KR2',
      metricTypeName: 'Milestone',
      objectiveMilestones: [
        { id: 'm-1', title: 'First milestone', status: 'Completed' },
        { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
      ],
      // Plan/API shells without status must not wipe objective Completed.
      apiKr: {
        id: 'kr-2',
        milestones: [
          { id: 'm-1', title: 'Test-KR2', tasks: [{ id: 't1' }] },
          { id: 'm-2', title: 'Test-KR2', tasks: [{ id: 't2' }] },
        ],
      },
      panelMilestones: [
        { id: 'm-1', title: 'Test-KR2', tasks: [{ id: 't1' }] },
        { id: 'm-2', title: 'Test-KR2', tasks: [{ id: 't2' }] },
      ],
    });

    expect(targets.map((t) => t.milestoneTitle)).toEqual([
      'First milestone',
      'Second milestone',
    ]);
    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });

  it('disables when API has Completed and panel only has plan shells', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-2',
      keyResultTitle: 'Test-KR2',
      metricTypeName: 'Milestone',
      objectiveMilestones: [
        { id: 'm-1', title: 'First milestone' },
        { id: 'm-2', title: 'Second milestone' },
      ],
      panelMilestones: [
        { id: 'm-1', title: 'First milestone', tasks: [{ id: 't1' }] },
        { id: 'm-2', title: 'Second milestone', tasks: [{ id: 't2' }] },
      ],
      apiKr: {
        id: 'kr-2',
        metricType: { name: 'Milestone' },
        milestones: [
          { id: 'm-1', title: 'First milestone', status: 'completed' },
          { id: 'm-2', title: 'Second milestone', status: 'pending' },
        ],
      },
      userKeyResultItems: [
        {
          id: 'kr-2',
          metricType: { name: 'Milestone' },
          milestones: [
            { id: 'm-1', title: 'First milestone', status: 'completed' },
            { id: 'm-2', title: 'Second milestone', status: 'pending' },
          ],
        },
      ],
    });

    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });
});

describe('planning completion session rules', () => {
  const milestoneObjective = [
    { id: 'm-1', title: 'First milestone', status: 'Completed' },
    { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
  ];

  beforeEach(() => {
    useRecentlyAchievedMilestones.getState().clear();
  });

  it('keeps achieved siblings when only another milestone is reopened', () => {
    rememberAchievedMilestones(['m-1']);
    rememberReopenedPlanningTargets({ milestoneIds: ['m-2'] });

    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-2',
      keyResultTitle: 'Test-KR2',
      metricTypeName: 'Milestone',
      objectiveMilestones: milestoneObjective,
      apiKr: {
        id: 'kr-2',
        milestones: [
          { id: 'm-1', title: 'First milestone', status: 'Completed' },
          { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
        ],
      },
    });

    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });

  it('does not clear achieved milestones when only the KR is reopened', () => {
    rememberAchievedMilestones(['m-1']);
    rememberReopenedPlanningTargets({ keyResultIds: ['kr-2'] });

    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-2',
      keyResultTitle: 'Test-KR2',
      metricTypeName: 'Milestone',
      objectiveMilestones: milestoneObjective,
      apiKr: {
        id: 'kr-2',
        milestones: [
          { id: 'm-1', title: 'First milestone', status: 'Completed' },
          { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
        ],
      },
    });

    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
  });

  it('sub-key-result progress alone does not mark milestones achieved', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-partial',
      keyResultTitle: 'Partial KR',
      metricTypeName: 'Milestone',
      objectiveMilestones: [
        { id: 'm-1', title: 'First', status: 'In Progress', progress: 100 },
        { id: 'm-2', title: 'Second', status: 'In Progress', progress: 0 },
      ],
      apiKr: {
        id: 'kr-partial',
        progress: 100,
        metricType: { name: 'Milestone' },
        milestones: [
          { id: 'm-1', title: 'First', status: 'In Progress', progress: 100 },
          { id: 'm-2', title: 'Second', status: 'In Progress', progress: 0 },
        ],
      },
    });

    expect(targets.every((t) => !t.isCompleted)).toBe(true);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });

  it('keeps objective Completed when a later stale API row omits status', () => {
    const targets = buildPickTargetsForKeyResult({
      keyResultId: 'kr-2',
      keyResultTitle: 'Test-KR2',
      metricTypeName: 'Milestone',
      objectiveMilestones: [
        { id: 'm-1', title: 'First milestone', status: 'Completed' },
        { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
      ],
      apiKr: {
        id: 'kr-2',
        metricType: { name: 'Milestone' },
        milestones: [
          { id: 'm-1', title: 'First milestone', status: 'In Progress' },
          { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
        ],
      },
      userKeyResultItems: [
        {
          id: 'kr-2',
          metricType: { name: 'Milestone' },
          milestones: [
            { id: 'm-1', title: 'First milestone', status: 'In Progress' },
            { id: 'm-2', title: 'Second milestone', status: 'In Progress' },
          ],
        },
      ],
    });

    expect(targets[0]?.isCompleted).toBe(true);
    expect(targets[1]?.isCompleted).toBe(false);
    expect(hasSelectablePlanningTargets(targets)).toBe(true);
  });
});
