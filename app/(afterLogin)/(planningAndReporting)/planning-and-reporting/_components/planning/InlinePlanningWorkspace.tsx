'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Button,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tooltip,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  FlagOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { InlinePlanningEditSkeleton } from '../cards/PlanCardSkeleton';
import {
  useCreatePlanTasks,
  useUpdatePlanTasks,
} from '@/store/server/features/employees/planning/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  AllPlanningPeriods,
  useGetPlanningById,
  useGetPlanningPeriodsHierarchy,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { NAME } from '@/types/enumTypes';
import {
  getMetricValueInputMax,
  getMetricValueInputMin,
  validateMetricValueAgainstInitial,
  type MetricValueKrInput,
} from '@/utils/okrMetricValueBounds';
import {
  isPlanningTargetBlocked,
  type PlanningTarget,
} from './buildPlanningTargets';
import { useRecentlyAchievedMilestones } from '@/utils/recentlyAchievedMilestones';

type DraftLine = {
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
};

function normalizeInlinePriority(p: string | undefined): string {
  const t = (p || 'medium').toLowerCase();
  if (t === 'high' || t === 'priority') return 'high';
  if (t === 'low') return 'low';
  return 'medium';
}

function buildLabelFromApiTask(e: any): string {
  const kr = (e?.keyResult?.title || '').trim() || 'Key result';
  if (e?.milestone?.id) {
    const mt = (e?.milestone?.title || '').trim() || 'Milestone';
    return `${kr} · ${mt}`;
  }
  return kr;
}

function apiTaskToDraftLine(e: any): DraftLine {
  const isDailySlot = !!(e?.parentTaskId || e?.parentPlanId);
  return {
    id: String(e.id),
    serverTaskId: String(e.id),
    task: e?.task || '',
    priority: normalizeInlinePriority(e?.priority),
    weight: parseInt(String(e?.weight), 10) || 0,
    targetValue: Number(e?.targetValue) || 0,
    keyResultId: String(e?.keyResult?.id || ''),
    milestoneId: e?.milestone?.id ? String(e.milestone.id) : null,
    parentTaskId: e?.parentTaskId ? String(e.parentTaskId) : null,
    parentPlanId: e?.parentPlan?.id
      ? String(e.parentPlan.id)
      : e?.parentPlanId
        ? String(e.parentPlanId)
        : null,
    label: buildLabelFromApiTask(e),
    achieveMK: !!e?.achieveMK,
    metricTypeName: e?.keyResult?.metricType?.name ?? null,
    isDailySlot,
    keyResultTitle: e?.keyResult?.title,
    milestoneTitle: e?.milestone?.title ?? null,
  };
}

/** Integers summing to 100, split as evenly as possible (e.g. 3 → 34, 33, 33). */
function equalIntegerWeightsForCount(n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(100 / n);
  const remainder = 100 - base * n;
  return Array.from({ length: n }, (value, i) => {
    void value;
    const extra = i < remainder ? 1 : 0;
    return base + extra;
  });
}

function applyEqualWeightsToDailyDraftLines(lines: DraftLine[]): DraftLine[] {
  if (lines.length === 0 || !lines.every((l) => l.isDailySlot)) return lines;
  const weights = equalIntegerWeightsForCount(lines.length);
  return lines.map((l, i) => ({ ...l, weight: weights[i] }));
}

const priorityOptions = [
  {
    value: 'high',
    label: (
      <span
        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-131"
        className="text-[#EF4444] font-medium"
      >
        High
      </span>
    ),
  },
  {
    value: 'medium',
    label: (
      <span
        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-135"
        className="text-[#D97706] font-medium"
      >
        Medium
      </span>
    ),
  },
  {
    value: 'low',
    label: (
      <span
        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-139"
        className="text-[#16A34A] font-medium"
      >
        Low
      </span>
    ),
  },
];

/** 40px-tall Ant controls to match native Input */
const controlH40 =
  '[&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!py-0 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center';
const inputNumH40 =
  '[&_.ant-input-number]:!h-10 [&_.ant-input-number-input-wrap]:!h-10 [&_.ant-input-number-input]:!h-10 [&_.ant-input-number-input]:!py-0 [&_.ant-input-number-input]:!leading-10';

/** White + light border + primary blue text — matches header “Add Weekly” / #1E40AF */
const inlineComposerOutlineBtnClass =
  '!rounded-lg !border !border-solid !border-[#E5E7EB] !bg-white !font-semibold !text-[#1E40AF] !shadow-sm hover:!border-[#D1D5DB] hover:!bg-[#F8FAFC] hover:!text-[#1E3A8A] [&_.anticon]:!text-[#1E40AF]';

/** Drawer parity: Achieve KRs (KR-as-task) + Milestone-metric KRs at a milestone row (milestone-as-task). */
function canUseAchieveMK(
  metricTypeName: string | null | undefined,
  isDailySlot: boolean,
  milestoneId: string | null | undefined,
): boolean {
  if (isDailySlot) return false;
  if (metricTypeName === NAME.ACHIEVE) return true;
  if (metricTypeName === NAME.MILESTONE && milestoneId) return true;
  return false;
}

/** Drawer parity: numeric target only for quantitative KR metrics (daily slots keep target). */
function shouldShowPlanningTarget(
  metricTypeName: string | null | undefined,
  isDailySlot: boolean,
): boolean {
  if (isDailySlot) return true;
  if (metricTypeName === NAME.ACHIEVE) return false;
  if (metricTypeName === NAME.MILESTONE) return false;
  return true;
}

function shouldShowTargetOnDraftLine(line: DraftLine): boolean {
  if (line.achieveMK) return false;
  return shouldShowPlanningTarget(line.metricTypeName, line.isDailySlot);
}

function resolvePlanningTargetValue(
  raw: number | null | undefined,
  metricTypeName: string | null | undefined,
  isDailySlot: boolean,
): number {
  if (!shouldShowPlanningTarget(metricTypeName, isDailySlot)) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  // Sanitize: never persist a negative plan target.
  return Math.max(0, n);
}

