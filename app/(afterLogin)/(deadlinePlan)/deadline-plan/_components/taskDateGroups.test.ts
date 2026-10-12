import { describe, expect, it } from '@jest/globals';
import dayjs from 'dayjs';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { groupTasksByDate } from './taskDateGroups';

const today = dayjs('2026-10-12');
const taskOf = (
  id: string,
  deadline: string,
  overrides: Partial<DeadlineTask> = {},
) =>
  ({
    id,
    deadline,
    status: 'active',
    approvalStatus: 'open',
    ...overrides,
  }) as DeadlineTask;

describe('date-grouped task display', () => {
  it('puts unfinished overdue tasks first, followed by today and future dates in order', () => {
    const tasks = [
      taskOf('later', '2026-10-16'),
      taskOf('tomorrow', '2026-10-13'),
      taskOf('late', '2026-10-02'),
      taskOf('today', '2026-10-12'),
    ];
    const groups = groupTasksByDate(tasks, today);
    expect(groups.map((group) => group.id)).toEqual([
      'overdue',
      '2026-10-12',
      '2026-10-13',
      '2026-10-16',
    ]);
    expect(groups[0].tasks.map((task) => task.id)).toEqual(['late']);
    expect(groups[1].label).toBe('Oct 12 · Today · Monday');
    expect(groups[2].label).toBe('Oct 13 · Tomorrow · Tuesday');
    expect(tasks.map((task) => task.id)).toEqual([
      'later',
      'tomorrow',
      'late',
      'today',
    ]);
  });

  it('keeps reported and manager-closed tasks out of Overdue', () => {
    const groups = groupTasksByDate(
      [
        taskOf('reported', '2026-10-02', { status: 'reported' }),
        taskOf('closed', '2026-10-03', { approvalStatus: 'closed' }),
      ],
      today,
      false,
    );
    expect(groups.map((group) => group.id)).toEqual([
      '2026-10-02',
      '2026-10-03',
    ]);
    expect(groups.every((group) => !group.isOverdue)).toBe(true);
  });

  it('keeps an empty Today section available and does not add it to History', () => {
    expect(groupTasksByDate([], today)).toMatchObject([
      { id: '2026-10-12', tasks: [], isToday: true },
    ]);
    expect(groupTasksByDate([], today, false)).toEqual([]);
  });

  it('keeps each subtask with its parent instead of splitting it into another date section', () => {
    const parent = taskOf('parent', '2026-10-13', {
      subTasks: [taskOf('subtask', '2026-10-12')],
    });
    const groups = groupTasksByDate([parent], today);
    expect(groups[0].tasks).toEqual([]);
    expect(groups[1].tasks).toEqual([parent]);
    expect(groups[1].tasks[0].subTasks?.[0].id).toBe('subtask');
  });

  it('includes the year on date headings outside the current year', () => {
    expect(
      groupTasksByDate([taskOf('next-year', '2027-01-04')], today)[1].label,
    ).toBe('Jan 4, 2027 · Monday');
  });
});
