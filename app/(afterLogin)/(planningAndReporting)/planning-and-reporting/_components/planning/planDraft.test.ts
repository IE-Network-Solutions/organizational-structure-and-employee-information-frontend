import { describe, expect, it } from '@jest/globals';
import { UNLINKED_KR_ID } from '../prototype/mockPlanningConstants';
import type { PlanningTarget } from './buildPlanningTargets';
import {
  applyTargetToDraftLine,
  createEmptyDraftLine,
  createEmptyDraftSubtask,
  validateDraftBundlesForCreate,
  validateDraftLineField,
  validateDraftLinesForCreate,
  validateDraftSubtaskField,
  apiKeyResultId,
} from './planDraft';

const sampleTarget = (
  overrides: Partial<PlanningTarget> = {},
): PlanningTarget => ({
  id: 't1',
  keyResultId: 'kr-1',
  keyResultTitle: 'Ship feature',
  milestoneId: null,
  parentTaskId: null,
  isDailySlot: false,
  metricTypeName: 'Currency',
  ...overrides,
});

describe('planDraft', () => {
  it('creates an empty unlinked draft line', () => {
    const line = createEmptyDraftLine();
    expect(line.task).toBe('');
    expect(line.keyResultId).toBe(UNLINKED_KR_ID);
    expect(line.priority).toBe('medium');
  });

  it('applies and clears planning targets', () => {
    const base = createEmptyDraftLine();
    const linked = applyTargetToDraftLine(base, sampleTarget());
    expect(linked.keyResultId).toBe('kr-1');
    expect(linked.label).toBe('Ship feature');
    const cleared = applyTargetToDraftLine(linked, null);
    expect(cleared.keyResultId).toBe(UNLINKED_KR_ID);
    expect(apiKeyResultId(cleared.keyResultId)).toBeNull();
  });

  it('validates required title and dates', () => {
    expect(validateDraftLinesForCreate([])).toMatch(/at least one/i);
    const empty = createEmptyDraftLine();
    expect(validateDraftLinesForCreate([empty])).toMatch(/title/i);
    expect(
      validateDraftLinesForCreate([{ ...empty, task: 'Do work' }]),
    ).toBeNull();
  });

  it('validateDraftBundlesForCreate returns structured errors across rows', () => {
    const row1 = createEmptyDraftLine();
    const row2 = {
      ...createEmptyDraftLine(),
      task: 'Second task',
      start: '',
      deadline: '',
    };
    const errors = validateDraftBundlesForCreate([
      { line: row1, subtasks: [] },
      { line: row2, subtasks: [] },
    ]);

    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors.some((e) => e.rowId === row1.id && e.field === 'task')).toBe(
      true,
    );
    expect(errors.some((e) => e.rowId === row2.id && e.field === 'start')).toBe(
      true,
    );
    expect(
      errors.some((e) => e.rowId === row2.id && e.field === 'deadline'),
    ).toBe(true);
  });

  it('validateDraftBundlesForCreate requires assignee when picker shown', () => {
    const line = createEmptyDraftLine();
    const errors = validateDraftBundlesForCreate(
      [{ line: { ...line, task: 'Delegated work' }, subtasks: [] }],
      { showAssigneePicker: true, lockAssignee: false },
    );

    expect(errors.some((e) => e.field === 'assignee')).toBe(true);
  });

  it('validateDraftSubtaskField returns subtaskId on errors', () => {
    const line = createEmptyDraftLine();
    const sub = createEmptyDraftSubtask(line.start, line.deadline, 'daily');
    const err = validateDraftSubtaskField(
      { ...sub, task: '' },
      line.id,
      'subtask.task',
    );

    expect(err).toMatchObject({
      rowId: line.id,
      subtaskId: sub.id,
      field: 'subtask.task',
    });
  });

  it('validateDraftLineField validates individual fields on blur', () => {
    const line = createEmptyDraftLine();
    expect(validateDraftLineField(line, 'task')?.field).toBe('task');
    expect(validateDraftLineField({ ...line, task: 'OK' }, 'task')).toBeNull();
  });
});