/** Merge API KR with metric name from the planning target when API shape is thin. */
function buildKeyResultForBounds(
  apiKr: any | null | undefined,
  metricTypeName?: string | null,
): MetricValueKrInput {
  const metric =
    metricTypeName ?? apiKr?.metricType?.name ?? apiKr?.metricTypeName ?? null;
  if (!apiKr && !metric) return null;
  return {
    ...(apiKr ?? {}),
    metricType: apiKr?.metricType ?? (metric ? { name: metric } : undefined),
    metricTypeName: metric ?? apiKr?.metricTypeName,
    initialValue: apiKr?.initialValue,
    targetValue: apiKr?.targetValue,
  };
}

function outcomeSwitchLabel(milestoneId: string | null | undefined): string {
  return milestoneId ? 'Plan milestone' : 'Plan key result';
}

function outcomeAsTaskTooltip(milestoneId: string | null | undefined): string {
  return milestoneId
    ? "If you check this, you're planning to complete this milestone."
    : "If you check this, you're planning to complete this key result.";
}

function outcomeTaskTitleFromTarget(target: PlanningTarget): string {
  if (target.milestoneId) {
    const t = (target.milestoneTitle || '').trim();
    return t || 'Milestone';
  }
  const t = (target.keyResultTitle || '').trim();
  return t || 'Key result';
}

function outcomeTaskTitleFromLine(line: DraftLine): string {
  if (line.milestoneId) {
    const t = (line.milestoneTitle || '').trim();
    if (t) return t;
    const parts = line.label.split(' · ');
    return parts.length > 1
      ? parts[parts.length - 1].trim()
      : line.label.trim() || 'Milestone';
  }
  const t = (line.keyResultTitle || '').trim();
  if (t) return t;
  return (
    line.label.split(' · ')[0]?.trim() || line.label.trim() || 'Key result'
  );
}

function hasOutcomeTaskConflict(
  lines: DraftLine[],
  keyResultId: string,
  milestoneId: string | null,
  excludeId?: string | null,
): boolean {
  return lines.some(
    (l) =>
      l.id !== excludeId &&
      l.achieveMK &&
      l.keyResultId === keyResultId &&
      (l.milestoneId || '') === (milestoneId || ''),
  );
}

function draftPriorityPillClass(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'border-[#FECACA]/90 bg-[#FEF2F2] text-[#991B1B]';
    case 'medium':
      return 'border-[#FDE68A]/90 bg-[#FFFBEB] text-[#B45309]';
    case 'low':
      return 'border-[#A7F3D0]/90 bg-[#ECFDF5] text-[#047857]';
    default:
      return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#575B7A]';
  }
}

/** Milestone / KR outcome rows: icon before copy (replaces colored left border). */
function OutcomeTaskListIcon({ line }: { line: DraftLine }) {
  if (!line.achieveMK) return null;
  const isMilestone = !!line.milestoneId;
  return (
    <div
      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-254"
      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FAFBFC]"
      title={isMilestone ? 'Milestone outcome task' : 'Key result outcome task'}
    >
      {isMilestone ? (
        <FlagOutlined className="text-[15px] text-[#059669]" aria-hidden />
      ) : (
        <KeyOutlined className="text-[15px] text-[#1E40AF]" aria-hidden />
      )}
    </div>
  );
}

