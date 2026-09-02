import {
  activePlanPeriodToKind,
  cadenceAssignmentByKind,
  collectDeadlineTasksFromPlans,
  durationFilterLabel,
  groupLinesByDeadlineCadence,
  planItemMatchesDurationFilter,
  plannedTaskToDeadlineTask,
  resolveSpan,
} from './durationFilter';

describe('duration tab helpers', () => {
  it('maps tab index to kind and labels', () => {
    expect(activePlanPeriodToKind(1)).toBe('daily');
    expect(activePlanPeriodToKind(2)).toBe('week');
    expect(activePlanPeriodToKind(3)).toBe('month');
    expect(durationFilterLabel('daily')).toBe('Today');
    expect(durationFilterLabel('week')).toBe('This Week');
    expect(durationFilterLabel('month')).toBe('This Month');
  });
});

describe('resolveSpan', () => {
  it('classifies 1 day as daily, 2–14 as week, 15+ as month', () => {
    expect(resolveSpan('2026-08-25', '2026-08-25')).toEqual({
      spanDays: 1,
      kind: 'daily',
    });
    expect(resolveSpan('2026-08-25', '2026-08-29')).toEqual({
      spanDays: 5,
      kind: 'week',
    });
    expect(resolveSpan('2026-08-25', '2026-09-08')).toEqual({
      spanDays: 15,
      kind: 'month',
    });
  });

  it('returns null when dates are missing or inverted', () => {
    expect(resolveSpan(null, '2026-08-25')).toBeNull();
    expect(resolveSpan('2026-08-25', '2026-08-24')).toBeNull();
  });
});

describe('groupLinesByDeadlineCadence', () => {
  const assignments = cadenceAssignmentByKind(
    [
      { id: 'p-daily', name: 'Daily' },
      { id: 'p-week', name: 'Weekly' },
      { id: 'p-month', name: 'Monthly' },
    ],
    [
      { id: 'u-daily', planningPeriod: { id: 'p-daily', name: 'Daily' } },
      { id: 'u-week', planningPeriod: { id: 'p-week', name: 'Weekly' } },
      { id: 'u-month', planningPeriod: { id: 'p-month', name: 'Monthly' } },
    ],
  );

  it('groups lines onto Daily / Weekly / Monthly periods by span', () => {
    const result = groupLinesByDeadlineCadence(
      [
        { start: '2026-08-25', deadline: '2026-08-25', id: 'd' },
        { start: '2026-08-25', deadline: '2026-08-29', id: 'w' },
        { start: '2026-08-01', deadline: '2026-08-20', id: 'm' },
      ],
      assignments,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const byKind = Object.fromEntries(
      result.groups.map((g) => [g.kind, g.planningPeriodId]),
    );
    expect(byKind).toEqual({
      daily: 'p-daily',
      week: 'p-week',
      month: 'p-month',
    });
  });

  it('errors when a cadence has no planning period', () => {
    const result = groupLinesByDeadlineCadence(
      [{ start: '2026-08-25', deadline: '2026-08-25' }],
      cadenceAssignmentByKind([], []),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Daily/i);
  });
});

describe('planItemMatchesDurationFilter', () => {
  const today = '2026-08-25';

  it('uses start/end dates instead of the source period name', () => {
    const weeklySourcedDailyTask = {
      _periodName: 'Weekly',
      tasks: [
        {
          id: 't1',
          startDate: today,
          endDate: today,
        },
      ],
    };
    expect(
      planItemMatchesDurationFilter(
        weeklySourcedDailyTask,
        'daily',
        today,
        {},
        'week',
      ),
    ).toBe(true);
    expect(
      planItemMatchesDurationFilter(
        weeklySourcedDailyTask,
        'week',
        today,
        {},
        'week',
      ),
    ).toBe(false);
  });

  it('falls back to the source period when a task has no dates', () => {
    const undated = {
      _periodName: 'Weekly',
      tasks: [{ id: 't2', task: 'No dates' }],
    };
    expect(
      planItemMatchesDurationFilter(undated, 'week', today, {}, 'week'),
    ).toBe(true);
    expect(
      planItemMatchesDurationFilter(undated, 'daily', today, {}, 'week'),
    ).toBe(false);
  });

  it('prefers the local date overlay when the API omits dates', () => {
    const plan = {
      tasks: [{ id: 't3', task: 'Overlaid', keyResultId: 'kr-1' }],
    };
    const overlay = {
      t3: { start: today, deadline: today },
    };
    expect(
      planItemMatchesDurationFilter(plan, 'daily', today, overlay, 'week'),
    ).toBe(true);
  });
});

describe('plannedTaskToDeadlineTask', () => {
  const today = '2026-08-28';

  it('maps start/end dates, parent, and done status onto a deadline task', () => {
    const mapped = plannedTaskToDeadlineTask(
      {
        id: 'task-1',
        task: 'Ship login fix',
        startDate: '2026-08-28T00:00:00.000Z',
        endDate: '2026-08-30T00:00:00.000Z',
        parentTaskId: 'week-parent',
        status: 'pre_achieved',
        keyResult: { title: 'Auth reliability' },
      },
      {},
      'week',
      today,
      'period-week',
    );
    expect(mapped).toMatchObject({
      id: 'task-1',
      title: 'Ship login fix',
      start: '2026-08-28',
      deadline: '2026-08-30',
      spanDays: 3,
      kind: 'week',
      parentId: 'week-parent',
      done: true,
      keyResultTitle: 'Auth reliability',
      planningPeriodId: 'period-week',
      sourceStatus: 'pre_achieved',
    });
  });

  it('uses the local overlay when the API omits dates', () => {
    const mapped = plannedTaskToDeadlineTask(
      { id: 'task-2', task: 'Overlaid daily' },
      { 'task-2': { start: today, deadline: today } },
      'week',
      today,
    );
    expect(mapped).toMatchObject({
      kind: 'daily',
      start: today,
      deadline: today,
      spanDays: 1,
    });
  });
});

describe('collectDeadlineTasksFromPlans', () => {
  it('flattens unreported plan tasks and classifies them by date span', () => {
    const today = '2026-08-28';
    const tasks = collectDeadlineTasksFromPlans(
      [
        {
          _periodName: 'Weekly',
          planningPeriodId: 'p-week',
          tasks: [
            {
              id: 'd1',
              task: 'Today standup',
              startDate: today,
              endDate: today,
            },
            {
              id: 'w1',
              task: 'Sprint slice',
              startDate: today,
              endDate: '2026-09-02',
            },
          ],
        },
      ],
      {},
      today,
    );
    expect(tasks.map((t) => [t.id, t.kind])).toEqual([
      ['d1', 'daily'],
      ['w1', 'week'],
    ]);
  });
});
