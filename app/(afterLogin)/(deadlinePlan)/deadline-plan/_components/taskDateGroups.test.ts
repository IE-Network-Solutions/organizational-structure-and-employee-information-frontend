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
  it('shows a month-long task starting today in Today instead of its future deadline section', () => {
    const current = dayjs('2026-10-14');
    const task = taskOf('monthly', '2026-11-14', { startDate: '2026-10-14' });
    const groups = groupTasksByDate([task], current);
    expect(groups.map((group) => group.id)).toEqual(['2026-10-14']);
    expect(groups[0].tasks).toEqual([task]);
    expect(groups[0].tasks[0].deadline).toBe('2026-11-14');
  });

  it('keeps ongoing tasks in Today on every day of their planned range, including the deadline', () => {
    const task = taskOf('monthly', '2026-11-14', { startDate: '2026-10-14' });
    for (const date of [
      '2026-10-14',
      '2026-10-31',
      '2026-11-01',
      '2026-11-14',
    ]) {
      expect(groupTasksByDate([task], dayjs(date))).toMatchObject([
        { id: date, tasks: [task] },
      ]);
    }
    expect(groupTasksByDate([task], dayjs('2026-11-15'))[0]).toMatchObject({
      id: 'overdue',
      tasks: [task],
    });
  });

  it('does not pull future-starting tasks into Today', () => {
    const task = taskOf('future', '2026-11-14', { startDate: '2026-10-15' });
    const groups = groupTasksByDate([task], dayjs('2026-10-14'));
    expect(groups[0].tasks).toEqual([]);
    expect(groups[1]).toMatchObject({ id: '2026-11-14', tasks: [task] });
  });

  it('keeps completed spanning tasks at their deadline, including in History', () => {
    const tasks = [
      taskOf('reported', '2026-11-14', {
        startDate: '2026-10-14',
        status: 'reported',
      }),
      taskOf('closed', '2026-11-15', {
        startDate: '2026-10-14',
        approvalStatus: 'closed',
      }),
    ];
    expect(groupTasksByDate(tasks, dayjs('2026-10-14'))[0].tasks).toEqual([]);
    expect(
      groupTasksByDate(tasks, dayjs('2026-10-14'), false).map(
        (group) => group.id,
      ),
    ).toEqual(['2026-11-14', '2026-11-15']);
  });

  it('does not duplicate a spanning parent or split its subtasks across days', () => {
    const task = taskOf('monthly', '2026-11-14', {
      startDate: '2026-10-14',
      subTasks: [taskOf('subtask', '2026-10-20', { startDate: '2026-10-20' })],
    });
    const groups = groupTasksByDate([task], dayjs('2026-10-14'));
    expect(groups.flatMap((group) => group.tasks)).toEqual([task]);
    expect(groups[0].tasks[0].subTasks).toEqual(task.subTasks);
  });
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
