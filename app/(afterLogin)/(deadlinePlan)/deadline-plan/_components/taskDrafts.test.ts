import { describe, expect, it } from '@jest/globals';
import {
  createSubTaskDraft,
  createTaskDraft,
  draftFromTask,
  draftToPayload,
  TaskDraft,
  validateTaskDraft,
  withAssignee,
  withDateRange,
  withKeyResult,
} from './taskDrafts';

const draftOf = (overrides: Partial<TaskDraft> = {}): TaskDraft => ({
  ...createTaskDraft({ assigneeId: 'me', date: '2026-10-11' }),
  title: 'Ship it',
  ...overrides,
});

const keyResultOf = (metric: string) =>
  ({ id: 'kr-1', title: 'KR', metricType: { id: 'm', name: metric } }) as any;

describe('createTaskDraft', () => {
  it('starts as a one-day general task for the given assignee', () => {
    expect(
      createTaskDraft({ assigneeId: 'me', date: '2026-10-11' }),
    ).toMatchObject({
      assigneeId: 'me',
      startDate: '2026-10-11',
      deadline: '2026-10-11',
      priority: 'medium',
      keyResultId: null,
      subTasks: [],
    });
  });
});

describe('key result and milestone', () => {
  const linked = draftOf({
    keyResultId: 'kr-1',
    milestoneId: 'ms-1',
    targetValue: 5,
    achieveKR: true,
  });

  it('clears the milestone and metric inputs when the key result changes', () => {
    expect(withKeyResult(linked, 'kr-2')).toMatchObject({
      keyResultId: 'kr-2',
      milestoneId: null,
      targetValue: null,
      achieveKR: false,
    });
  });

  it('keeps everything when the same key result is picked again', () => {
    expect(withKeyResult(linked, 'kr-1')).toBe(linked);
  });

  it('turns the task into a general task with "No key result"', () => {
    expect(withKeyResult(linked, null)).toMatchObject({
      keyResultId: null,
      milestoneId: null,
    });
  });

  it('unlinks the key result when the assignee changes', () => {
    expect(withAssignee(linked, 'alice')).toMatchObject({
      assigneeId: 'alice',
      keyResultId: null,
      milestoneId: null,
    });
  });
});

describe('withDateRange', () => {
  it('pulls subtask dates back inside a narrower range', () => {
    const draft = draftOf({
      startDate: '2026-10-01',
      deadline: '2026-10-31',
      subTasks: [
        { ...createSubTaskDraft('2026-10-02'), title: 'early' },
        { ...createSubTaskDraft('2026-10-15'), title: 'inside' },
        { ...createSubTaskDraft('2026-10-30'), title: 'late' },
      ],
    });

    const moved = withDateRange(draft, '2026-10-10', '2026-10-20');

    expect(moved.subTasks.map((subTask) => subTask.date)).toEqual([
      '2026-10-10',
      '2026-10-15',
      '2026-10-20',
    ]);
  });
});

describe('validateTaskDraft', () => {
  it('passes a complete draft', () => {
    expect(validateTaskDraft(draftOf())).toBeNull();
  });

  it('requires a title', () => {
    expect(validateTaskDraft(draftOf({ title: '   ' }))?.title).toBeDefined();
  });

  it('rejects a deadline before the start date', () => {
    expect(
      validateTaskDraft(
        draftOf({ startDate: '2026-10-12', deadline: '2026-10-11' }),
      )?.dates,
    ).toBeDefined();
  });

  it('reports each invalid subtask by its key', () => {
    const untitled = createSubTaskDraft('2026-10-11');
    const outside = { ...createSubTaskDraft('2026-10-20'), title: 'late' };
    const fine = { ...createSubTaskDraft('2026-10-11'), title: 'ok' };

    const errors = validateTaskDraft(
      draftOf({ subTasks: [untitled, outside, fine] }),
    );

    expect(Object.keys(errors?.subTasks ?? {})).toEqual([
      untitled.key,
      outside.key,
    ]);
  });
});

describe('draftToPayload', () => {
  it('sends a general task with no key result fields', () => {
    expect(
      draftToPayload(draftOf({ title: ' Ship it ', description: '  ' }), null),
    ).toMatchObject({
      title: 'Ship it',
      description: null,
      keyResultId: null,
      milestoneId: null,
      targetValue: null,
      achieveKR: false,
    });
  });

  it('sends the target only for a numeric key result', () => {
    const draft = draftOf({
      keyResultId: 'kr-1',
      targetValue: 12,
      achieveKR: true,
    });
    expect(draftToPayload(draft, keyResultOf('Numeric'))).toMatchObject({
      targetValue: 12,
      achieveKR: false,
    });
    expect(draftToPayload(draft, keyResultOf('Achieve'))).toMatchObject({
      targetValue: null,
      achieveKR: true,
    });
  });

  it('only completes a milestone when one is selected', () => {
    const draft = draftOf({ keyResultId: 'kr-1', achieveKR: true });
    expect(draftToPayload(draft, keyResultOf('Milestone')).achieveKR).toBe(
      false,
    );
    expect(
      draftToPayload(
        { ...draft, milestoneId: 'ms-1' },
        keyResultOf('Milestone'),
      ),
    ).toMatchObject({ milestoneId: 'ms-1', achieveKR: true });
  });

  it('keeps the id of existing subtasks so they are updated, not recreated', () => {
    const payload = draftToPayload(
      draftOf({
        subTasks: [
          { ...createSubTaskDraft('2026-10-11'), id: 'sub-1', title: 'old' },
          { ...createSubTaskDraft('2026-10-11'), title: 'new' },
        ],
      }),
      null,
    );
    expect(payload.subTasks).toEqual([
      { id: 'sub-1', title: 'old', date: '2026-10-11', description: null },
      { title: 'new', date: '2026-10-11', description: null },
    ]);
  });
});

describe('draftFromTask', () => {
  it('round-trips a task with subtasks into an editable draft', () => {
    const draft = draftFromTask({
      id: 'task-1',
      title: 'Ship it',
      description: null,
      priority: 'high',
      startDate: '2026-10-11',
      deadline: '2026-10-15',
      assigneeId: 'alice',
      keyResultId: 'kr-1',
      milestoneId: 'ms-1',
      targetValue: 3,
      achieveKR: true,
      subTasks: [
        {
          id: 'sub-1',
          title: 'Draft',
          startDate: '2026-10-12',
          description: 'notes',
        },
      ],
    } as any);

    expect(draft).toMatchObject({
      title: 'Ship it',
      description: '',
      priority: 'high',
      assigneeId: 'alice',
      keyResultId: 'kr-1',
      milestoneId: 'ms-1',
      targetValue: 3,
      achieveKR: true,
    });
    expect(draft.subTasks[0]).toMatchObject({
      id: 'sub-1',
      title: 'Draft',
      date: '2026-10-12',
      description: 'notes',
    });
  });
});
