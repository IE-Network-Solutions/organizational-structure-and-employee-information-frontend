import {
  appearsInThisMonth,
  appearsInThisWeek,
  appearsInToday,
  canAddDailySubtask,
  canAddWeeklySubtask,
  dateInRange,
  defaultDailySubtaskDate,
  isOverdue,
  kindFromSpan,
  monthBounds,
  rangesOverlap,
  spanDays,
  validateDailySubtask,
  validateRange,
  validateWeeklySubtask,
  weekBounds,
} from './bucket';
import type { DeadlineTask } from './types';

const task = (
  overrides: Partial<DeadlineTask> &
    Pick<DeadlineTask, 'id' | 'start' | 'deadline' | 'kind'>,
): DeadlineTask => {
  const days = spanDays(overrides.start, overrides.deadline);
  return {
    title: overrides.title ?? overrides.id,
    spanDays: overrides.spanDays ?? days ?? 1,
    parentId: overrides.parentId ?? null,
    done: overrides.done ?? false,
    ...overrides,
  };
};

describe('spanDays and kindFromSpan', () => {
  it('rejects deadline before start', () => {
    expect(spanDays('2026-08-21', '2026-08-20')).toBeNull();
    expect(validateRange('2026-08-21', '2026-08-20').ok).toBe(false);
  });

  it('counts inclusive calendar days including weekends', () => {
    expect(spanDays('2026-08-21', '2026-08-21')).toBe(1);
    expect(spanDays('2026-08-21', '2026-08-23')).toBe(3);
    expect(spanDays('2026-08-14', '2026-08-16')).toBe(3);
  });

  it('maps 1 / 3 / 4 / 14 / 15 day boundaries', () => {
    expect(kindFromSpan(1)).toBe('daily');
    expect(kindFromSpan(3)).toBe('week');
    expect(kindFromSpan(4)).toBe('week');
    expect(kindFromSpan(14)).toBe('week');
    expect(kindFromSpan(15)).toBe('month');
  });
});

describe('weekBounds', () => {
  it('uses Monday–Sunday containing today', () => {
    expect(weekBounds('2026-08-21')).toEqual({
      start: '2026-08-17',
      end: '2026-08-23',
    });
    expect(weekBounds('2026-08-17')).toEqual({
      start: '2026-08-17',
      end: '2026-08-23',
    });
    expect(weekBounds('2026-08-23')).toEqual({
      start: '2026-08-17',
      end: '2026-08-23',
    });
  });
});

describe('appearsInToday', () => {
  const today = '2026-08-21';

  it('shows a 1-day task on today', () => {
    const daily = task({
      id: 'd1',
      start: today,
      deadline: today,
      kind: 'daily',
    });
    expect(appearsInToday(daily, [daily], today)).toBe(true);
  });

  it('keeps an overdue 1-day task in Today', () => {
    const overdue = task({
      id: 'overdue',
      start: '2026-08-20',
      deadline: '2026-08-20',
      kind: 'daily',
    });
    expect(isOverdue(overdue, today)).toBe(true);
    expect(appearsInToday(overdue, [overdue], today)).toBe(true);
  });

  it('shows a 2–3 day week parent in Today when today is in span and there is no daily child', () => {
    const shortWeek = task({
      id: 'w23',
      start: '2026-08-20',
      deadline: '2026-08-22',
      kind: 'week',
      spanDays: 3,
    });
    expect(appearsInToday(shortWeek, [shortWeek], today)).toBe(true);
  });

  it('hides a 2–3 day week parent from Today when today is outside the span', () => {
    const shortWeek = task({
      id: 'w23-future',
      start: '2026-08-22',
      deadline: '2026-08-23',
      kind: 'week',
      spanDays: 2,
    });
    expect(appearsInToday(shortWeek, [shortWeek], today)).toBe(false);
    expect(appearsInThisWeek(shortWeek, today)).toBe(true);
  });

  it('does not show a 4+ day week parent in Today', () => {
    const week = task({
      id: 'w5',
      start: '2026-08-17',
      deadline: '2026-08-21',
      kind: 'week',
      spanDays: 5,
    });
    expect(appearsInToday(week, [week], today)).toBe(false);
  });

  it('hides a 2–3 day parent from Today when a daily child exists for today', () => {
    const parent = task({
      id: 'w23',
      start: '2026-08-20',
      deadline: '2026-08-22',
      kind: 'week',
      spanDays: 3,
    });
    const child = task({
      id: 'd-today',
      start: today,
      deadline: today,
      kind: 'daily',
      parentId: 'w23',
    });
    expect(appearsInToday(parent, [parent, child], today)).toBe(false);
    expect(appearsInToday(child, [parent, child], today)).toBe(true);
  });
});

