import { describe, expect, it } from '@jest/globals';
import dayjs from 'dayjs';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import {
  deadlineLabel,
  getInitials,
  getSubordinateIds,
  pinFirst,
  resolveApproval,
  resolveDurationRange,
  resolveMetricKind,
  resolveTaskPermissions,
  resolveTaskStatus,
  TaskViewer,
} from './utils';

const taskOf = (overrides: Partial<DeadlineTask> = {}): DeadlineTask =>
  ({
    id: 'task-1',
    title: 'Ship it',
    assigneeId: 'me',
    assignedById: null,
    parentTaskId: null,
    startDate: '2026-10-11',
    deadline: '2026-10-11',
    isLocked: false,
    lockedById: null,
    status: 'active',
    outcome: null,
    approvalStatus: 'open',
    ...overrides,
  }) as DeadlineTask;

const viewerOf = (overrides: Partial<TaskViewer> = {}): TaskViewer => ({
  userId: 'me',
  subordinateIds: [],
  canManageAll: false,
  ...overrides,
});

// Sunday, so the Mon–Sun week it belongs to started the previous Monday.
const today = dayjs('2026-10-11');

describe('resolveDurationRange', () => {
  it('uses a single day for Today and carries overdue tasks', () => {
    expect(resolveDurationRange('today', today)).toEqual({
      from: '2026-10-11',
      to: '2026-10-11',
      includeOverdue: true,
    });
  });

  it('runs This Week from Monday to Sunday', () => {
    expect(resolveDurationRange('week', today)).toMatchObject({
      from: '2026-10-05',
      to: '2026-10-11',
    });
    expect(resolveDurationRange('week', dayjs('2026-10-12'))).toMatchObject({
      from: '2026-10-12',
      to: '2026-10-18',
    });
  });

  it('covers the whole calendar month', () => {
    expect(resolveDurationRange('month', today)).toMatchObject({
      from: '2026-10-01',
      to: '2026-10-31',
    });
  });

  it('uses the custom History range and never carries overdue tasks', () => {
    expect(
      resolveDurationRange('history', today, ['2026-01-01', '2026-03-31']),
    ).toEqual({ from: '2026-01-01', to: '2026-03-31', includeOverdue: false });
  });

  it('defaults History to the last 30 days', () => {
    expect(resolveDurationRange('history', today, null)).toMatchObject({
      from: '2026-09-11',
      to: '2026-10-11',
    });
  });
});

describe('deadlineLabel', () => {
  it('counts down to the deadline', () => {
    expect(deadlineLabel(taskOf(), today).text).toBe('Due today');
    expect(deadlineLabel(taskOf({ deadline: '2026-10-12' }), today).text).toBe(
      'Due tomorrow',
    );
    expect(deadlineLabel(taskOf({ deadline: '2026-10-16' }), today).text).toBe(
      'Due in 5 days',
    );
  });

  it('flags overdue tasks', () => {
    expect(deadlineLabel(taskOf({ deadline: '2026-10-10' }), today)).toEqual({
      text: 'Overdue by 1 day',
      tone: 'danger',
    });
    expect(deadlineLabel(taskOf({ deadline: '2026-10-08' }), today).text).toBe(
      'Overdue by 3 days',
    );
  });

  it('shows the plain date once a task is reported', () => {
    expect(
      deadlineLabel(
        taskOf({ deadline: '2026-10-08', status: 'reported' }),
        today,
      ),
    ).toEqual({ text: 'Oct 8, 2026', tone: 'neutral' });
  });
});

describe('resolveTaskStatus / resolveApproval', () => {
  it('prefers Reported over Locked', () => {
    expect(
      resolveTaskStatus(taskOf({ status: 'reported', isLocked: true })).label,
    ).toBe('Reported');
  });

  it('shows Closed for a task a manager closed without a report', () => {
    expect(resolveTaskStatus(taskOf({ approvalStatus: 'closed' })).label).toBe(
      'Closed',
    );
  });

  it('shows Locked, then In progress', () => {
    expect(resolveTaskStatus(taskOf({ isLocked: true })).label).toBe('Locked');
    expect(resolveTaskStatus(taskOf()).label).toBe('In progress');
  });

  it('has no approval badge until the task is reported', () => {
    expect(resolveApproval(taskOf())).toBeNull();
    expect(resolveApproval(taskOf({ approvalStatus: 'pending' }))?.label).toBe(
      'Pending',
    );
    expect(resolveApproval(taskOf({ approvalStatus: 'closed' }))?.label).toBe(
      'Closed',
    );
  });
});

