import {
  DeadlineKeyResult,
  DeadlineTask,
  DeadlineTaskPayload,
  DeadlineTaskPriority,
} from '@/store/server/features/deadlinePlan/interface';
import { resolveMetricKind } from './utils';

export interface SubTaskDraft {
  key: string;
  /** Set when the subtask already exists on the server. */
  id?: string;
  title: string;
  date: string;
  description: string;
}

export interface TaskDraft {
  key: string;
  title: string;
  assigneeId: string;
  startDate: string;
  deadline: string;
  priority: DeadlineTaskPriority;
  keyResultId: string | null;
  milestoneId: string | null;
  targetValue: number | null;
  achieveKR: boolean;
  description: string;
  subTasks: SubTaskDraft[];
}

export interface TaskDraftErrors {
  title?: string;
  dates?: string;
  /** Keyed by subtask draft key. */
  subTasks: Record<string, string>;
}

let draftSequence = 0;
const nextKey = () => `draft-${(draftSequence += 1)}`;

export function createTaskDraft(defaults: {
  assigneeId: string;
  date: string;
  keyResultId?: string | null;
}): TaskDraft {
  return {
    key: nextKey(),
    title: '',
    assigneeId: defaults.assigneeId,
    startDate: defaults.date,
    deadline: defaults.date,
    priority: 'medium',
    keyResultId: defaults.keyResultId ?? null,
    milestoneId: null,
    targetValue: null,
    achieveKR: false,
    description: '',
    subTasks: [],
  };
}

export function createSubTaskDraft(date: string): SubTaskDraft {
  return { key: nextKey(), title: '', date, description: '' };
}

export function draftFromTask(task: DeadlineTask): TaskDraft {
  return {
    key: nextKey(),
    title: task.title,
    assigneeId: task.assigneeId,
    startDate: task.startDate,
    deadline: task.deadline,
    priority: task.priority,
    keyResultId: task.keyResultId,
    milestoneId: task.milestoneId,
    targetValue: task.targetValue,
    achieveKR: task.achieveKR,
    description: task.description ?? '',
    subTasks: (task.subTasks ?? []).map((subTask) => ({
      key: nextKey(),
      id: subTask.id,
      title: subTask.title,
      date: subTask.startDate,
      description: subTask.description ?? '',
    })),
  };
}

/** Key results belong to their owner, so a new assignee starts unlinked. */
export function withAssignee(draft: TaskDraft, assigneeId: string): TaskDraft {
  if (assigneeId === draft.assigneeId) return draft;
  return { ...withKeyResult(draft, null), assigneeId };
}

/** Changing the key result clears the milestone and metric inputs tied to it. */
export function withKeyResult(
  draft: TaskDraft,
  keyResultId: string | null,
): TaskDraft {
  if (keyResultId === draft.keyResultId) return draft;
  return {
    ...draft,
    keyResultId,
    milestoneId: null,
    targetValue: null,
    achieveKR: false,
  };
}

/** Keeps subtask dates inside the task's range when the range moves. */
export function withDateRange(
  draft: TaskDraft,
  startDate: string,
  deadline: string,
): TaskDraft {
  return {
    ...draft,
    startDate,
    deadline,
    subTasks: draft.subTasks.map((subTask) => ({
      ...subTask,
      date:
        subTask.date < startDate
          ? startDate
          : subTask.date > deadline
            ? deadline
            : subTask.date,
    })),
  };
}

export function validateTaskDraft(draft: TaskDraft): TaskDraftErrors | null {
  const errors: TaskDraftErrors = { subTasks: {} };

  if (!draft.title.trim()) errors.title = 'Give the task a name';
  if (!draft.startDate || !draft.deadline) {
    errors.dates = 'Pick a start date and a deadline';
  } else if (draft.deadline < draft.startDate) {
    errors.dates = 'The deadline cannot be before the start date';
  }

  for (const subTask of draft.subTasks) {
    if (!subTask.title.trim()) {
      errors.subTasks[subTask.key] = 'Give the subtask a title';
    } else if (
      !subTask.date ||
      subTask.date < draft.startDate ||
      subTask.date > draft.deadline
    ) {
      errors.subTasks[subTask.key] =
        "The subtask date must be within the task's date range";
    }
  }

  const hasErrors =
    !!errors.title || !!errors.dates || Object.keys(errors.subTasks).length > 0;
  return hasErrors ? errors : null;
}

/**
 * Only sends the metric inputs that apply to the chosen key result: a target
 * for numeric key results, the achieve flag for Achieve key results or a
 * selected milestone.
 */
export function draftToPayload(
  draft: TaskDraft,
  keyResult: DeadlineKeyResult | null | undefined,
): DeadlineTaskPayload {
  const metricKind = draft.keyResultId ? resolveMetricKind(keyResult) : null;
  const milestoneId =
    draft.keyResultId && metricKind !== 'achieve' ? draft.milestoneId : null;

  return {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    priority: draft.priority,
    assigneeId: draft.assigneeId,
    startDate: draft.startDate,
    deadline: draft.deadline,
    keyResultId: draft.keyResultId,
    milestoneId,
    targetValue: metricKind === 'numeric' ? draft.targetValue : null,
    achieveKR:
      metricKind === 'achieve' || (metricKind === 'milestone' && !!milestoneId)
        ? draft.achieveKR
        : false,
    subTasks: draft.subTasks.map((subTask) => ({
      ...(subTask.id ? { id: subTask.id } : {}),
      title: subTask.title.trim(),
      date: subTask.date,
      description: subTask.description.trim() || null,
    })),
  };
}