describe('appearsInThisWeek', () => {
  const today = '2026-08-21';

  it('hides a 5-day task that starts next Monday', () => {
    const future = task({
      id: 'next-week',
      start: '2026-08-24',
      deadline: '2026-08-28',
      kind: 'week',
      spanDays: 5,
    });
    expect(appearsInThisWeek(future, today)).toBe(false);
  });

  it('keeps an overdue week task in This week after its span ended', () => {
    const overdue = task({
      id: 'last-week',
      start: '2026-08-10',
      deadline: '2026-08-14',
      kind: 'week',
      spanDays: 5,
    });
    expect(appearsInThisWeek(overdue, today)).toBe(true);
  });

  it('treats an 8-day span crossing two weeks as week, not month', () => {
    expect(kindFromSpan(8)).toBe('week');
    const crossing = task({
      id: 'cross-week',
      start: '2026-08-17',
      deadline: '2026-08-24',
      kind: 'week',
      spanDays: 8,
    });
    expect(appearsInThisWeek(crossing, today)).toBe(true);
    expect(appearsInThisMonth(crossing, today)).toBe(false);
  });
});

describe('appearsInThisMonth', () => {
  it('shows a 17-day year-crossing task in both December and January', () => {
    const yearCross = task({
      id: 'year',
      start: '2026-12-25',
      deadline: '2027-01-10',
      kind: 'month',
      spanDays: 17,
    });
    expect(kindFromSpan(17)).toBe('month');
    expect(appearsInThisMonth(yearCross, '2026-12-28')).toBe(true);
    expect(appearsInThisMonth(yearCross, '2027-01-05')).toBe(true);
    expect(appearsInThisMonth(yearCross, '2026-11-30')).toBe(false);
  });
});

describe('subtask validation', () => {
  const weekParent = task({
    id: 'week',
    start: '2026-08-17',
    deadline: '2026-08-21',
    kind: 'week',
    spanDays: 5,
  });
  const monthParent = task({
    id: 'month',
    start: '2026-08-01',
    deadline: '2026-08-20',
    kind: 'month',
    spanDays: 20,
  });

  it('rejects a daily subtask outside the parent span', () => {
    expect(validateDailySubtask(weekParent, '2026-08-22').ok).toBe(false);
    expect(validateDailySubtask(weekParent, '2026-08-19').ok).toBe(true);
  });

  it('rejects a daily subtask on a month parent', () => {
    expect(canAddDailySubtask(monthParent)).toBe(false);
    expect(validateDailySubtask(monthParent, '2026-08-10').ok).toBe(false);
  });

  it('rejects a weekly subtask outside the month span', () => {
    expect(
      validateWeeklySubtask(monthParent, '2026-08-18', '2026-08-25').ok,
    ).toBe(false);
    expect(
      validateWeeklySubtask(monthParent, '2026-08-10', '2026-08-16').ok,
    ).toBe(true);
  });

  it('rejects weekly subtask that is 1 day or 15+ days', () => {
    expect(
      validateWeeklySubtask(monthParent, '2026-08-10', '2026-08-10').ok,
    ).toBe(false);
    expect(canAddWeeklySubtask(weekParent)).toBe(false);
  });

  it('defaults daily subtask date to today when today is in range', () => {
    expect(defaultDailySubtaskDate(weekParent, '2026-08-21')).toBe(
      '2026-08-21',
    );
    expect(defaultDailySubtaskDate(weekParent, '2026-08-10')).toBe(
      '2026-08-17',
    );
  });
});

describe('dateInRange and overlap', () => {
  it('compares YYYY-MM-DD dates without UTC midnight', () => {
    expect(dateInRange('2026-08-21', '2026-08-21', '2026-08-21')).toBe(true);
    expect(
      rangesOverlap('2026-08-17', '2026-08-24', '2026-08-17', '2026-08-23'),
    ).toBe(true);
    expect(
      rangesOverlap('2026-08-24', '2026-08-28', '2026-08-17', '2026-08-23'),
    ).toBe(false);
  });

  it('month bounds cover the calendar month', () => {
    expect(monthBounds('2026-08-21')).toEqual({
      start: '2026-08-01',
      end: '2026-08-31',
    });
  });
});