describe('resolveTaskPermissions', () => {
  it('lets the assignee edit, report and lock their open task', () => {
    expect(resolveTaskPermissions(taskOf(), viewerOf())).toEqual({
      canEdit: true,
      canReport: true,
      canUndoReport: false,
      canLock: true,
      canUnlock: false,
      canApprove: false,
    });
  });

  it('never lets someone approve their own task', () => {
    const permissions = resolveTaskPermissions(
      taskOf({ status: 'reported', approvalStatus: 'pending' }),
      viewerOf({ canManageAll: true }),
    );
    expect(permissions.canApprove).toBe(false);
    expect(permissions.canUndoReport).toBe(true);
  });

  it('gives a direct manager approval over a report', () => {
    const permissions = resolveTaskPermissions(
      taskOf({
        assigneeId: 'alice',
        status: 'reported',
        approvalStatus: 'pending',
      }),
      viewerOf({ subordinateIds: ['alice'] }),
    );
    expect(permissions.canApprove).toBe(true);
    expect(permissions.canEdit).toBe(false);
  });

  it('treats the person who delegated a task as its manager', () => {
    expect(
      resolveTaskPermissions(
        taskOf({ assigneeId: 'bob', assignedById: 'me' }),
        viewerOf(),
      ).canApprove,
    ).toBe(true);
  });

  it('gives no control over an unrelated person’s task', () => {
    expect(
      resolveTaskPermissions(taskOf({ assigneeId: 'stranger' }), viewerOf()),
    ).toEqual({
      canEdit: false,
      canReport: false,
      canUndoReport: false,
      canLock: false,
      canUnlock: false,
      canApprove: false,
    });
  });

  it('blocks edits on a locked task but still allows reporting', () => {
    const permissions = resolveTaskPermissions(
      taskOf({ isLocked: true, lockedById: 'me' }),
      viewerOf(),
    );
    expect(permissions.canEdit).toBe(false);
    expect(permissions.canReport).toBe(true);
    expect(permissions.canUnlock).toBe(true);
  });

  it('stops the assignee lifting a lock their manager placed', () => {
    expect(
      resolveTaskPermissions(
        taskOf({ isLocked: true, lockedById: 'boss' }),
        viewerOf(),
      ).canUnlock,
    ).toBe(false);
  });

  it('only lets a manager reopen a closed task', () => {
    const closed = taskOf({
      assigneeId: 'alice',
      status: 'reported',
      approvalStatus: 'closed',
    });
    expect(
      resolveTaskPermissions(closed, viewerOf({ userId: 'alice' }))
        .canUndoReport,
    ).toBe(false);
    expect(
      resolveTaskPermissions(closed, viewerOf({ subordinateIds: ['alice'] }))
        .canUndoReport,
    ).toBe(true);
  });
});

describe('helpers', () => {
  it('maps metric type names to how the form treats them', () => {
    expect(
      resolveMetricKind({ metricType: { name: 'Milestone' } } as any),
    ).toBe('milestone');
    expect(resolveMetricKind({ metricType: { name: 'Achieve' } } as any)).toBe(
      'achieve',
    );
    expect(
      resolveMetricKind({ metricType: { name: 'Percentage' } } as any),
    ).toBe('numeric');
    expect(resolveMetricKind(null)).toBeNull();
  });

  it('finds direct reports, honouring a delegated manager', () => {
    const employees = [
      { id: 'a', reportingTo: { id: 'me' } },
      { id: 'b', reportingTo: { id: 'other' } },
      { id: 'c', reportingTo: { id: 'other' }, delegatedTo: { id: 'me' } },
    ];
    expect(getSubordinateIds(employees, 'me')).toEqual(['a', 'c']);
  });

  it('pins the signed-in user first without adding them', () => {
    expect(pinFirst(['a', 'me', 'b'], 'me')).toEqual(['me', 'a', 'b']);
    expect(pinFirst(['a', 'b'], 'me')).toEqual(['a', 'b']);
  });

  it('builds initials from the first and last name', () => {
    expect(getInitials('Alex Morgan')).toBe('AM');
    expect(getInitials('Alice Bee Nguyen')).toBe('AN');
    expect(getInitials('')).toBe('?');
  });
});
