import { UNLINKED_KR_ID } from '../prototype/mockPlanningConstants';
import type { PlanningTarget } from './buildPlanningTargets';
import { defaultSpanForKind, type CadenceGroup } from './durationFilter';

/** Match `NAME.ACHIEVE` / `NAME.MILESTONE` without importing enum (jest-friendly). */
const METRIC_ACHIEVE = 'Achieve';
const METRIC_MILESTONE = 'Milestone';

export type DraftLine = {
  id: string;
  task: string;
  priority: string;
  weight: number;
  targetValue: number;
  keyResultId: string;
  milestoneId: string | null;
  parentTaskId: string | null;
  parentPlanId: string | null;
  label: string;
  /** Same as drawer / plan-tasks achieveMK — task completion drives KR or milestone outcome */
  achieveMK: boolean;
  metricTypeName: string | null;
  isDailySlot: boolean;
  /** Snapshot titles for outcome-task autofill / edit */
  keyResultTitle?: string;
  milestoneTitle?: string | null;
  /** Set for rows loaded from API; omitted for new rows added while editing */
  serverTaskId?: string | null;
  start: string;
  deadline: string;
  /** Per-row: create on own plan vs delegate to a direct report. */
  assigneeMode?: 'self' | 'delegate';
  delegateUserId?: string | null;
};

export const NO_KEY_RESULT_VALUE = '__none__';
export const DEFAULT_INLINE_PRIORITY = 'medium';
export const PLAN_TASK_WEIGHT = 0;

export function normalizeInlinePriority(p: string | undefined): string {
  const t = (p || 'medium').toLowerCase();
  if (t === 'high' || t === 'priority') return 'high';
  if (t === 'low') return 'low';
  return 'medium';
}

export function buildLabelFromApiTask(e: any): string {
  const kr = (e?.keyResult?.title || '').trim() || 'Key result';
  if (e?.milestone?.id) {
    const mt = (e?.milestone?.title || '').trim() || 'Milestone';
    return `${kr} · ${mt}`;
  }
  return kr;
}

export function applyEqualWeightsToDailyDraftLines(
  lines: DraftLine[],
): DraftLine[] {
  return lines.map((l) => ({ ...l, weight: 0 }));
}

/** Drawer parity: Achieve KRs (KR-as-task) + Milestone-metric KRs at a milestone row. */
export function canUseAchieveMK(
  metricTypeName: string | null | undefined,
  isDailySlot: boolean,
  milestoneId: string | null | undefined,
): boolean {
  if (isDailySlot) return false;
  if (metricTypeName === METRIC_ACHIEVE) return true;
  if (metricTypeName === METRIC_MILESTONE && milestoneId) return true;
  return false;
}

/** Drawer parity: numeric target only for quantitative KR metrics. */
export function shouldShowPlanningTarget(
  metricTypeName: string | null | undefined,
  isDailySlot: boolean,
): boolean {
  if (isDailySlot) return true;
  if (metricTypeName === METRIC_ACHIEVE) return false;
  if (metricTypeName === METRIC_MILESTONE) return false;
  return true;
}

export function shouldShowTargetOnDraftLine(line: DraftLine): boolean {
  if (line.achieveMK) return false;
  return shouldShowPlanningTarget(line.metricTypeName, line.isDailySlot);
}

export function resolvePlanningTargetValue(
  raw: number | null | undefined,
  metricTypeName: string | null | undefined,
  isDailySlot: boolean,
): number {
  if (!shouldShowPlanningTarget(metricTypeName, isDailySlot)) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

/** Resolve keyResultId for the live API (sentinel → null). */
export function apiKeyResultId(id: string | null | undefined): string | null {
  if (!id || id === UNLINKED_KR_ID) return null;
  return String(id);
}

export function labelFromPlanningTarget(target: PlanningTarget | null): string {
  if (!target) return 'General (no key result)';
  if (target.isDailySlot) {
    return `${target.keyResultTitle} · ${target.parentTaskTitle || 'Task'}`;
  }
  if (target.milestoneId) {
    return target.milestoneTitle || 'Milestone';
  }
  return target.keyResultTitle;
}

export function createEmptyDraftLine(defaults?: {
  start?: string;
  deadline?: string;
  priority?: string;
}): DraftLine {
  const span = defaultSpanForKind('daily');
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    task: '',
    priority: defaults?.priority ?? DEFAULT_INLINE_PRIORITY,
    weight: PLAN_TASK_WEIGHT,
    targetValue: 0,
    keyResultId: UNLINKED_KR_ID,
    milestoneId: null,
    parentTaskId: null,
    parentPlanId: null,
    label: 'General (no key result)',
    achieveMK: false,
    metricTypeName: null,
    isDailySlot: false,
    keyResultTitle: 'General (no key result)',
    milestoneTitle: null,
    start: defaults?.start ?? span.start,
    deadline: defaults?.deadline ?? span.deadline,
    assigneeMode: 'self',
    delegateUserId: null,
  };
}

