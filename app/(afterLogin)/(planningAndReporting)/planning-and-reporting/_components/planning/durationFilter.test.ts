import {
  activePlanPeriodToKind,
  cadenceAssignmentByKind,
  collectDeadlineTasksFromPlans,
  defaultHistoryRange,
  durationFilterLabel,
  formatHistoryRangeLabel,
  groupLinesByDeadlineCadence,
  planItemMatchesDurationFilter,
  plannedTaskToDeadlineTask,
  reportedAtMatchesDurationFilter,
  resolveSpan,
  taskInHistoryRange,
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

describe('history range helpers', () => {
  it('defaults to last 90 days through today', () => {
    expect(defaultHistoryRange('2026-09-07')).toEqual({
      from: '2026-06-09',
      to: '2026-09-07',
    });
  });

  it('formats custom range labels for the duration trigger', () => {
    expect(
      formatHistoryRangeLabel({ from: '2026-03-01', to: '2026-06-09' }),
    ).toBe('Mar 1 – Jun 9');
    expect(
      formatHistoryRangeLabel({ from: '2025-12-01', to: '2026-01-15' }),
    ).toBe('Dec 1, 2025 – Jan 15, 2026');
    expect(
      formatHistoryRangeLabel({ from: '2026-03-01', to: '2026-03-01' }),
    ).toBe('Mar 1, 2026');
  });

  it('keeps tasks whose deadline falls in range', () => {
    expect(
      taskInHistoryRange(
        { deadline: '2026-08-01' },
        '2026-07-01',
        '2026-08-31',
      ),
    ).toBe(true);
    expect(
      taskInHistoryRange(
        { deadline: '2026-06-01' },
        '2026-07-01',
        '2026-08-31',
      ),
    ).toBe(false);
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

describe('reportedAtMatchesDurationFilter', () => {
  const today = '2026-09-09'; // Wednesday

  it('matches Today only on the same calendar day', () => {
    expect(
      reportedAtMatchesDurationFilter(
        '2026-09-09T09:00:00.000Z',
        'daily',
        today,
      ),
    ).toBe(true);
    expect(
      reportedAtMatchesDurationFilter(
        '2026-09-08T09:00:00.000Z',
        'daily',
        today,
      ),
    ).toBe(false);
  });

  it('matches This Week using Monday–Sunday bounds', () => {
    // Week of Sep 9: Mon Sep 7 – Sun Sep 13
    expect(
      reportedAtMatchesDurationFilter(
        '2026-09-07T12:00:00.000Z',
        'week',
        today,
      ),
    ).toBe(true);
    expect(
      reportedAtMatchesDurationFilter(
        '2026-09-06T12:00:00.000Z',
        'week',
        today,
      ),
    ).toBe(false);
  });

  it('matches This Month and custom history ranges', () => {
    expect(
      reportedAtMatchesDurationFilter(
        '2026-09-01T12:00:00.000Z',
        'month',
        today,
      ),
    ).toBe(true);
    expect(
      reportedAtMatchesDurationFilter(
        '2026-08-31T12:00:00.000Z',
        'month',
        today,
      ),
    ).toBe(false);
    expect(
      reportedAtMatchesDurationFilter(
        '2026-08-15T12:00:00.000Z',
        'history',
        today,
        {
          from: '2026-08-01',
          to: '2026-08-31',
        },
      ),
    ).toBe(true);
    expect(
      reportedAtMatchesDurationFilter(
        '2026-09-01T12:00:00.000Z',
        'history',
        today,
        {
          from: '2026-08-01',
          to: '2026-08-31',
        },
      ),
    ).toBe(false);
  });
});