function OutcomeTaskSwitchRow({
  milestoneId,
  checked,
  onToggle,
}: {
  milestoneId: string | null | undefined;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  const labelId = `outcome-plan-switch-label-${milestoneId ?? 'kr'}`;
  return (
    <div
      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-256"
      className="flex items-center justify-between gap-3 rounded-lg border border-[#F1F2F6] bg-[#FAFBFC]/80 px-3 py-2.5"
    >
      <div
        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-257"
        className="flex min-w-0 flex-1 items-center gap-1.5"
      >
        <span
          id={labelId}
          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-258"
          className="text-[13px] leading-snug text-[#575B7A]"
        >
          {outcomeSwitchLabel(milestoneId)}
        </span>
        <Tooltip title={outcomeAsTaskTooltip(milestoneId)} placement="topLeft">
          <span
            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-290"
            className="inline-flex cursor-help text-[#94A3B8] hover:text-[#64748B]"
            role="img"
            aria-label="About outcome tasks"
          >
            <InfoCircleOutlined className="text-[15px]" />
          </span>
        </Tooltip>
      </div>
      <Switch
        checked={checked}
        onChange={onToggle}
        aria-labelledby={labelId}
        data-cy="plan-outcome-switch"
      />
    </div>
  );
}

function PlanningMetricsRow({
  metricTypeName,
  isDailySlot,
  priority,
  setPriority,
  weight,
  setWeight,
  targetValue,
  setTargetValue,
  keyResultForBounds,
}: {
  metricTypeName: string | null | undefined;
  isDailySlot: boolean;
  priority: string | undefined;
  setPriority: (v: string) => void;
  weight: number | null;
  setWeight: (v: number | null) => void;
  targetValue: number | null;
  setTargetValue: (v: number | null) => void;
  keyResultForBounds?: any | null;
}) {
  const showTarget = shouldShowPlanningTarget(metricTypeName, isDailySlot);
  return (
    <div
      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1006"
      className={`grid min-w-0 flex-1 gap-2 sm:gap-3 [&>*]:min-w-0 ${
        showTarget ? 'grid-cols-3' : 'grid-cols-2'
      }`}
    >
      <Select
        placeholder="Priority"
        className={`w-full min-w-0 rounded-lg ${controlH40} [&_.ant-select-selector]:!rounded-lg`}
        value={priority}
        onChange={setPriority}
        options={priorityOptions}
      />
      <InputNumber
        placeholder="Weight %"
        min={1}
        max={100}
        className={`w-full min-w-0 rounded-lg ${inputNumH40} [&_.ant-input-number]:!rounded-lg`}
        value={weight ?? undefined}
        onChange={(v) => setWeight(v ?? null)}
      />
      {showTarget ? (
        <InputNumber
          placeholder="Target"
          min={getMetricValueInputMin(keyResultForBounds)}
          max={getMetricValueInputMax(keyResultForBounds)}
          className={`w-full min-w-0 rounded-lg ${inputNumH40} [&_.ant-input-number]:!rounded-lg`}
          value={targetValue ?? undefined}
          onChange={(v) => {
            if (v == null) {
              setTargetValue(null);
              return;
            }
            const floor = getMetricValueInputMin(keyResultForBounds);
            const ceiling = getMetricValueInputMax(keyResultForBounds);
            let next = Number(v);
            if (!Number.isFinite(next)) {
              setTargetValue(null);
              return;
            }
            if (next < floor) next = floor;
            if (ceiling != null && next > ceiling) next = ceiling;
            setTargetValue(next);
          }}
        />
      ) : null}
    </div>
  );
}

/** Shown in Plan tasks empty body when no key result is selected yet */
const INLINE_KEY_RESULT_INSTRUCTION = (
  <>
    <span
      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-278"
      className="lg:hidden"
    >
      Click the{' '}
      <span
        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-279"
        className="font-semibold text-[#1E40AF]"
      >
        +
      </span>{' '}
      on a key result above to plan.
    </span>
    <span
      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-282"
      className="hidden lg:inline"
    >
      Click the{' '}
      <span
        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-283"
        className="font-semibold text-[#1E40AF]"
      >
        +
      </span>{' '}
      on a key result in the left panel to plan.
    </span>
  </>
);

const DEFAULT_INLINE_PRIORITY = 'medium';
const DEFAULT_INLINE_WEIGHT = 10;

/** One-line header from the active planning period pill name */
function inlinePlanHeadline(
  periodLabel: string,
  mode: 'create' | 'edit',
): string {
  const t = periodLabel.trim().toLowerCase();
  const prefix = mode === 'edit' ? 'Edit' : 'Plan your';
  if (!t || t === 'plan' || t.includes('no name')) {
    return mode === 'edit' ? 'Edit plan' : 'Plan your work for this period';
  }
  if (t.includes('daily') || /\bday\b/.test(t)) {
    return mode === 'edit' ? 'Edit your day' : 'Plan your day';
  }
  if (t.includes('weekly') || t === 'week') {
    return mode === 'edit' ? 'Edit your week' : 'Plan your week';
  }
  if (t.includes('monthly') || t === 'month') {
    return mode === 'edit' ? 'Edit your month' : 'Plan your month';
  }
  if (t.includes('quarter')) {
    return mode === 'edit' ? 'Edit your quarter' : 'Plan your quarter';
  }
  if (t.includes('annual') || t.includes('yearly') || /\byear\b/.test(t)) {
    return mode === 'edit' ? 'Edit your year' : 'Plan your year';
  }
  return mode === 'edit'
    ? `${prefix} ${periodLabel.trim()}`
    : `Plan your ${periodLabel.trim()}`;
}

export interface InlinePlanningWorkspaceHandle {
  /** Same as the card header close: confirm if drafts exist, then exit */
  requestExit: () => void;
}

interface InlinePlanningWorkspaceProps {
  /** Active period name from toolbar (e.g. Weekly, Monthly) */
  planningPeriodLabel: string;
  activeTarget: PlanningTarget | null;
  /** User KR API — hides add (+) UI when target KR is achieved */
  userKeyResultItems?: any[];
  /** Clear selected key result / slot (closes composer until + is used again) */
  onClearTarget: () => void;
  onExit: () => void;
  /** When true, omit the header back/close control (e.g. parent Drawer supplies it) */
  hideHeaderCloseButton?: boolean;
  /** When set, load this plan into the same composer and PATCH on save (reuses create UX) */
  editPlanId?: string | null;
}

const InlinePlanningWorkspace = forwardRef<
  InlinePlanningWorkspaceHandle,
  InlinePlanningWorkspaceProps
>(function InlinePlanningWorkspace(
  {
    planningPeriodLabel,
    activeTarget,
    userKeyResultItems = [],
    onClearTarget,
    onExit,
    hideHeaderCloseButton = false,
    editPlanId = null,
  },
  ref,
) {
  const { userId } = useAuthenticationStore();
  const { activePlanPeriodId, setInlinePlanningMode, setMKAsATask } =
    PlanningAndReportingStore();
  const planningPeriodId = activePlanPeriodId;
  const { data: planningPeriods } = AllPlanningPeriods();
  const planningUserId = useMemo(() => {
    const list = Array.isArray(planningPeriods) ? planningPeriods : [];
    return list.find((item: any) => item.planningPeriod?.id == planningPeriodId)
      ?.id as string | undefined;
  }, [planningPeriods, planningPeriodId]);

  const { data: planGroupData, isLoading: loadingPlanGroup } =
    useGetPlanningById(editPlanId || '');
  const { data: planningPeriodHierarchy, isLoading: loadingHierarchy } =
    useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  const { mutate: createTask, isLoading: isCreating } = useCreatePlanTasks();
  const { mutate: updatePlanTasks, isLoading: isUpdating } =
    useUpdatePlanTasks();
  const isLoading = isCreating || isUpdating;

  const isEditMode = Boolean(editPlanId);
  const loadingEditPlan = isEditMode && (loadingPlanGroup || loadingHierarchy);
  const editHydratedRef = useRef<string | null>(null);
  const { isMobile } = useIsMobile();

  const [draftLines, setDraftLines] = useState<DraftLine[]>([]);
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState<string | undefined>(
    DEFAULT_INLINE_PRIORITY,
  );
  const [weight, setWeight] = useState<number | null>(DEFAULT_INLINE_WEIGHT);
  const [targetValue, setTargetValue] = useState<number | null>(null);
  /** Hide Adding to + New task after last add reaches 100%; reopen when total drops below 100 */
  const [composerCollapsed, setComposerCollapsed] = useState(false);
  /** Draft row being edited in the form (same fields as add) */
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  /** KR/milestone-as-outcome task (Achieve metric only, not daily sub-slots) */
  const [planAsAchieve, setPlanAsAchieve] = useState(false);

  const totalWeight = useMemo(
    () => draftLines.reduce((s, l) => s + (Number(l.weight) || 0), 0),
    [draftLines],
  );

  const recentlyAchievedIds = useRecentlyAchievedMilestones((s) => s.ids);
  const reopenedMilestoneIds = useRecentlyAchievedMilestones(
    (s) => s.reopenedMilestoneIds,
  );
  const reopenedKeyResultIds = useRecentlyAchievedMilestones(
    (s) => s.reopenedKeyResultIds,
  );

  const activeTargetBlocked = useMemo(
    () => isPlanningTargetBlocked(activeTarget, userKeyResultItems),
    [
      activeTarget,
      userKeyResultItems,
      recentlyAchievedIds,
      reopenedMilestoneIds,
      reopenedKeyResultIds,
    ],
  );

  const activeKeyResultForBounds = useMemo(() => {
    const draftLine = editingDraftId
      ? draftLines.find((l) => l.id === editingDraftId)
      : null;
    const keyResultId = draftLine?.keyResultId ?? activeTarget?.keyResultId;
    if (!keyResultId) return null;
    const apiKr =
      userKeyResultItems.find(
        (k) => k && k.deletedAt == null && String(k.id) === String(keyResultId),
      ) ?? null;
    return buildKeyResultForBounds(
      apiKr,
      draftLine?.metricTypeName ?? activeTarget?.metricTypeName,
    );
  }, [
    activeTarget?.keyResultId,
    activeTarget?.metricTypeName,
    draftLines,
    editingDraftId,
    userKeyResultItems,
  ]);

  useEffect(() => {
    if (activeTarget && activeTargetBlocked) {
      onClearTarget();
    }
  }, [activeTarget, activeTargetBlocked, onClearTarget]);

  useEffect(() => {
    editHydratedRef.current = null;
  }, [editPlanId]);

  useEffect(() => {
    if (!isEditMode || !editPlanId || !planGroupData) return;
    if (editHydratedRef.current === editPlanId) return;
    if (planningPeriodHierarchy?.parentPlan && loadingHierarchy) return;

    let tasks: any[] = [];
    if (planningPeriodHierarchy?.parentPlan) {
      const match = planningPeriodHierarchy?.planData?.find(
        (i: any) => i.id === editPlanId,
      );
      if (!match && loadingHierarchy) return;
      tasks = match?.tasks || [];
    } else {
      tasks = planGroupData.tasks || [];
    }

    const seen = new Set<string>();
    const lines: DraftLine[] = [];
    tasks.forEach((e: any) => {
      if (!e?.id || seen.has(String(e.id))) return;
      seen.add(String(e.id));
      lines.push(apiTaskToDraftLine(e));
    });

    setDraftLines(lines);
    setEditingDraftId(null);
    setComposerCollapsed(false);
    editHydratedRef.current = editPlanId;
  }, [
    isEditMode,
    editPlanId,
    planGroupData,
    loadingHierarchy,
    planningPeriodHierarchy?.parentPlan,
    planningPeriodHierarchy?.planData,
  ]);

  const resetForm = useCallback(() => {
    setTask('');
    setPriority(DEFAULT_INLINE_PRIORITY);
    setWeight(DEFAULT_INLINE_WEIGHT);
    setPlanAsAchieve(false);
    if (
      activeTarget &&
      !shouldShowPlanningTarget(
        activeTarget.metricTypeName,
        activeTarget.isDailySlot,
      )
    ) {
      setTargetValue(0);
      return;
    }
    const hint = activeTarget?.targetValueHint;
    setTargetValue(
      hint != null && !Number.isNaN(Number(hint)) ? Number(hint) : null,
    );
  }, [
    activeTarget?.targetValueHint,
    activeTarget?.metricTypeName,
    activeTarget?.isDailySlot,
  ]);

  React.useEffect(() => {
    if (!activeTarget || editingDraftId) return;
    setComposerCollapsed(false);
    setPlanAsAchieve(false);
    setTask('');
    setPriority(DEFAULT_INLINE_PRIORITY);
    if (
      !shouldShowPlanningTarget(
        activeTarget.metricTypeName,
        activeTarget.isDailySlot,
      )
    ) {
      setTargetValue(0);
    } else {
      const hint = activeTarget.targetValueHint;
      setTargetValue(
        hint != null && !Number.isNaN(Number(hint)) ? Number(hint) : null,
      );
    }
    if (activeTarget.isDailySlot) {
      setWeight(equalIntegerWeightsForCount(1)[0]);
    } else {
      setWeight(DEFAULT_INLINE_WEIGHT);
    }
  }, [
    activeTarget?.id,
    activeTarget?.targetValueHint,
    activeTarget?.metricTypeName,
    activeTarget?.isDailySlot,
    editingDraftId,
  ]);

  /** Equal-split preview for the next daily child task (does not reset task/priority). */
  React.useEffect(() => {
    if (!activeTarget || editingDraftId) return;
    const dailyEqualComposer =
      !!activeTarget.isDailySlot &&
      (draftLines.length === 0 || draftLines.every((l) => l.isDailySlot));
    if (!dailyEqualComposer) return;
    setWeight(equalIntegerWeightsForCount(draftLines.length + 1)[0]);
  }, [
    activeTarget?.id,
    activeTarget?.isDailySlot,
    draftLines.length,
    editingDraftId,
  ]);

  const cancelEditDraft = useCallback(() => {
    setEditingDraftId(null);
    resetForm();
    if (Math.round(totalWeight) === 100) {
      setComposerCollapsed(true);
    }
  }, [draftLines, resetForm, totalWeight]);

  const beginEditDraft = useCallback((line: DraftLine) => {
    setEditingDraftId(line.id);
    setComposerCollapsed(false);
    setTask(line.task);
    setPriority(line.priority);
    setWeight(line.weight);
    setTargetValue(line.targetValue);
    setPlanAsAchieve(!!line.achieveMK);
  }, []);

  const handleSaveLine = useCallback(() => {
    const t = task.trim();
    if (!t) {
      message.warning('Enter a task description.');
      return;
    }
    if (!priority) {
      message.warning('Select a priority.');
      return;
    }
    const w = Number(weight);
    const dailyEqualComposer =
      !!activeTarget?.isDailySlot &&
      (draftLines.length === 0 || draftLines.every((l) => l.isDailySlot));

    if (!editingDraftId && !dailyEqualComposer) {
      if (!w || w <= 0) {
        message.warning('Enter a weight greater than 0.');
        return;
      }
    }

    if (editingDraftId) {
      if (!w || w <= 0) {
        message.warning('Enter a weight greater than 0.');
        return;
      }
      const existing = draftLines.find((l) => l.id === editingDraftId);
      if (!existing) {
        setEditingDraftId(null);
        resetForm();
        return;
      }
      const krForBounds = buildKeyResultForBounds(
        userKeyResultItems.find(
          (k) =>
            k &&
            k.deletedAt == null &&
            String(k.id) === String(existing.keyResultId),
        ) ?? null,
        existing.metricTypeName,
      );
      if (
        shouldShowPlanningTarget(existing.metricTypeName, existing.isDailySlot)
      ) {
        const initialBoundError = validateMetricValueAgainstInitial(
          targetValue,
          krForBounds,
        );
        if (initialBoundError) {
          message.warning(initialBoundError);
          return;
        }
      }
      const weightWithout = totalWeight - existing.weight;
      if (weightWithout + w > 100) {
        message.warning(
          `Total weight would exceed 100 (currently ${totalWeight}).`,
        );
        return;
      }
      const nextAchieveMK = canUseAchieveMK(
        existing.metricTypeName,
        existing.isDailySlot,
        existing.milestoneId,
      )
        ? planAsAchieve
        : existing.achieveMK;
      if (
        nextAchieveMK &&
        hasOutcomeTaskConflict(
          draftLines,
          existing.keyResultId,
          existing.milestoneId,
          editingDraftId,
        )
      ) {
        message.warning(
          'You already have an outcome task for this key result or milestone.',
        );
        return;
      }
      const newTotal = weightWithout + w;
      setDraftLines((prev) =>
        prev.map((l) =>
          l.id === editingDraftId
            ? {
                ...l,
                task: t,
                priority,
                weight: w,
                targetValue: resolvePlanningTargetValue(
                  targetValue,
                  existing.metricTypeName,
                  existing.isDailySlot,
                ),
                achieveMK: nextAchieveMK,
              }
            : l,
        ),
      );
      setEditingDraftId(null);
      resetForm();
      if (newTotal === 100) {
        setComposerCollapsed(true);
      } else {
        message.success('Task updated.');
      }
      return;
    }

    if (!activeTarget) {
      const wideLayout =
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 1024px)').matches;
      message.info(
        wideLayout
          ? 'Choose a key result (or weekly task) on the left with + first.'
          : 'Choose a key result (or weekly task) above with + first.',
      );
      return;
    }
    if (
      shouldShowPlanningTarget(
        activeTarget.metricTypeName,
        activeTarget.isDailySlot,
      )
    ) {
      const initialBoundError = validateMetricValueAgainstInitial(
        targetValue,
        activeKeyResultForBounds,
      );
      if (initialBoundError) {
        message.warning(initialBoundError);
        return;
      }
    }
    if (!dailyEqualComposer) {
      if (totalWeight + w > 100) {
        message.warning(
          `Total weight would exceed 100 (currently ${totalWeight}).`,
        );
        return;
      }
    }

    const achieveMK =
      planAsAchieve &&
      canUseAchieveMK(
        activeTarget.metricTypeName,
        activeTarget.isDailySlot,
        activeTarget.milestoneId,
      );
    if (
      achieveMK &&
      hasOutcomeTaskConflict(
        draftLines,
        activeTarget.keyResultId,
        activeTarget.milestoneId,
      )
    ) {
      message.warning(
        'You already have an outcome task for this key result or milestone.',
      );
      return;
    }

    const label = activeTarget.isDailySlot
      ? `${activeTarget.keyResultTitle} · ${activeTarget.parentTaskTitle || 'Task'}`
      : activeTarget.milestoneId
        ? activeTarget.milestoneTitle || 'Milestone'
        : activeTarget.keyResultTitle;

    const nextCount = draftLines.length + 1;
    const initialWeight = dailyEqualComposer
      ? equalIntegerWeightsForCount(nextCount)[0]
      : w;

    const line: DraftLine = {
      id: crypto.randomUUID(),
      task: t,
      priority,
      weight: initialWeight,
      targetValue: resolvePlanningTargetValue(
        targetValue,
        activeTarget.metricTypeName,
        activeTarget.isDailySlot,
      ),
      keyResultId: activeTarget.keyResultId,
      milestoneId: activeTarget.milestoneId,
      parentTaskId: activeTarget.parentTaskId,
      parentPlanId: activeTarget.parentPlanId ?? null,
      label,
      achieveMK,
      metricTypeName: activeTarget.metricTypeName ?? null,
      isDailySlot: activeTarget.isDailySlot,
      keyResultTitle: activeTarget.keyResultTitle,
      milestoneTitle: activeTarget.milestoneTitle ?? null,
    };

    setDraftLines((prev) => {
      const next = [line, ...prev];
      return applyEqualWeightsToDailyDraftLines(next);
    });
    resetForm();
    const allDailyAfterAdd =
      line.isDailySlot && draftLines.every((l) => l.isDailySlot);
    if (!allDailyAfterAdd) {
      setComposerCollapsed(true);
    }
  }, [
    activeTarget,
    activeKeyResultForBounds,
    task,
    priority,
    weight,
    targetValue,
    totalWeight,
    resetForm,
    editingDraftId,
    draftLines,
    planAsAchieve,
    userKeyResultItems,
  ]);

  const removeLine = (id: string) => {
    setDraftLines((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return applyEqualWeightsToDailyDraftLines(next);
    });
    setEditingDraftId((cur) => (cur === id ? null : cur));
  };

  const handleSubmit = () => {
    if (draftLines.length === 0) {
      message.warning('Add at least one task.');
      return;
    }
    if (totalWeight !== 100) {
      message.warning(
        `Weights must sum to exactly 100 (currently ${totalWeight}).`,
      );
      return;
    }

    /* Newest-first in UI; submit in creation order (oldest first) for API parity */
    const ordered = [...draftLines].reverse();

    if (isEditMode && editPlanId && planGroupData) {
      const pvUserId = planGroupData?.planningUser?.userId;
      const pvPlanningUserId = planGroupData?.planningUser?.id;
      const ppId = planGroupData?.planningUser?.planningPeriod?.id;

      const tasks = ordered.map((l) => ({
        ...(l.serverTaskId ? { id: l.serverTaskId } : {}),
        task: l.task,
        priority: l.priority,
        weight: l.weight,
        targetValue: l.targetValue,
        achieveMK: !!l.achieveMK,
        userId: String(pvUserId || userId),
        planningPeriodId: String(ppId || planningPeriodId || ''),
        planningUserId: String(pvPlanningUserId || planningUserId || ''),
        keyResultId: String(l.keyResultId),
        milestoneId: l.milestoneId ? String(l.milestoneId) : null,
        parentTaskId: l.parentTaskId ? String(l.parentTaskId) : null,
        parentPlanId: l.parentPlanId ? String(l.parentPlanId) : null,
        planId: planGroupData.id,
      }));

      updatePlanTasks(
        { tasks },
        {
          onSuccess: () => {
            setDraftLines([]);
            setEditingDraftId(null);
            setMKAsATask(null);
            setInlinePlanningMode(false);
            onExit();
          },
        },
      );
      return;
    }

    const tasks = ordered.map((l) => ({
      task: l.task,
      priority: l.priority,
      weight: l.weight,
      targetValue: l.targetValue,
      achieveMK: !!l.achieveMK,
      userId: String(userId),
      planningPeriodId: String(planningPeriodId || ''),
      planningUserId: String(planningUserId || ''),
      keyResultId: String(l.keyResultId),
      milestoneId: l.milestoneId ? String(l.milestoneId) : null,
      parentTaskId: l.parentTaskId ? String(l.parentTaskId) : null,
      parentPlanId: l.parentPlanId ? String(l.parentPlanId) : null,
    }));

    createTask(
      { tasks },
      {
        onSuccess: () => {
          setDraftLines([]);
          setEditingDraftId(null);
          setMKAsATask(null);
          setInlinePlanningMode(false);
          onExit();
        },
      },
    );
  };

  const roundedTotal = Math.round(totalWeight);
  const saveWeightIncomplete = totalWeight !== 100;

  // Composer no longer auto-opens when weight drops — user opens it manually via "Additional Plans".

  React.useEffect(() => {
    if (!editingDraftId) return;
    if (!draftLines.some((l) => l.id === editingDraftId)) {
      setEditingDraftId(null);
      resetForm();
    }
  }, [editingDraftId, draftLines, resetForm]);

  const weightTone =
    roundedTotal === 100
      ? 'text-[#059669]'
      : roundedTotal > 100
        ? 'text-[#DC2626]'
        : 'text-[#D97706]';

  const showDraftAndSubmit = draftLines.length > 0;
  const showEmptyInstruction =
    !isEditMode && !activeTarget && draftLines.length === 0;

  const exitInlinePlanning = useCallback(() => {
    setDraftLines([]);
    setEditingDraftId(null);
    setMKAsATask(null);
    setInlinePlanningMode(false);
    onExit();
  }, [onExit, setInlinePlanningMode, setMKAsATask]);

  const requestExitInlinePlanning = useCallback(() => {
    if (draftLines.length === 0) {
      exitInlinePlanning();
      return;
    }
    Modal.confirm({
      title: isEditMode ? 'Exit editing?' : 'Exit plan creation?',
      content: isEditMode
        ? 'Unsaved changes will be discarded.'
        : 'Your draft tasks will be discarded.',
      okText: 'Exit',
      cancelText: 'Keep editing',
      okButtonProps: { danger: true },
      centered: true,
      width: 400,
      onOk: () => {
        exitInlinePlanning();
      },
    });
  }, [draftLines.length, exitInlinePlanning, isEditMode]);

  useImperativeHandle(
    ref,
    () => ({
      requestExit: () => requestExitInlinePlanning(),
    }),
    [requestExitInlinePlanning],
  );

  const headerHeadline = useMemo(
    () =>
      inlinePlanHeadline(planningPeriodLabel, isEditMode ? 'edit' : 'create'),
    [planningPeriodLabel, isEditMode],
  );

  const editingListItemRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    if (editingDraftId && editingListItemRef.current) {
      editingListItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [editingDraftId]);

  const showAchieveOptionForAdd =
    !!activeTarget &&
    canUseAchieveMK(
      activeTarget.metricTypeName,
      activeTarget.isDailySlot,
      activeTarget.milestoneId,
    );
  return (
    <div
      className="min-w-0 max-w-full pr-1"
      data-cy="inline-planning-workspace"
    >
      <div
        className="overflow-hidden rounded-xl border border-[#F1F2F6] bg-white"
        data-cy="inline-plan-draft-card"
      >
        <div
          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-872"
          className="flex min-h-[48px] items-center justify-between gap-2 border-b border-[#F1F2F6] bg-[#FAFBFC] px-3 py-2 md:min-h-[60px] md:gap-4 md:px-5 md:py-4"
        >
          <div
            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-873"
            className="flex min-w-0 flex-1 items-center gap-2 md:gap-3"
          >
            {!hideHeaderCloseButton ? (
              <button
                type="button"
                onClick={requestExitInlinePlanning}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-white hover:text-[#574CFF] hover:shadow-sm md:h-10 md:w-10"
                aria-label="Exit plan creation"
                data-cy="inline-plan-close"
              >
                <CloseOutlined className="text-[15px] md:text-[17px]" />
              </button>
            ) : null}
            <span
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-885"
              className="min-w-0 truncate text-[12px] font-semibold leading-snug text-[#161A2C] md:text-sm"
            >
              {headerHeadline}
            </span>
          </div>
          <div
            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-889"
            className="flex min-w-0 flex-shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2 md:gap-3"
          >
            <span
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-890"
              className="whitespace-nowrap text-[12px] tabular-nums text-[#475569] md:text-sm"
            >
              {draftLines.length} task{draftLines.length !== 1 ? 's' : ''}
              <span
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-892"
                className="mx-1 text-[#CBD5E1] md:mx-2"
              >
                ·
              </span>
              <span
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-893"
                className={`text-[18px] font-extrabold md:text-[20px] ${weightTone}`}
              >
                {roundedTotal}
              </span>
              <span
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-894"
                className="text-[13px] font-medium text-[#94A3B8] md:text-[14px]"
              >
                {' '}
                / 100
              </span>
            </span>
            {showDraftAndSubmit ? (
              <Tooltip
                title={
                  saveWeightIncomplete
                    ? 'Total weight must equal 100 before you can save the plan.'
                    : ''
                }
                open={isMobile ? false : undefined}
              >
                <Button
                  type="primary"
                  loading={isLoading}
                  disabled={!isMobile && saveWeightIncomplete}
                  onClick={() => {
                    if (saveWeightIncomplete) {
                      if (isMobile) {
                        message.info({
                          content:
                            'Assign weights so your tasks total exactly 100% before you save your plan.',
                          duration: 4,
                        });
                      }
                      return;
                    }
                    handleSubmit();
                  }}
                  aria-disabled={isMobile && saveWeightIncomplete}
                  className={`!m-0 !h-9 !min-h-9 !w-auto !min-w-0 rounded-lg !border-[#1E40AF] !bg-[#1E40AF] !px-3.5 text-[12px] font-semibold !text-white hover:!border-[#1E3A8A] hover:!bg-[#1E3A8A] md:!h-10 md:!min-h-10 md:!px-5 md:text-[13px] ${
                    isMobile && saveWeightIncomplete
                      ? '!cursor-not-allowed !opacity-[0.45]'
                      : ''
                  }`}
                  data-cy="inline-plan-create-plan"
                >
                  {isEditMode ? 'Save changes' : 'Save plan'}
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </div>

        <div
          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-937"
          className="min-w-0"
        >
          {loadingEditPlan && isEditMode && draftLines.length === 0 ? (
            <InlinePlanningEditSkeleton />
          ) : null}

          {showEmptyInstruction ? (
            <div
              className="flex min-h-[336px] flex-col items-center justify-center px-6 py-12 text-center"
              data-cy="inline-plan-empty-draft"
            >
              <p
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-947"
                className="max-w-lg text-[15px] leading-8 text-[#575B7A]"
              >
                {INLINE_KEY_RESULT_INSTRUCTION}
              </p>
            </div>
          ) : null}

          {activeTarget &&
          !activeTargetBlocked &&
          !composerCollapsed &&
          !editingDraftId &&
          !loadingEditPlan ? (
            <div
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1039"
              className={`space-y-4 px-3 py-3 md:px-5 md:py-5 ${
                draftLines.length > 0 ? 'border-b border-[#F1F2F6]' : ''
              }`}
            >
              <div
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-962"
                className="flex items-center justify-between gap-3 md:items-start"
              >
                <div
                  data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-963"
                  className="min-w-0 flex-1"
                >
                  <p
                    data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-964"
                    className="text-[10px] font-semibold uppercase tracking-wider text-[#8F94A3]"
                  >
                    Adding to
                  </p>
                  <p
                    data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-967"
                    className="mt-0.5 min-w-0 text-[13px] font-semibold leading-snug text-[#161A2C] line-clamp-3 md:line-clamp-4"
                  >
                    {(activeTarget.keyResultTitle || 'Key result').trim() ||
                      'Key result'}
                  </p>
                </div>
                <button
                  data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-button-1066"
                  type="button"
                  onClick={onClearTarget}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#574CFF]"
                  aria-label="Clear planning target"
                >
                  <CloseOutlined className="text-[15px]" />
                </button>
              </div>

              <div
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-982"
                className="rounded-lg border border-[#F1F2F6] bg-[#FAFBFC]/60 p-4"
              >
                <div
                  data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-983"
                  className="space-y-4"
                >
                  <Input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="What will you accomplish?"
                    disabled={planAsAchieve && showAchieveOptionForAdd}
                    className="!h-10 rounded-lg border-[#E5E7EB] text-[13px] shadow-none hover:border-[#D1D5DB] disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#575B7A]"
                  />
                  {showAchieveOptionForAdd && activeTarget ? (
                    <OutcomeTaskSwitchRow
                      milestoneId={activeTarget.milestoneId}
                      checked={planAsAchieve}
                      onToggle={(next) => {
                        setPlanAsAchieve(next);
                        if (next) {
                          setTask(outcomeTaskTitleFromTarget(activeTarget));
                          setTargetValue(0);
                        } else {
                          setTask('');
                        }
                      }}
                    />
                  ) : null}
                  <div
                    data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1005"
                    className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5"
                  >
                    <PlanningMetricsRow
                      metricTypeName={activeTarget.metricTypeName}
                      isDailySlot={activeTarget.isDailySlot}
                      priority={priority}
                      setPriority={setPriority}
                      weight={weight}
                      setWeight={setWeight}
                      targetValue={targetValue}
                      setTargetValue={setTargetValue}
                      keyResultForBounds={activeKeyResultForBounds}
                    />
                    <Button
                      type="default"
                      icon={<PlusOutlined className="text-[14px]" />}
                      onClick={handleSaveLine}
                      className={`!m-0 !h-10 w-full shrink-0 px-5 lg:ml-2 lg:w-auto ${inlineComposerOutlineBtnClass}`}
                    >
                      Add to plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTarget &&
          composerCollapsed &&
          roundedTotal < 100 &&
          draftLines.length > 0 &&
          !editingDraftId ? (
            <div
              data-cy="inline-plan-additional-plans-row"
              className={`flex items-center justify-between px-4 py-3 md:px-5 ${draftLines.length > 0 ? 'border-b border-[#F1F2F6]' : ''}`}
            >
              <span
                className="text-[13px] text-[#575B7A]"
                data-cy="inline-plan-weight-summary"
              >
                <span
                  className="font-semibold text-[#161A2C]"
                  data-cy="inline-plan-weight-total"
                >
                  {roundedTotal}%
                </span>{' '}
                weight assigned.
              </span>
              <button
                type="button"
                data-cy="inline-plan-add-plans-button"
                onClick={() => setComposerCollapsed(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F1F2F6] px-3 py-1.5 text-[12px] font-semibold text-[#574CFF] transition-colors hover:bg-[#E0E7FF]"
              >
                <PlusOutlined className="text-[11px]" />
                Additional Plans
              </button>
            </div>
          ) : null}

          {activeTarget &&
          composerCollapsed &&
          roundedTotal === 100 &&
          !editingDraftId ? (
            <div
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1153"
              className={`px-4 md:px-5 ${
                draftLines.length > 0
                  ? 'border-b border-[#F1F2F6] pb-3 pt-1'
                  : 'py-1'
              }`}
            >
              <p
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-1054"
                className="text-[13px] leading-relaxed text-[#575B7A]"
              >
                You’ve reached{' '}
                <span
                  data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1056"
                  className="font-semibold text-[#161A2C]"
                >
                  100%
                </span>{' '}
                weight. Review your tasks below, then click{' '}
                <span
                  data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1058"
                  className="font-semibold text-[#161A2C]"
                >
                  Save plan
                </span>
                .
              </p>
            </div>
          ) : null}

          {!activeTarget && draftLines.length > 0 ? (
            <div
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1064"
              className="border-b border-[#F1F2F6] px-4 py-3 text-[13px] text-[#575B7A] md:px-5"
            >
              <span
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1065"
                className="lg:hidden"
              >
                Use + above to pick a key result and add more tasks.
              </span>
              <span
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1068"
                className="hidden lg:inline"
              >
                Use + on the left to pick a key result and add more tasks.
              </span>
            </div>
          ) : null}

          {showDraftAndSubmit ? (
            <ul
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-ul-1075"
              className="flex flex-col gap-2.5 p-3 md:gap-3 md:p-4 md:px-5"
            >
              {draftLines.map((l) =>
                editingDraftId === l.id ? (
                  <li
                    key={l.id}
                    ref={editingListItemRef}
                    className="list-none rounded-xl border border-[#574CFF]/35 bg-white p-3.5 shadow-[0_4px_14px_rgba(87,76,255,0.08)] md:p-4"
                    data-cy="inline-plan-edit-row"
                  >
                    <div
                      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1084"
                      className="flex min-w-0 items-start gap-3"
                    >
                      <OutcomeTaskListIcon line={l} />
                      <div
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1086"
                        className="flex min-w-0 flex-1 flex-col gap-3"
                      >
                        <p
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-1087"
                          className="text-[10px] font-semibold uppercase tracking-wider text-[#8F94A3]"
                        >
                          Edit task
                        </p>
                        <p
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-1090"
                          className="text-[12px] leading-relaxed text-[#575B7A]"
                        >
                          {l.label}
                        </p>
                        <div
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1093"
                          className="rounded-lg border border-[#F1F2F6] bg-[#FAFBFC]/60 p-4"
                        >
                          <div
                            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1094"
                            className="space-y-4"
                          >
                            <Input
                              value={task}
                              onChange={(e) => setTask(e.target.value)}
                              placeholder="What will you accomplish?"
                              disabled={
                                planAsAchieve &&
                                canUseAchieveMK(
                                  l.metricTypeName,
                                  l.isDailySlot,
                                  l.milestoneId,
                                )
                              }
                              className="!h-10 rounded-lg border-[#E5E7EB] text-[13px] shadow-none hover:border-[#D1D5DB] disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#575B7A]"
                            />
                            {canUseAchieveMK(
                              l.metricTypeName,
                              l.isDailySlot,
                              l.milestoneId,
                            ) ? (
                              <OutcomeTaskSwitchRow
                                milestoneId={l.milestoneId}
                                checked={planAsAchieve}
                                onToggle={(next) => {
                                  setPlanAsAchieve(next);
                                  if (next) {
                                    setTask(outcomeTaskTitleFromLine(l));
                                    setTargetValue(0);
                                  } else {
                                    setTask('');
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1127"
                              className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5"
                            >
                              <PlanningMetricsRow
                                metricTypeName={l.metricTypeName}
                                isDailySlot={l.isDailySlot}
                                priority={priority}
                                setPriority={setPriority}
                                weight={weight}
                                setWeight={setWeight}
                                targetValue={targetValue}
                                setTargetValue={setTargetValue}
                                keyResultForBounds={activeKeyResultForBounds}
                              />
                              <div
                                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1151"
                                className="flex w-full shrink-0 flex-col gap-2 lg:ml-2 lg:w-auto lg:flex-row lg:justify-end"
                              >
                                <Button
                                  type="default"
                                  onClick={cancelEditDraft}
                                  className="!m-0 !h-10 w-full rounded-lg border-[#E5E7EB] px-5 font-semibold text-[#475569] hover:!border-[#D1D5DB] hover:!text-[#161A2C] lg:w-auto"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="default"
                                  onClick={handleSaveLine}
                                  className={`!m-0 !h-10 w-full px-5 lg:w-auto ${inlineComposerOutlineBtnClass}`}
                                >
                                  Update task
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li
                    data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-li-1333"
                    key={l.id}
                    className="group flex items-start gap-3 rounded-xl border border-[#F1F2F6] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] hover:border-[#574CFF]/18 hover:shadow-[0_4px_14px_rgba(87,76,255,0.07)] md:px-4 md:py-3.5"
                  >
                    <OutcomeTaskListIcon line={l} />
                    <div
                      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1179"
                      className="flex min-w-0 flex-1 flex-col gap-2"
                    >
                      <div
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1180"
                        className="flex items-start justify-between gap-3"
                      >
                        <div
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1181"
                          className="min-w-0 flex-1"
                        >
                          <p
                            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-1182"
                            className="text-[14px] font-semibold leading-snug text-[#161A2C] line-clamp-2"
                          >
                            {l.task}
                          </p>
                          <p
                            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-1185"
                            className="mt-1 text-[12px] leading-relaxed text-[#8F94A3] line-clamp-2"
                          >
                            {l.label}
                          </p>
                        </div>
                        <div
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1189"
                          className="flex flex-shrink-0 items-start gap-0.5"
                        >
                          <button
                            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-button-1367"
                            type="button"
                            onClick={() => beginEditDraft(l)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#574CFF]"
                            aria-label="Edit task"
                          >
                            <EditOutlined className="text-[15px]" />
                          </button>
                          <button
                            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-button-1375"
                            type="button"
                            onClick={() => removeLine(l.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F1F5F9] hover:text-[#64748B]"
                            aria-label="Remove task"
                          >
                            <CloseOutlined className="text-[15px]" />
                          </button>
                        </div>
                      </div>
                      <div
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1208"
                        className="flex flex-wrap items-center gap-2"
                      >
                        <span
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1389"
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${draftPriorityPillClass(l.priority)}`}
                        >
                          {l.priority}
                        </span>
                        <span
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1214"
                          className="inline-flex items-center rounded-full border border-[#E0E7FF] bg-[#F8F7FF] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#574CFF]"
                        >
                          {l.weight}%
                        </span>
                        {shouldShowTargetOnDraftLine(l) ? (
                          <span
                            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1217"
                            className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-[#475569]"
                          >
                            <span
                              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1218"
                              className="font-normal text-[#94A3B8]"
                            >
                              Target
                            </span>
                            {l.targetValue}
                          </span>
                        ) : null}
                        {l.achieveMK ? (
                          <span
                            data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-outcome-pill"
                            className="inline-flex items-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#1E40AF]"
                          >
                            {l.milestoneId
                              ? 'Milestone outcome'
                              : 'Key result outcome'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
});

InlinePlanningWorkspace.displayName = 'InlinePlanningWorkspace';

export default InlinePlanningWorkspace;