export function createDelegatedDraftLine(
  delegateUserId: string,
  defaults?: { start?: string; deadline?: string; priority?: string },
): DraftLine {
  return applyTargetToDraftLine(
    {
      ...createEmptyDraftLine(defaults),
      assigneeMode: 'delegate',
      delegateUserId,
    },
    null,
  );
}

export function isDraftLineDelegated(
  line: DraftLine,
  ownerUserId: string | null | undefined,
): boolean {
  return (
    line.assigneeMode === 'delegate' &&
    !!line.delegateUserId &&
    String(line.delegateUserId) !== String(ownerUserId ?? '')
  );
}

export function applyTargetToDraftLine(
  line: DraftLine,
  target: PlanningTarget | null,
): DraftLine {
  if (!target) {
    return {
      ...line,
      keyResultId: UNLINKED_KR_ID,
      milestoneId: null,
      parentTaskId: null,
      parentPlanId: null,
      label: 'General (no key result)',
      achieveMK: false,
      metricTypeName: null,
      isDailySlot: false,
      keyResultTitle: 'General (no key result)',
      milestoneTitle: null,
      targetValue: 0,
    };
  }

  const achieveMK =
    line.achieveMK &&
    canUseAchieveMK(
      target.metricTypeName,
      target.isDailySlot,
      target.milestoneId,
    );

  return {
    ...line,
    keyResultId: target.keyResultId,
    milestoneId: target.milestoneId ?? null,
    parentTaskId: target.parentTaskId ?? null,
    parentPlanId: target.parentPlanId ?? null,
    label: labelFromPlanningTarget(target),
    achieveMK,
    metricTypeName: target.metricTypeName ?? null,
    isDailySlot: target.isDailySlot,
    keyResultTitle: target.keyResultTitle,
    milestoneTitle: target.milestoneTitle ?? null,
    targetValue: resolvePlanningTargetValue(
      line.targetValue,
      target.metricTypeName,
      target.isDailySlot,
    ),
  };
}

export type CreatePlanTaskPayload = {
  task: string;
  priority: string;
  weight: number;
  targetValue: number;
  achieveMK: boolean;
  userId: string;
  planningPeriodId: string;
  planningUserId: string;
  keyResultId: string | null;
  milestoneId: string | null;
  parentTaskId: string | null;
  parentPlanId: string | null;
  startDate: string;
  endDate: string;
  deadline: string;
  assignedByUserId?: string;
};

export function draftLinesToCreatePayloads(
  userId: string,
  group: CadenceGroup<DraftLine>,
  assignedByUserId?: string,
): CreatePlanTaskPayload[] {
  const delegationMeta =
    assignedByUserId && String(assignedByUserId) !== String(userId)
      ? { assignedByUserId: String(assignedByUserId) }
      : {};

  const isDelegated = !!delegationMeta.assignedByUserId;

  return group.lines.map((l) => {
    const line = isDelegated
      ? {
          ...l,
          keyResultId: UNLINKED_KR_ID,
          milestoneId: null,
          parentTaskId: null,
          parentPlanId: null,
          achieveMK: false,
          targetValue: 0,
        }
      : l;

    return {
      task: line.task,
      priority: line.priority,
      weight: PLAN_TASK_WEIGHT,
      targetValue: line.targetValue,
      achieveMK: !!line.achieveMK,
      userId: String(userId),
      planningPeriodId: group.planningPeriodId,
      planningUserId: String(group.planningUserId || ''),
      keyResultId: apiKeyResultId(line.keyResultId),
      milestoneId: line.milestoneId ? String(line.milestoneId) : null,
      parentTaskId: line.parentTaskId ? String(line.parentTaskId) : null,
      parentPlanId: line.parentPlanId ? String(line.parentPlanId) : null,
      startDate: line.start,
      endDate: line.deadline,
      deadline: line.deadline,
      ...delegationMeta,
    };
  });
}

export function validateDraftLinesForCreate(lines: DraftLine[]): string | null {
  if (lines.length === 0) return 'Add at least one plan.';
  for (const line of lines) {
    if (!line.task.trim()) return 'Each plan needs a title.';
    if (!line.start || !line.deadline) {
      return 'Each plan needs a start date and an end date.';
    }
  }
  return null;
}

/** Non-daily planning targets for KR/milestone selects (exclude completed). */
export function selectablePlanningTargets(
  targets: PlanningTarget[],
): PlanningTarget[] {
  return targets.filter((t) => !t.isDailySlot && !t.isCompleted);
}
