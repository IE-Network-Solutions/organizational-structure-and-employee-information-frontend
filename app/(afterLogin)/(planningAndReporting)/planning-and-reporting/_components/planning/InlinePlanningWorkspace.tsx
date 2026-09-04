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
import classNames from 'classnames';
import {
  Button,
  DatePicker,
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
  useDefaultPlanningPeriods,
  useGetPlanningById,
  useGetPlanningPeriodsHierarchy,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { usePlanTaskDatesStore } from '@/store/uistate/features/planningAndReporting/taskDates';
import {
  UNLINKED_KR_ID,
  useUserPlanRepositoryMock,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
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
import dayjs, { type Dayjs } from 'dayjs';
import {
  formatDate,
  todayIso,
  validateRange,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import {
  cadenceAssignmentByKind,
  defaultSpanForKind,
  durationFilterLabel,
  groupLinesByDeadlineCadence,
  periodNameToKind,
  resolveSpan,
} from './durationFilter';

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
  start: string;
  deadline: string;
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
  const overlay = usePlanTaskDatesStore.getState().datesByTaskId[String(e.id)];
  const fallback = defaultSpanForKind(
    periodNameToKind(
      e?.planningPeriod?.name || e?.planningUser?.planningPeriod?.name,
    ),
  );
  const start = overlay?.start || e?.startDate || e?.start || fallback.start;
  const deadline =
    overlay?.deadline ||
    e?.endDate ||
    e?.deadline ||
    e?.end ||
    fallback.deadline;
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
    start,
    deadline,
  };
}

function applyEqualWeightsToDailyDraftLines(lines: DraftLine[]): DraftLine[] {
  return lines.map((l) => ({ ...l, weight: 0 }));
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
  targetValue,
  setTargetValue,
  keyResultForBounds,
  compact = false,
}: {
  metricTypeName: string | null | undefined;
  isDailySlot: boolean;
  priority: string | undefined;
  setPriority: (v: string) => void;
  targetValue: number | null;
  setTargetValue: (v: number | null) => void;
  keyResultForBounds?: any | null;
  compact?: boolean;
}) {
  const showTarget = shouldShowPlanningTarget(metricTypeName, isDailySlot);
  const controlH = compact
    ? '[&_.ant-select-selector]:!h-7 [&_.ant-select-selector]:!min-h-7 [&_.ant-select-selector]:!py-0 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[12px]'
    : controlH40;
  const inputH = compact
    ? '[&_.ant-input-number]:!h-7 [&_.ant-input-number-input-wrap]:!h-7 [&_.ant-input-number-input]:!h-7 [&_.ant-input-number-input]:!py-0 [&_.ant-input-number-input]:!text-[12px]'
    : inputNumH40;
  return (
    <div
      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1006"
      className={`grid min-w-0 flex-1 gap-2 sm:gap-3 [&>*]:min-w-0 ${
        showTarget ? 'grid-cols-2' : 'grid-cols-1'
      }`}
    >
      <Select
        placeholder="Priority"
        size={compact ? 'small' : undefined}
        className={`w-full min-w-0 rounded-lg ${controlH} [&_.ant-select-selector]:!rounded-lg`}
        value={priority}
        onChange={setPriority}
        options={priorityOptions}
      />
      {showTarget ? (
        <InputNumber
          placeholder="Target"
          min={getMetricValueInputMin(keyResultForBounds)}
          max={getMetricValueInputMax(keyResultForBounds)}
          size={compact ? 'small' : undefined}
          className={`w-full min-w-0 rounded-lg ${inputH} [&_.ant-input-number]:!rounded-lg`}
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

/** Resolve keyResultId for the live API (sentinel → null). */
function apiKeyResultId(id: string | null | undefined): string | null {
  if (!id || id === UNLINKED_KR_ID) return null;
  return String(id);
}

const NO_KEY_RESULT_VALUE = '__none__';

const DEFAULT_INLINE_PRIORITY = 'medium';
const PLAN_TASK_WEIGHT = 0;

/** One-line header from the active planning period pill name */
function inlinePlanHeadline(
  periodLabel: string,
  mode: 'create' | 'edit',
): string {
  void periodLabel;
  if (mode === 'edit') return 'Edit plan';
  return isDeadlinePlanningMockEnabled() ? 'Add to My Plan' : 'Add plan';
}

const DeadlineSpanFields = ({
  start,
  deadline,
  onStart,
  onDeadline,
}: {
  start: Dayjs | null;
  deadline: Dayjs | null;
  onStart: (value: Dayjs | null) => void;
  onDeadline: (value: Dayjs | null) => void;
}) => {
  const startIso = start ? formatDate(start) : todayIso();
  const deadlineIso = deadline ? formatDate(deadline) : null;
  const resolved =
    deadlineIso != null ? resolveSpan(startIso, deadlineIso) : null;
  const invalid =
    deadlineIso != null && validateRange(startIso, deadlineIso).ok === false;
  return (
    <div className="flex flex-col gap-2" data-cy="inline-plan-deadline-fields">
      <div
        className="flex flex-col gap-2 sm:flex-row"
        data-cy="inline-plan-deadline-pickers"
      >
        <DatePicker
          className="w-full"
          value={start}
          onChange={onStart}
          placeholder="Start"
          allowClear={false}
          data-cy="inline-plan-start-date"
        />
        <DatePicker
          className="w-full"
          value={deadline}
          onChange={onDeadline}
          placeholder="End date"
          disabledDate={(current) =>
            start ? current.isBefore(start, 'day') : false
          }
          data-cy="inline-plan-end-date"
        />
      </div>
      {invalid ? (
        <p
          className="m-0 text-[12px] text-[#DC2626]"
          data-cy="inline-plan-deadline-error"
        >
          Deadline must be on or after the start date.
        </p>
      ) : resolved ? (
        <p
          className="m-0 text-[12px] text-[#575B7A]"
          data-cy="inline-plan-deadline-hint"
        >
          {resolved.spanDays} day{resolved.spanDays === 1 ? '' : 's'} · shown in{' '}
          {durationFilterLabel(resolved.kind)}
        </p>
      ) : null}
    </div>
  );
};

export interface InlinePlanningWorkspaceHandle {
  /** Same as the card header close: confirm if drafts exist, then exit */
  requestExit: () => void;
}

interface InlinePlanningWorkspaceProps {
  /** Active period name from toolbar (e.g. Weekly, Monthly) */
  planningPeriodLabel: string;
  activeTarget: PlanningTarget | null;
  /** Selectable KR/milestone slots for the optional key-result dropdown */
  planningTargets?: PlanningTarget[];
  /** User KR API — hides add (+) UI when target KR is achieved */
  userKeyResultItems?: any[];
  /** Clear selected key result / slot */
  onClearTarget: () => void;
  /** Set or clear the active planning target (dropdown / left-panel +) */
  onSelectTarget?: (target: PlanningTarget | null) => void;
  onExit: () => void;
  /** When true, omit the header back/close control (e.g. parent Drawer supplies it) */
  hideHeaderCloseButton?: boolean;
  /**
   * Nested inside My Plan card: no draft header chrome, compact empty hint,
   * KR + pick on the left stays the entry point.
   */
  embedded?: boolean;
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
    planningTargets = [],
    userKeyResultItems = [],
    onClearTarget,
    onSelectTarget,
    onExit,
    hideHeaderCloseButton = false,
    embedded = false,
    editPlanId = null,
  },
  ref,
) {
  const { userId } = useAuthenticationStore();
  const { setInlinePlanningMode, setMKAsATask } = PlanningAndReportingStore();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();
  const cadenceAssignments = useMemo(
    () =>
      cadenceAssignmentByKind(
        defaultPlanningPeriods?.items,
        Array.isArray(planningPeriods) ? planningPeriods : [],
      ),
    [defaultPlanningPeriods?.items, planningPeriods],
  );
  const setTaskDatesBulk = usePlanTaskDatesStore((s) => s.setTaskDatesBulk);
  const hierarchyPeriodId =
    cadenceAssignments.week.periodId ||
    cadenceAssignments.daily.periodId ||
    cadenceAssignments.month.periodId;

  const { data: planGroupData, isLoading: loadingPlanGroup } =
    useGetPlanningById(editPlanId || '');
  const { data: planningPeriodHierarchy, isLoading: loadingHierarchy } =
    useGetPlanningPeriodsHierarchy(userId, hierarchyPeriodId || '');

  const { mutateAsync: createTask, isLoading: isCreating } =
    useCreatePlanTasks();
  const { mutate: updatePlanTasks, isLoading: isUpdating } =
    useUpdatePlanTasks();
  const appendTask = useUserPlanRepositoryMock((s) => s.appendTask);
  const removeMockTask = useUserPlanRepositoryMock((s) => s.removeTask);
  const getMockPlan = useUserPlanRepositoryMock((s) => s.getPlan);
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const isLoading = isCreating || isUpdating;

  const isEditMode = Boolean(editPlanId);
  const loadingEditPlan =
    isEditMode && !mockEnabled && (loadingPlanGroup || loadingHierarchy);
  const editHydratedRef = useRef<string | null>(null);

  const [draftLines, setDraftLines] = useState<DraftLine[]>([]);
  const [task, setTask] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [priority, setPriority] = useState<string | undefined>(
    DEFAULT_INLINE_PRIORITY,
  );
  const [targetValue, setTargetValue] = useState<number | null>(null);
  /** Hide add form after a task is added; user reopens via "Additional Plans". */
  const [composerCollapsed, setComposerCollapsed] = useState(false);
  /** Draft row being edited in the form (same fields as add) */
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  /** KR/milestone-as-outcome task (Achieve metric only, not daily sub-slots) */
  const [planAsAchieve, setPlanAsAchieve] = useState(false);

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
    if (!isEditMode || !editPlanId) return;
    if (editHydratedRef.current === editPlanId) return;

    if (mockEnabled) {
      const plan = getMockPlan(String(userId));
      if (!plan) return;
      const lines: DraftLine[] = plan.activeTasks
        .filter((t) => !t.isReported)
        .map((t) => ({
          id:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `draft-${t.id}`,
          serverTaskId: t.id,
          task: t.title,
          priority: t.priority ?? DEFAULT_INLINE_PRIORITY,
          weight: PLAN_TASK_WEIGHT,
          targetValue: Number(t.actualValue ?? 0),
          keyResultId: String(t.keyResultId || UNLINKED_KR_ID),
          milestoneId: null,
          parentTaskId: t.parentId,
          parentPlanId: null,
          label: t.keyResultTitle || 'Unlinked',
          achieveMK: false,
          metricTypeName: null,
          isDailySlot: t.kind === 'daily',
          keyResultTitle: t.keyResultTitle,
          milestoneTitle: null,
          start: t.start,
          deadline: t.deadline,
        }));
      setDraftLines(lines);
      setEditingDraftId(null);
      setComposerCollapsed(false);
      editHydratedRef.current = editPlanId;
      return;
    }

    if (!planGroupData) return;
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
    mockEnabled,
    getMockPlan,
    userId,
    planGroupData,
    loadingHierarchy,
    planningPeriodHierarchy?.parentPlan,
    planningPeriodHierarchy?.planData,
  ]);

  const resetForm = useCallback(() => {
    setTask('');
    setStartDate(dayjs());
    setEndDate(activeTarget?.isDailySlot ? dayjs() : null);
    setPriority(DEFAULT_INLINE_PRIORITY);
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
    setStartDate(dayjs());
    setEndDate(activeTarget.isDailySlot ? dayjs() : null);
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
  }, [
    activeTarget?.id,
    activeTarget?.targetValueHint,
    activeTarget?.metricTypeName,
    activeTarget?.isDailySlot,
    editingDraftId,
  ]);

  const cancelEditDraft = useCallback(() => {
    setEditingDraftId(null);
    resetForm();
    setComposerCollapsed(true);
  }, [resetForm]);

  const beginEditDraft = useCallback((line: DraftLine) => {
    setEditingDraftId(line.id);
    setComposerCollapsed(false);
    setTask(line.task);
    setStartDate(line.start ? dayjs(line.start) : dayjs());
    setEndDate(line.deadline ? dayjs(line.deadline) : null);
    setPriority(line.priority);
    setTargetValue(line.targetValue);
    setPlanAsAchieve(!!line.achieveMK);
  }, []);

  const handleSaveLine = useCallback(() => {
    const t = task.trim();
    if (!t) {
      message.warning('Enter a task description.');
      return;
    }
    const startIso = startDate ? formatDate(startDate) : todayIso();
    const deadlineIso = endDate ? formatDate(endDate) : '';
    if (!deadlineIso) {
      message.warning('Choose an end date.');
      return;
    }
    const range = validateRange(startIso, deadlineIso);
    if (!range.ok) {
      message.warning(range.error);
      return;
    }
    if (!priority) {
      message.warning('Select a priority.');
      return;
    }

    if (editingDraftId) {
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
      setDraftLines((prev) =>
        prev.map((l) =>
          l.id === editingDraftId
            ? {
                ...l,
                task: t,
                priority,
                weight: PLAN_TASK_WEIGHT,
                start: startIso,
                deadline: deadlineIso,
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
      setComposerCollapsed(true);
      message.success('Task updated.');
      return;
    }

    if (
      activeTarget &&
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

    const achieveMK =
      !!activeTarget &&
      planAsAchieve &&
      canUseAchieveMK(
        activeTarget.metricTypeName,
        activeTarget.isDailySlot,
        activeTarget.milestoneId,
      );
    if (
      achieveMK &&
      activeTarget &&
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

    const label = !activeTarget
      ? 'General (no key result)'
      : activeTarget.isDailySlot
        ? `${activeTarget.keyResultTitle} · ${activeTarget.parentTaskTitle || 'Task'}`
        : activeTarget.milestoneId
          ? activeTarget.milestoneTitle || 'Milestone'
          : activeTarget.keyResultTitle;

    const line: DraftLine = {
      id: crypto.randomUUID(),
      task: t,
      priority,
      weight: PLAN_TASK_WEIGHT,
      targetValue: resolvePlanningTargetValue(
        targetValue,
        activeTarget?.metricTypeName,
        !!activeTarget?.isDailySlot,
      ),
      keyResultId: activeTarget?.keyResultId ?? UNLINKED_KR_ID,
      milestoneId: activeTarget?.milestoneId ?? null,
      parentTaskId: activeTarget?.parentTaskId ?? null,
      parentPlanId: activeTarget?.parentPlanId ?? null,
      label,
      achieveMK,
      metricTypeName: activeTarget?.metricTypeName ?? null,
      isDailySlot: activeTarget?.isDailySlot ?? false,
      keyResultTitle: activeTarget?.keyResultTitle ?? 'General (no key result)',
      milestoneTitle: activeTarget?.milestoneTitle ?? null,
      start: startIso,
      deadline: deadlineIso,
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
    startDate,
    endDate,
    priority,
    targetValue,
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

    /* Newest-first in UI; submit in creation order (oldest first) for API parity */
    const ordered = [...draftLines].reverse();

    if (isEditMode && editPlanId && mockEnabled) {
      const missingDates = ordered.some(
        (l) => !resolveSpan(l.start, l.deadline),
      );
      if (missingDates) {
        message.warning('Each task needs a start date and an end date.');
        return;
      }
      const plan = getMockPlan(String(userId));
      const keepIds = new Set(
        ordered.map((l) => l.serverTaskId).filter(Boolean) as string[],
      );
      (plan?.activeTasks ?? []).forEach((t) => {
        if (!keepIds.has(t.id)) removeMockTask(String(userId), t.id);
      });
      for (const line of ordered) {
        if (line.serverTaskId) continue;
        const result = appendTask(String(userId), {
          title: line.task,
          start: line.start,
          deadline: line.deadline,
          keyResultId: line.keyResultId || UNLINKED_KR_ID,
          priority: line.priority,
          parentId: line.parentTaskId,
        });
        if (!result.ok) {
          message.warning(result.error);
          return;
        }
      }
      setDraftLines([]);
      setEditingDraftId(null);
      setMKAsATask(null);
      setInlinePlanningMode(false);
      onExit();
      message.success('Plan updated.');
      return;
    }

    if (isEditMode && editPlanId && planGroupData) {
      const pvUserId = planGroupData?.planningUser?.userId;
      const pvPlanningUserId = planGroupData?.planningUser?.id;
      const ppId = planGroupData?.planningUser?.planningPeriod?.id;

      const missingDates = ordered.some(
        (l) => !resolveSpan(l.start, l.deadline),
      );
      if (missingDates) {
        message.warning('Each task needs a start date and an end date.');
        return;
      }

      const tasks = ordered.map((l) => ({
        ...(l.serverTaskId ? { id: l.serverTaskId } : {}),
        task: l.task,
        priority: l.priority,
        weight: PLAN_TASK_WEIGHT,
        targetValue: l.targetValue,
        achieveMK: !!l.achieveMK,
        userId: String(pvUserId || userId),
        planningPeriodId: String(ppId || ''),
        planningUserId: String(pvPlanningUserId || ''),
        keyResultId: apiKeyResultId(l.keyResultId),
        milestoneId: l.milestoneId ? String(l.milestoneId) : null,
        parentTaskId: l.parentTaskId ? String(l.parentTaskId) : null,
        parentPlanId: l.parentPlanId ? String(l.parentPlanId) : null,
        planId: planGroupData.id,
        startDate: l.start,
        endDate: l.deadline,
        deadline: l.deadline,
      }));

      updatePlanTasks(
        { tasks },
        {
          onSuccess: () => {
            const overlayEntries: Record<
              string,
              { start: string; deadline: string }
            > = {};
            ordered.forEach((l) => {
              if (l.serverTaskId) {
                overlayEntries[l.serverTaskId] = {
                  start: l.start,
                  deadline: l.deadline,
                };
              }
              overlayEntries[`${l.task}::${l.keyResultId}`] = {
                start: l.start,
                deadline: l.deadline,
              };
            });
            setTaskDatesBulk(overlayEntries);
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

    const grouped = groupLinesByDeadlineCadence(ordered, cadenceAssignments);
    if (!grouped.ok) {
      message.warning(grouped.error);
      return;
    }

    if (isDeadlinePlanningMockEnabled()) {
      for (const group of grouped.groups) {
        for (const line of group.lines) {
          const result = appendTask(String(userId), {
            title: line.task,
            start: line.start,
            deadline: line.deadline,
            keyResultId: line.keyResultId || UNLINKED_KR_ID,
            priority: line.priority,
            parentId: line.parentTaskId,
          });
          if (!result.ok) {
            message.warning(result.error);
            return;
          }
        }
      }
      setDraftLines([]);
      setEditingDraftId(null);
      setMKAsATask(null);
      setInlinePlanningMode(false);
      onExit();
      message.success('Tasks added to your plan.');
      return;
    }

    const submitGroups = async () => {
      try {
        const overlayEntries: Record<
          string,
          { start: string; deadline: string }
        > = {};
        for (const group of grouped.groups) {
          const tasks = group.lines.map((l) => ({
            task: l.task,
            priority: l.priority,
            weight: PLAN_TASK_WEIGHT,
            targetValue: l.targetValue,
            achieveMK: !!l.achieveMK,
            userId: String(userId),
            planningPeriodId: group.planningPeriodId,
            planningUserId: String(group.planningUserId || ''),
            keyResultId: apiKeyResultId(l.keyResultId),
            milestoneId: l.milestoneId ? String(l.milestoneId) : null,
            parentTaskId: l.parentTaskId ? String(l.parentTaskId) : null,
            parentPlanId: l.parentPlanId ? String(l.parentPlanId) : null,
            startDate: l.start,
            endDate: l.deadline,
            deadline: l.deadline,
          }));
          const data = await createTask({ tasks });
          const created = Array.isArray(data)
            ? data
            : data?.tasks || data?.items || data?.data || [];
          group.lines.forEach((l, index) => {
            overlayEntries[`${l.task}::${l.keyResultId}`] = {
              start: l.start,
              deadline: l.deadline,
            };
            const createdId = created[index]?.id;
            if (createdId) {
              overlayEntries[String(createdId)] = {
                start: l.start,
                deadline: l.deadline,
              };
            }
          });
        }
        setTaskDatesBulk(overlayEntries);
        setDraftLines([]);
        setEditingDraftId(null);
        setMKAsATask(null);
        setInlinePlanningMode(false);
        onExit();
      } catch {
        /* mutation hook surfaces the error */
      }
    };

    void submitGroups();
  };

  const showDraftAndSubmit = draftLines.length > 0;
  /** Composer is available without a key result (unlinked / general tasks). */
  const showComposer =
    !composerCollapsed &&
    !editingDraftId &&
    !loadingEditPlan &&
    (!activeTarget || !activeTargetBlocked);

  const exitInlinePlanning = useCallback(() => {
    setDraftLines([]);
    setEditingDraftId(null);
    setMKAsATask(null);
    setInlinePlanningMode(false);
    onExit();
  }, [onExit, setInlinePlanningMode, setMKAsATask]);

  React.useEffect(() => {
    if (!editingDraftId) return;
    if (!draftLines.some((l) => l.id === editingDraftId)) {
      setEditingDraftId(null);
      resetForm();
    }
  }, [editingDraftId, draftLines, resetForm]);

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

  const keyResultSelectOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [
      { value: NO_KEY_RESULT_VALUE, label: 'No key result' },
    ];
    for (const t of planningTargets) {
      if (t.isDailySlot || t.isCompleted || t.milestoneId) continue;
      const id = String(t.keyResultId);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      opts.push({
        value: id,
        label: (t.keyResultTitle || 'Key result').trim() || 'Key result',
      });
    }
    return opts;
  }, [planningTargets]);

  const selectedKeyResultValue = activeTarget?.keyResultId
    ? String(activeTarget.keyResultId)
    : NO_KEY_RESULT_VALUE;

  const planningWithoutKeyResult =
    selectedKeyResultValue === NO_KEY_RESULT_VALUE;

  const handleKeyResultSelect = useCallback(
    (value: string) => {
      if (!value || value === NO_KEY_RESULT_VALUE) {
        onSelectTarget?.(null);
        onClearTarget();
        return;
      }
      const match =
        planningTargets.find(
          (t) =>
            String(t.keyResultId) === value &&
            !t.milestoneId &&
            !t.isDailySlot &&
            !t.isCompleted,
        ) ||
        planningTargets.find(
          (t) => String(t.keyResultId) === value && !t.isDailySlot,
        );
      if (match) {
        onSelectTarget?.(match);
      }
    },
    [planningTargets, onSelectTarget, onClearTarget],
  );

  const keyResultSelectControl = (
    <Select
      value={selectedKeyResultValue}
      onChange={handleKeyResultSelect}
      options={keyResultSelectOptions}
      placeholder="Key result (optional)"
      allowClear
      size={embedded && planningWithoutKeyResult ? 'small' : undefined}
      onClear={() => {
        onSelectTarget?.(null);
        onClearTarget();
      }}
      aria-label="Key result (optional)"
      data-cy="inline-plan-key-result-select"
      className={classNames(
        'min-w-0 [&_.ant-select-selector]:!rounded-lg',
        embedded && planningWithoutKeyResult
          ? 'w-[138px] shrink-0 [&_.ant-select-selector]:!h-7 [&_.ant-select-selector]:!min-h-7 [&_.ant-select-selection-item]:!text-[12px]'
          : classNames(
              'w-full',
              embedded
                ? '[&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8'
                : '[&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10',
            ),
      )}
      popupMatchSelectWidth={!(embedded && planningWithoutKeyResult)}
    />
  );

  return (
    <div
      className={classNames('min-w-0 max-w-full', embedded ? '' : 'pr-1')}
      data-cy="inline-planning-workspace"
      data-embedded={embedded ? 'true' : undefined}
    >
      <div
        className={classNames(
          'overflow-hidden bg-white',
          embedded ? '' : 'rounded-xl border border-[#F1F2F6]',
        )}
        data-cy="inline-plan-draft-card"
      >
        {!embedded ? (
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
              </span>
              {showDraftAndSubmit ? (
                <Button
                  type="primary"
                  loading={isLoading}
                  onClick={() => handleSubmit()}
                  className="!m-0 !h-9 !min-h-9 !w-auto !min-w-0 rounded-lg !border-[#1E40AF] !bg-[#1E40AF] !px-3.5 text-[12px] font-semibold !text-white hover:!border-[#1E3A8A] hover:!bg-[#1E3A8A] md:!h-10 md:!min-h-10 md:!px-5 md:text-[13px]"
                  data-cy="inline-plan-create-plan"
                >
                  {isEditMode
                    ? 'Save changes'
                    : isDeadlinePlanningMockEnabled()
                      ? 'Add to plan'
                      : 'Save plan'}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-937"
          className="min-w-0"
        >
          {loadingEditPlan && isEditMode && draftLines.length === 0 ? (
            <InlinePlanningEditSkeleton />
          ) : null}

          {showComposer ? (
            <div
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1039"
              className={classNames(
                embedded
                  ? 'space-y-2 rounded-lg bg-[#F5F6F9] px-2.5 py-2'
                  : 'space-y-4 px-3 py-3 md:px-5 md:py-5',
                !embedded && draftLines.length > 0
                  ? 'border-b border-[#F1F2F6]'
                  : '',
              )}
            >
              <div
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-962"
                className={classNames(
                  'flex items-center justify-between gap-2',
                  embedded ? 'min-h-7' : 'gap-3 md:items-start',
                )}
              >
                {embedded && planningWithoutKeyResult ? (
                  <span
                    data-cy="inlineplanningworkspace-1508"
                    className="min-w-0 flex-1"
                  />
                ) : (
                  <div
                    data-cy="inline-plan-key-result-select-wrap"
                    className="min-w-0 flex-1"
                  >
                    {keyResultSelectControl}
                  </div>
                )}
                <button
                  data-cy="inline-plan-composer-close"
                  type="button"
                  onClick={requestExitInlinePlanning}
                  className={classNames(
                    'flex flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#E8EAF0] hover:text-[#574CFF]',
                    embedded ? 'h-7 w-7' : 'h-9 w-9',
                  )}
                  aria-label="Close plan composer"
                >
                  <CloseOutlined
                    className={embedded ? 'text-[12px]' : 'text-[15px]'}
                  />
                </button>
              </div>

              <div
                data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-982"
                className={classNames(
                  embedded
                    ? ''
                    : 'rounded-lg border border-[#F1F2F6] bg-[#FAFBFC]/60 p-4',
                )}
              >
                <div
                  data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-983"
                  className={embedded ? 'space-y-2' : 'space-y-4'}
                >
                  <Input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="What will you accomplish?"
                    disabled={planAsAchieve && showAchieveOptionForAdd}
                    className={classNames(
                      'rounded-lg border-[#E5E7EB] text-[13px] shadow-none hover:border-[#D1D5DB] disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#575B7A]',
                      embedded ? '!h-8' : '!h-10',
                    )}
                  />
                  <DeadlineSpanFields
                    start={startDate}
                    deadline={endDate}
                    onStart={setStartDate}
                    onDeadline={setEndDate}
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
                    className={classNames(
                      'flex flex-col lg:flex-row lg:items-end lg:justify-between',
                      embedded ? 'gap-2 lg:gap-3' : 'gap-4 lg:gap-5',
                    )}
                  >
                    <div
                      data-cy="inline-planning-div-1583"
                      className={classNames(
                        'flex min-w-0 flex-1 items-end gap-2',
                        embedded && planningWithoutKeyResult ? 'flex-row' : '',
                      )}
                    >
                      {embedded && planningWithoutKeyResult ? (
                        <div data-cy="inline-plan-key-result-select-wrap">
                          {keyResultSelectControl}
                        </div>
                      ) : null}
                      <PlanningMetricsRow
                        metricTypeName={activeTarget?.metricTypeName}
                        isDailySlot={!!activeTarget?.isDailySlot}
                        priority={priority}
                        setPriority={setPriority}
                        targetValue={targetValue}
                        setTargetValue={setTargetValue}
                        keyResultForBounds={activeKeyResultForBounds}
                        compact={embedded && planningWithoutKeyResult}
                      />
                    </div>
                    <Button
                      type="default"
                      icon={<PlusOutlined className="text-[12px]" />}
                      onClick={handleSaveLine}
                      className={classNames(
                        '!m-0 w-full shrink-0 lg:ml-2 lg:w-auto',
                        embedded
                          ? `!h-8 px-3 text-[12px] ${inlineComposerOutlineBtnClass}`
                          : `!h-10 px-5 ${inlineComposerOutlineBtnClass}`,
                      )}
                    >
                      Add to plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {(activeTarget || draftLines.length > 0) &&
          composerCollapsed &&
          draftLines.length > 0 &&
          !editingDraftId ? (
            <div
              data-cy="inline-plan-additional-plans-row"
              className={classNames(
                'flex items-center justify-between',
                embedded
                  ? 'px-0 py-2'
                  : 'border-b border-[#F1F2F6] px-4 py-3 md:px-5',
              )}
            >
              <span
                className="text-[13px] text-[#575B7A]"
                data-cy="inline-plan-add-more-hint"
              >
                Add more tasks to this plan.
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

          {showDraftAndSubmit ? (
            <ul
              data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-ul-1075"
              className={classNames(
                'flex flex-col gap-2.5',
                embedded
                  ? 'gap-2 px-0 py-1 md:gap-2'
                  : 'p-3 md:gap-3 md:p-4 md:px-5',
              )}
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
                            <DeadlineSpanFields
                              start={startDate}
                              deadline={endDate}
                              onStart={setStartDate}
                              onDeadline={setEndDate}
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
                ) : embedded ? (
                  <li
                    data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-li-1333"
                    key={l.id}
                    className="group flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#F8F9FB]"
                  >
                    <OutcomeTaskListIcon line={l} />
                    <div
                      data-cy="inlineplanningworkspace-1786"
                      className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
                    >
                      <span
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-1182"
                        className="min-w-0 truncate text-[13px] font-semibold text-[#161A2C]"
                      >
                        {l.task}
                      </span>
                      <span
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-p-1185"
                        className="hidden min-w-0 truncate text-[12px] text-[#8F94A3] sm:inline"
                      >
                        {l.label}
                      </span>
                      {(() => {
                        const span = resolveSpan(l.start, l.deadline);
                        if (!span) return null;
                        return (
                          <span
                            className="hidden shrink-0 text-[11px] tabular-nums text-[#575B7A] md:inline"
                            data-cy="inline-plan-draft-span-hint"
                          >
                            {span.spanDays}d · {durationFilterLabel(span.kind)}
                          </span>
                        );
                      })()}
                      <span
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1389"
                        className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-px text-[10px] font-semibold capitalize ${draftPriorityPillClass(l.priority)}`}
                      >
                        {l.priority}
                      </span>
                      {shouldShowTargetOnDraftLine(l) ? (
                        <span
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-1217"
                          className="shrink-0 text-[11px] tabular-nums text-[#475569]"
                        >
                          T{l.targetValue}
                        </span>
                      ) : null}
                      {l.achieveMK ? (
                        <span
                          data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-span-outcome-pill"
                          className="hidden shrink-0 text-[10px] font-semibold text-[#1E40AF] lg:inline"
                        >
                          Outcome
                        </span>
                      ) : null}
                    </div>
                    <div
                      data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-div-1189"
                      className="flex shrink-0 items-center gap-0"
                    >
                      <button
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-button-1367"
                        type="button"
                        onClick={() => beginEditDraft(l)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#574CFF]"
                        aria-label="Edit task"
                      >
                        <EditOutlined className="text-[13px]" />
                      </button>
                      <button
                        data-cy="planning-and-reporting-components-planning-inlineplanningworkspace-tsx-inlineplanningworkspace-button-1375"
                        type="button"
                        onClick={() => removeLine(l.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F1F5F9] hover:text-[#64748B]"
                        aria-label="Remove task"
                      >
                        <CloseOutlined className="text-[13px]" />
                      </button>
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
                          {(() => {
                            const span = resolveSpan(l.start, l.deadline);
                            if (!span) return null;
                            return (
                              <p
                                className="mt-1 text-[12px] leading-relaxed text-[#575B7A]"
                                data-cy="inline-plan-draft-span-hint"
                              >
                                {span.spanDays} day
                                {span.spanDays === 1 ? '' : 's'} ·{' '}
                                {durationFilterLabel(span.kind)}
                              </p>
                            );
                          })()}
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

          {embedded && showDraftAndSubmit ? (
            <div
              className="flex flex-wrap items-center justify-end gap-2 px-0 py-2"
              data-cy="inline-plan-embedded-actions"
            >
              <span
                data-cy="inlineplanningworkspace-1975"
                className="mr-auto text-[12px] tabular-nums text-[#475569]"
              >
                {draftLines.length} task{draftLines.length !== 1 ? 's' : ''}
              </span>
              <Button
                type="default"
                onClick={requestExitInlinePlanning}
                className="!h-9 rounded-lg text-[12px] font-semibold"
                data-cy="inline-plan-embedded-cancel"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={isLoading}
                onClick={() => handleSubmit()}
                className="!h-9 rounded-lg !border-[#1E40AF] !bg-[#1E40AF] !px-4 text-[12px] font-semibold !text-white hover:!border-[#1E3A8A] hover:!bg-[#1E3A8A]"
                data-cy="inline-plan-embedded-save"
              >
                {isEditMode ? 'Save changes' : 'Add to plan'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

InlinePlanningWorkspace.displayName = 'InlinePlanningWorkspace';

export default InlinePlanningWorkspace;
