'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { RadioChangeEvent } from 'antd';
import {
  Avatar,
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  message,
} from 'antd';
import {
  CloseOutlined,
  DownOutlined,
  FlagOutlined,
  KeyOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  buildParentTask,
  formatDate,
  validateDailySubtask,
  validateRange,
  validateWeeklySubtask,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { usePlanTaskDatesStore } from '@/store/uistate/features/planningAndReporting/taskDates';
import {
  UNLINKED_KR_ID,
  useUserPlanRepositoryMock,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  buildPlanTaskAssigneePickerRoster,
  type AssigneeChip,
} from './assigneeChipRoster';
import {
  getMetricValueInputMax,
  getMetricValueInputMin,
} from '@/utils/okrMetricValueBounds';
import type { PlanningTarget } from './buildPlanningTargets';
import {
  cadenceAssignmentByKind,
  groupLinesByDeadlineCadence,
} from './durationFilter';
import {
  childCapForParent,
  childKindForParent,
  resolveHierarchyParentKind,
} from '../prototype/mockPlanningConstants';
import {
  DEFAULT_INLINE_PRIORITY,
  NO_KEY_RESULT_VALUE,
  applyTargetToDraftLine,
  canUseAchieveMK,
  createDelegatedDraftLine,
  createEmptyDraftLine,
  createEmptyDraftSubtask,
  draftLinesToCreatePayloads,
  isDraftLineDelegated,
  selectablePlanningTargets,
  shouldShowPlanningTarget,
  validateDraftLinesForCreate,
  validateDraftSubtasksForCreate,
  type DraftLine,
  type DraftSubtask,
} from './planDraft';

type PlanDraftBundle = {
  line: DraftLine;
  subtasks: DraftSubtask[];
};

function inferSubtaskContext(line: DraftLine):
  | { canAddSubtasks: false }
  | {
      canAddSubtasks: true;
      childKind: DeadlineKind;
      cap: number;
    } {
  const built = buildParentTask({
    id: 'draft',
    title: line.task || 'Task',
    start: line.start,
    deadline: line.deadline,
  });
  if (!built.ok) return { canAddSubtasks: false };
  const parentKind = resolveHierarchyParentKind(built.task);
  const childKind = childKindForParent(parentKind);
  if (!childKind) return { canAddSubtasks: false };
  return {
    canAddSubtasks: true,
    childKind,
    cap: childCapForParent(parentKind, line.start, line.deadline),
  };
}

function childKindLabel(kind: DeadlineKind): string {
  if (kind === 'daily') return 'daily';
  if (kind === 'week') return 'weekly';
  return 'subtask';
}

type CreatePlansModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (assignedUserId?: string) => void;
  planningTargets?: PlanningTarget[];
  /** Pre-filled assignee when opened from a teammate plan card. */
  prefilledAssigneeUserId?: string;
  prefilledAssigneeLabel?: string;
  /** When true, assignee cannot be cleared (teammate card entry). */
  lockAssignee?: boolean;
  /** When true, always delegate mode and hide Self/Delegate toggle. */
  delegateOnly?: boolean;
  /** Live KR rows for metric target bounds (percentage, currency, etc.). */
  userKeyResultItems?: any[];
};

const PRIORITY_META: Record<
  string,
  { label: string; dot: string; chipBg: string; chipText: string }
> = {
  high: {
    label: 'High',
    dot: '#EF4444',
    chipBg: '#FEE2E2',
    chipText: '#991B1B',
  },
  medium: {
    label: 'Medium',
    dot: '#F59E0B',
    chipBg: '#FEF9C3',
    chipText: '#854D0E',
  },
  low: {
    label: 'Low',
    dot: '#22C55E',
    chipBg: '#DCFCE7',
    chipText: '#166534',
  },
};

const priorityOptions = (['high', 'medium', 'low'] as const).map((value) => ({
  value,
  label: (
    <span
      data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-span-101"
      className="inline-flex items-center gap-1.5"
    >
      <span
        data-cy={`create-plan-priority-dot-${value}`}
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: PRIORITY_META[value].dot }}
      />
      {PRIORITY_META[value].label}
    </span>
  ),
}));

const fieldLabelClass =
  'mb-1 block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#8F94A3]';

const controlClass =
  'w-full !rounded-lg [&_.ant-select-selector]:!rounded-lg [&_.ant-picker]:!rounded-lg';

const addActionLinkButtonClass =
  '!h-auto w-full !justify-start !border-0 !bg-transparent !px-0 !py-0 !shadow-none !text-[13px] !font-semibold !text-[#574CFF] hover:!bg-transparent hover:!text-[#4639E8]';

const footerAddActionLinkButtonClass =
  '!h-auto !border-0 !bg-transparent !px-0 !py-0 !shadow-none !text-[13px] !font-semibold !text-[#574CFF] hover:!bg-transparent hover:!text-[#4639E8]';

const createPlansAudienceRadioGroupClass =
  'create-plans-audience-radio !flex !shrink-0 !items-center !justify-start !gap-2 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:!inline-flex [&_.ant-radio-wrapper]:!h-9 [&_.ant-radio-wrapper]:!items-center [&_.ant-radio-wrapper]:!gap-2 [&_.ant-radio-wrapper]:!rounded-lg [&_.ant-radio-wrapper]:!border [&_.ant-radio-wrapper]:!border-[#D9D9D9] [&_.ant-radio-wrapper]:!bg-white [&_.ant-radio-wrapper]:!px-3 [&_.ant-radio-wrapper]:!text-[13px] [&_.ant-radio-wrapper]:!font-medium [&_.ant-radio-wrapper]:!text-[#575B7A] [&_.ant-radio-wrapper]:!shadow-none [&_.ant-radio-wrapper]:after:!content-none [&_.ant-radio-wrapper:hover]:!border-[#1E40AF] [&_.ant-radio-wrapper-checked]:!border-[#1E40AF] [&_.ant-radio-wrapper-checked]:!text-[#2D2F45] [&_.ant-radio]:!top-0 [&_.ant-radio]:!shrink-0 [&_.ant-radio-inner]:!h-4 [&_.ant-radio-inner]:!w-4 [&_.ant-radio-inner]:!border-[#D9D9D9] [&_.ant-radio-inner]:!bg-white [&_.ant-radio-checked_.ant-radio-inner]:!border-[#1E40AF] [&_.ant-radio-checked_.ant-radio-inner]:!bg-[#1E40AF] [&_.ant-radio-checked_.ant-radio-inner::after]:!scale-[0.375] [&_.ant-radio-checked_.ant-radio-inner::after]:!bg-white [&_.ant-radio-checked_.ant-radio-inner::after]:!opacity-100';

type PlanAudience = 'self' | 'delegate';

function targetSelectValue(line: DraftLine): string {
  if (!line.keyResultId || line.keyResultId === UNLINKED_KR_ID) {
    return NO_KEY_RESULT_VALUE;
  }
  if (line.milestoneId) {
    return `ms:${line.keyResultId}:${line.milestoneId}`;
  }
  return `kr:${line.keyResultId}`;
}

function findTargetBySelectValue(
  value: string,
  targets: PlanningTarget[],
): PlanningTarget | null {
  if (!value || value === NO_KEY_RESULT_VALUE) return null;
  if (value.startsWith('ms:')) {
    const [, krId, msId] = value.split(':');
    return (
      targets.find(
        (t) =>
          String(t.keyResultId) === String(krId) &&
          String(t.milestoneId) === String(msId),
      ) ?? null
    );
  }
  if (value.startsWith('kr:')) {
    const krId = value.slice(3);
    return (
      targets.find(
        (t) =>
          String(t.keyResultId) === String(krId) &&
          !t.milestoneId &&
          !t.isDailySlot,
      ) ?? null
    );
  }
  return null;
}

function FieldShell({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <label
      data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-label-166"
      className={`block min-w-0 ${className}`}
    >
      <span
        data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-span-167"
        className={fieldLabelClass}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function CollapsedPlanRow({
  line,
  index,
  subtaskCount,
  delegateMode,
  assigneeLabel,
  canRemove,
  onExpand,
  onRemove,
}: {
  line: DraftLine;
  index: number;
  subtaskCount: number;
  delegateMode: boolean;
  assigneeLabel?: string;
  canRemove: boolean;
  onExpand: () => void;
  onRemove: () => void;
}) {
  const priorityKey = (line.priority || DEFAULT_INLINE_PRIORITY).toLowerCase();
  const priorityMeta = PRIORITY_META[priorityKey] || PRIORITY_META.medium;
  const title = line.task.trim() || 'Untitled task';

  return (
    <button
      type="button"
      onClick={onExpand}
      className="group flex w-full items-start gap-2.5 rounded-xl border border-[#F1F2F6] bg-[#FAFBFC] px-3 py-3 text-left shadow-[0_1px_2px_rgba(22,26,44,0.04)] transition-colors hover:border-[#E0E7FF] hover:bg-white sm:px-3.5"
      data-cy={`create-plan-row-collapsed-${index}`}
    >
      <span
        className="mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-white px-1.5 text-[11px] font-bold tabular-nums text-[#575B7A]"
        aria-hidden
        data-cy={`create-plan-row-collapsed-index-${index}`}
      >
        {index + 1}
      </span>
      <div
        className="min-w-0 flex-1"
        data-cy={`create-plan-row-collapsed-body-${index}`}
      >
        <div
          className="flex min-w-0 items-start justify-between gap-2"
          data-cy={`create-plan-row-collapsed-header-${index}`}
        >
          <p
            className="m-0 min-w-0 truncate text-[14px] font-semibold text-[#161A2C]"
            data-cy={`create-plan-row-collapsed-title-${index}`}
          >
            {title}
          </p>
          <div
            className="flex shrink-0 items-center gap-1.5"
            data-cy={`create-plan-row-collapsed-meta-${index}`}
          >
            {subtaskCount > 0 ? (
              <span
                className="inline-flex rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#4338CA]"
                data-cy={`create-plan-row-collapsed-subtask-count-${index}`}
              >
                {subtaskCount} subtask{subtaskCount === 1 ? '' : 's'}
              </span>
            ) : null}
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold leading-none"
              data-cy={`create-plan-row-collapsed-priority-${index}`}
              style={{
                backgroundColor: priorityMeta.chipBg,
                color: priorityMeta.chipText,
              }}
            >
              {priorityMeta.label}
            </span>
            <RightOutlined className="text-[10px] text-[#94A3B8]" aria-hidden />
          </div>
        </div>
        {delegateMode && assigneeLabel ? (
          <p
            className="m-0 mt-1 truncate text-[12px] text-[#8F94A3]"
            data-cy={`create-plan-row-collapsed-assignee-${index}`}
          >
            {assigneeLabel}
          </p>
        ) : null}
      </div>
      {canRemove ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }
          }}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] opacity-70 transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:opacity-100"
          aria-label={`Remove task ${index + 1}`}
          data-cy={`create-plan-row-remove-${index}`}
        >
          <CloseOutlined className="text-[12px]" />
        </span>
      ) : null}
    </button>
  );
}

function PlanRowSubtasksEditor({
  line,
  subtasks,
  onChange,
}: {
  line: DraftLine;
  subtasks: DraftSubtask[];
  onChange: (next: DraftSubtask[]) => void;
}) {
  const ctx = inferSubtaskContext(line);

  if (!ctx.canAddSubtasks) {
    return null;
  }

  const { childKind, cap } = ctx;
  const label = childKindLabel(childKind);
  const remaining = Math.max(0, cap - subtasks.length);

  const updateSubtask = (id: string, patch: Partial<DraftSubtask>) => {
    onChange(
      subtasks.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
    );
  };

  const addSubtask = () => {
    if (subtasks.length >= cap) {
      message.warning(`Maximum ${cap} ${label} subtasks.`);
      return;
    }
    onChange([
      ...subtasks,
      createEmptyDraftSubtask(line.start, line.deadline, childKind),
    ]);
  };

  const removeSubtask = (id: string) => {
    onChange(subtasks.filter((sub) => sub.id !== id));
  };

  return (
    <>
      {subtasks.length > 0 ? (
        <div className="mt-3 space-y-2" data-cy="create-plan-subtasks-list">
          {subtasks.map((sub, subIndex) => (
            <div
              key={sub.id}
              className="rounded-xl border border-[#F1F2F6] bg-[#FAFBFC] p-3"
              data-cy={`create-plan-subtask-row-${subIndex}`}
            >
              <div
                className="mb-2 flex items-center gap-2"
                data-cy={`create-plan-subtask-title-row-${subIndex}`}
              >
                <Input
                  placeholder={`${label} subtask title`}
                  value={sub.task}
                  onChange={(e) =>
                    updateSubtask(sub.id, { task: e.target.value })
                  }
                  className="!rounded-lg"
                  data-cy={`create-plan-subtask-title-${subIndex}`}
                />
                <button
                  type="button"
                  onClick={() => removeSubtask(sub.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  aria-label="Remove subtask"
                  data-cy={`create-plan-subtask-remove-${subIndex}`}
                >
                  <CloseOutlined className="text-[12px]" />
                </button>
              </div>
              <div
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                data-cy={`create-plan-subtask-dates-${subIndex}`}
              >
                <DatePicker
                  className="w-full !rounded-lg [&_.ant-picker-input>input]:!text-[13px]"
                  value={sub.start ? dayjs(sub.start) : null}
                  onChange={(value) => {
                    const iso = value ? formatDate(value) : sub.start;
                    if (childKind === 'daily') {
                      updateSubtask(sub.id, { start: iso, deadline: iso });
                    } else {
                      updateSubtask(sub.id, { start: iso });
                    }
                  }}
                  allowClear={false}
                  placeholder="Start"
                  data-cy={`create-plan-subtask-start-${subIndex}`}
                />
                {childKind !== 'daily' ? (
                  <DatePicker
                    className="w-full !rounded-lg [&_.ant-picker-input>input]:!text-[13px]"
                    value={sub.deadline ? dayjs(sub.deadline) : null}
                    onChange={(value) => {
                      const iso = value ? formatDate(value) : sub.deadline;
                      updateSubtask(sub.id, { deadline: iso });
                    }}
                    allowClear={false}
                    placeholder="End"
                    data-cy={`create-plan-subtask-deadline-${subIndex}`}
                  />
                ) : null}
              </div>
              <FieldShell label="Description" className="mt-2.5">
                <Input.TextArea
                  rows={2}
                  placeholder="Optional subtask description"
                  value={sub.description ?? ''}
                  onChange={(e) =>
                    updateSubtask(sub.id, { description: e.target.value })
                  }
                  className="!rounded-lg !text-[13px]"
                  data-cy={`create-plan-subtask-description-${subIndex}`}
                />
              </FieldShell>
            </div>
          ))}
        </div>
      ) : null}

      {remaining > 0 ? (
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={addSubtask}
          data-cy="create-plan-subtask-add"
          className={`${addActionLinkButtonClass}${subtasks.length > 0 ? ' mt-2.5' : ''}`}
        >
          Add subtask
        </Button>
      ) : null}
    </>
  );
}

function resolveKeyResultForBounds(
  line: DraftLine,
  userKeyResultItems: any[],
): any | null {
  const krId = line.keyResultId;
  if (!krId || krId === UNLINKED_KR_ID) return null;
  const live = userKeyResultItems.find(
    (kr) => kr?.id != null && String(kr.id) === String(krId),
  );
  if (live) return live;
  if (!line.metricTypeName) return null;
  return {
    metricType: { name: line.metricTypeName },
    metricTypeName: line.metricTypeName,
  };
}

function PlanRowEditor({
  line,
  index,
  canRemove,
  showAssigneePicker = false,
  isSelfAssignee = true,
  viewerUserId,
  lockAssignee = false,
  lockedAssigneeLabel,
  assigneeOptions,
  targetOptions,
  userKeyResultItems = [],
  subtasks,
  onSubtasksChange,
  onChange,
  onTargetSelect,
  onRemove,
  onCollapse,
}: {
  line: DraftLine;
  index: number;
  canRemove: boolean;
  showAssigneePicker?: boolean;
  isSelfAssignee?: boolean;
  viewerUserId?: string;
  lockAssignee?: boolean;
  lockedAssigneeLabel?: string;
  assigneeOptions: AssigneeChip[];
  targetOptions: { value: string; label: string }[];
  userKeyResultItems?: any[];
  subtasks: DraftSubtask[];
  onSubtasksChange: (next: DraftSubtask[]) => void;
  onChange: (next: DraftLine) => void;
  onTargetSelect: (selectValue: string) => void;
  onRemove: () => void;
  onCollapse?: () => void;
}) {
  const hideKeyResult = !isSelfAssignee;
  const linked =
    !hideKeyResult && !!line.keyResultId && line.keyResultId !== UNLINKED_KR_ID;
  const keyResultForBounds = resolveKeyResultForBounds(
    line,
    userKeyResultItems,
  );

  const showTarget =
    linked &&
    !line.achieveMK &&
    shouldShowPlanningTarget(line.metricTypeName, line.isDailySlot);
  const showAchieve = canUseAchieveMK(
    line.metricTypeName,
    line.isDailySlot,
    line.milestoneId,
  );

  const priorityKey = (line.priority || DEFAULT_INLINE_PRIORITY).toLowerCase();
  const priorityMeta = PRIORITY_META[priorityKey] || PRIORITY_META.medium;
  const selectedTargetLabel =
    targetOptions.find((o) => o.value === targetSelectValue(line))?.label ??
    null;

  const start = line.start ? dayjs(line.start) : null;
  const deadline = line.deadline ? dayjs(line.deadline) : null;
  const dateRange =
    start && deadline ? ([start, deadline] as [Dayjs, Dayjs]) : null;

  const setDateRange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (!values?.[0] || !values?.[1]) return;
    const startIso = formatDate(values[0]);
    const endIso = formatDate(values[1]);
    const range = validateRange(startIso, endIso);
    onChange({
      ...line,
      start: startIso,
      deadline: range.ok ? endIso : startIso,
    });
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-[#F1F2F6] bg-white shadow-[0_1px_2px_rgba(22,26,44,0.04)] transition-shadow hover:border-[#E0E7FF] hover:shadow-[0_4px_16px_rgba(87,76,255,0.06)]"
      data-cy={`create-plan-row-${index}`}
    >
      <div
        data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-237"
        className="px-3 py-3 sm:px-3.5 sm:py-3.5"
      >
        <div
          data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-238"
          className="mb-2.5 flex items-start gap-2"
        >
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              className="mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F1F2F6] text-[#575B7A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
              aria-label={`Collapse task ${index + 1}`}
              data-cy={`create-plan-row-collapse-${index}`}
            >
              <DownOutlined className="text-[10px]" />
            </button>
          ) : null}
          <span
            data-cy={`create-plan-row-index-${index}`}
            className="mt-1.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-[#F1F2F6] px-1.5 text-[11px] font-bold tabular-nums text-[#575B7A]"
            aria-hidden
          >
            {index + 1}
          </span>
          <Input
            variant="borderless"
            placeholder="Task name"
            value={line.task}
            onChange={(e) => onChange({ ...line, task: e.target.value })}
            className="min-w-0 flex-1 !px-0 !text-[15px] !font-semibold !leading-snug !text-[#161A2C] placeholder:!font-medium placeholder:!text-[#B0B3C0]"
            data-cy={`create-plan-row-title-${index}`}
          />
          <div
            data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-253"
            className="mt-0.5 flex max-w-[55%] shrink-0 flex-wrap items-center justify-end gap-1.5"
          >
            {linked && selectedTargetLabel ? (
              <span
                data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-span-255"
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#4338CA]"
              >
                {line.milestoneId ? (
                  <FlagOutlined className="text-[11px]" aria-hidden />
                ) : (
                  <KeyOutlined className="text-[11px]" aria-hidden />
                )}
                <span
                  data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-span-261"
                  className="truncate"
                >
                  {selectedTargetLabel}
                </span>
              </span>
            ) : null}
            <span
              data-cy={`create-plan-row-priority-${index}`}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold leading-none"
              style={{
                backgroundColor: priorityMeta.chipBg,
                color: priorityMeta.chipText,
              }}
            >
              <span
                data-cy={`create-plan-row-priority-dot-${index}`}
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: priorityMeta.dot }}
              />
              {priorityMeta.label}
            </span>
            {canRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] opacity-70 transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Remove plan ${index + 1}`}
                data-cy={`create-plan-row-remove-${index}`}
              >
                <CloseOutlined className="text-[12px]" />
              </button>
            ) : null}
          </div>
        </div>

        {showAssigneePicker ? (
          <div data-cy={`create-plan-row-assignee-${index}`} className="mb-2.5">
            {lockAssignee && lockedAssigneeLabel ? (
              <FieldShell label="Assignee">
                <div
                  data-cy={`create-plan-row-assignee-locked-${index}`}
                  className={`${controlClass} flex h-9 items-center rounded-lg border border-[#E5E7EB] bg-[#FAFBFC] px-3 text-[13px] font-medium text-[#2D2F45]`}
                >
                  {lockedAssigneeLabel}
                </div>
              </FieldShell>
            ) : (
              <FieldShell label="Assignee">
                <Select
                  showSearch
                  placeholder="Choose assignee"
                  value={line.delegateUserId ?? viewerUserId ?? undefined}
                  onChange={(value) => {
                    const nextUserId = value ?? null;
                    const planningForSelf =
                      !!nextUserId &&
                      !!viewerUserId &&
                      String(nextUserId) === String(viewerUserId);
                    if (planningForSelf) {
                      onChange({
                        ...line,
                        assigneeMode: 'self',
                        delegateUserId: nextUserId,
                      });
                      return;
                    }
                    onChange(
                      applyTargetToDraftLine(
                        {
                          ...line,
                          assigneeMode: 'delegate',
                          delegateUserId: nextUserId,
                        },
                        null,
                      ),
                    );
                  }}
                  optionFilterProp="label"
                  className={controlClass}
                  data-cy={`create-plan-row-assignee-select-${index}`}
                >
                  {assigneeOptions.map((chip) => (
                    <Select.Option
                      key={chip.userId}
                      value={chip.userId}
                      label={chip.label}
                    >
                      <AssigneeSelectOption chip={chip} />
                    </Select.Option>
                  ))}
                </Select>
              </FieldShell>
            )}
          </div>
        ) : null}

        <div
          data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-291"
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:gap-3"
        >
          <FieldShell label="Date range" className="sm:col-span-8">
            <DatePicker.RangePicker
              className={`${controlClass} !h-9 w-full [&_.ant-picker-input>input]:!text-[13px]`}
              value={dateRange}
              onChange={setDateRange}
              allowClear={false}
              data-cy={`create-plan-row-date-range-${index}`}
            />
          </FieldShell>
          <FieldShell label="Priority" className="sm:col-span-4">
            <Select
              className={`${controlClass} w-full [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!min-h-9 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[13px]`}
              value={line.priority || DEFAULT_INLINE_PRIORITY}
              onChange={(priority) => onChange({ ...line, priority })}
              options={priorityOptions}
              optionLabelProp="label"
              data-cy={`create-plan-row-priority-${index}`}
            />
          </FieldShell>

          {!hideKeyResult ? (
            <>
              <FieldShell
                label="Key result"
                className={showTarget ? 'sm:col-span-9' : 'sm:col-span-12'}
              >
                <Select
                  className={`${controlClass} w-full [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!min-h-9 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[13px]`}
                  showSearch
                  optionFilterProp="label"
                  value={targetSelectValue(line)}
                  onChange={onTargetSelect}
                  options={targetOptions}
                  placeholder="Optional link"
                  data-cy={`create-plan-row-kr-${index}`}
                />
              </FieldShell>
              {showTarget ? (
                <FieldShell label="Target" className="sm:col-span-3">
                  <InputNumber
                    className="w-full !h-9 !rounded-lg [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!text-[13px]"
                    placeholder="Target"
                    min={getMetricValueInputMin(keyResultForBounds)}
                    max={getMetricValueInputMax(keyResultForBounds)}
                    value={line.targetValue || undefined}
                    onChange={(v) => {
                      if (v == null) {
                        onChange({ ...line, targetValue: 0 });
                        return;
                      }
                      const floor = getMetricValueInputMin(keyResultForBounds);
                      const ceiling =
                        getMetricValueInputMax(keyResultForBounds);
                      let next = Number(v);
                      if (!Number.isFinite(next)) {
                        onChange({ ...line, targetValue: 0 });
                        return;
                      }
                      if (next < floor) next = floor;
                      if (ceiling != null && next > ceiling) next = ceiling;
                      onChange({ ...line, targetValue: next });
                    }}
                    data-cy={`create-plan-row-target-${index}`}
                  />
                </FieldShell>
              ) : null}
            </>
          ) : null}
        </div>

        {showAchieve && !hideKeyResult ? (
          <div
            data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-359"
            className="mt-2.5"
          >
            <Checkbox
              checked={line.achieveMK}
              onChange={(e) =>
                onChange({
                  ...line,
                  achieveMK: e.target.checked,
                  targetValue: e.target.checked ? 0 : line.targetValue,
                })
              }
              className="text-[12px] text-[#575B7A]"
              data-cy={`create-plan-row-achieve-${index}`}
            >
              {line.milestoneId ? 'Plan milestone' : 'Plan key result'}
            </Checkbox>
          </div>
        ) : null}

        <FieldShell label="Description" className="mt-2.5">
          <Input.TextArea
            rows={2}
            placeholder="Optional task description"
            value={line.description ?? ''}
            onChange={(e) => onChange({ ...line, description: e.target.value })}
            className="!rounded-lg !text-[13px]"
            data-cy={`create-plan-row-description-${index}`}
          />
        </FieldShell>

        <div
          className="mt-2.5"
          data-cy={`create-plan-row-subtasks-wrap-${index}`}
        >
          <PlanRowSubtasksEditor
            line={line}
            subtasks={subtasks}
            onChange={onSubtasksChange}
          />
        </div>
      </div>
    </div>
  );
}

function AssigneeSelectOption({ chip }: { chip: AssigneeChip }) {
  return (
    <div
      data-cy={`assign-plan-task-assignee-option-${chip.userId}`}
      className="flex items-center gap-2 py-0.5"
    >
      <Avatar
        size={24}
        src={chip.avatar}
        className="shrink-0 bg-[#EEF2FF] text-[11px] font-semibold text-[#1E40AF]"
        data-cy={`assign-plan-task-assignee-avatar-${chip.userId}`}
      >
        {chip.initials}
      </Avatar>
      <span
        data-cy={`assign-plan-task-assignee-label-${chip.userId}`}
        className="truncate text-[13px] text-[#2D2F45]"
      >
        {chip.label}
      </span>
    </div>
  );
}

export default function CreatePlansModal({
  open,
  onClose,
  onSuccess,
  planningTargets = [],
  prefilledAssigneeUserId,
  prefilledAssigneeLabel,
  lockAssignee = false,
  delegateOnly = false,
  userKeyResultItems = [],
}: CreatePlansModalProps) {
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetAllUsers();
  const { planningFilterDepartment } = PlanningAndReportingStore();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();
  const { mutateAsync: createTask, isLoading: isCreating } =
    useCreatePlanTasks();
  const appendTask = useUserPlanRepositoryMock((s) => s.appendTask);
  const setTaskDatesBulk = usePlanTaskDatesStore((s) => s.setTaskDatesBulk);
  const mockEnabled = isDeadlinePlanningMockEnabled();

  const [rows, setRows] = useState<PlanDraftBundle[]>(() => [
    { line: createEmptyDraftLine(), subtasks: [] },
  ]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [planAudience, setPlanAudience] = useState<PlanAudience>('self');

  const wrapLine = useCallback(
    (line: DraftLine): PlanDraftBundle => ({ line, subtasks: [] }),
    [],
  );

  const assigneeOptions = useMemo(() => {
    if (!userId) return [] as AssigneeChip[];
    return buildPlanTaskAssigneePickerRoster(
      employeeData,
      String(userId),
      planningFilterDepartment,
      mockEnabled,
    );
  }, [userId, employeeData, planningFilterDepartment, mockEnabled]);

  const canDelegate = assigneeOptions.some((chip) => !chip.isSelf);
  const showAssigneePicker =
    delegateOnly || lockAssignee || assigneeOptions.length > 0;

  const cadenceAssignments = useMemo(
    () =>
      cadenceAssignmentByKind(
        defaultPlanningPeriods?.items,
        Array.isArray(planningPeriods) ? planningPeriods : [],
      ),
    [defaultPlanningPeriods?.items, planningPeriods],
  );

  const selectableTargets = useMemo(
    () => selectablePlanningTargets(planningTargets),
    [planningTargets],
  );

  const targetOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [
      { value: NO_KEY_RESULT_VALUE, label: 'No key result' },
    ];
    for (const t of selectableTargets) {
      if (t.milestoneId) {
        options.push({
          value: `ms:${t.keyResultId}:${t.milestoneId}`,
          label: `${t.keyResultTitle} · ${t.milestoneTitle || 'Milestone'}`,
        });
      } else {
        options.push({
          value: `kr:${t.keyResultId}`,
          label: t.keyResultTitle,
        });
      }
    }
    return options;
  }, [selectableTargets]);

  const buildInitialRow = useCallback((): PlanDraftBundle => {
    if (lockAssignee && prefilledAssigneeUserId) {
      return wrapLine(createDelegatedDraftLine(prefilledAssigneeUserId));
    }
    if (delegateOnly || planAudience === 'delegate') {
      return wrapLine({
        ...createEmptyDraftLine(),
        assigneeMode: 'self',
        delegateUserId: userId ? String(userId) : null,
      });
    }
    return wrapLine(createEmptyDraftLine());
  }, [
    lockAssignee,
    prefilledAssigneeUserId,
    planAudience,
    delegateOnly,
    userId,
    wrapLine,
  ]);

  const resolveAssigneeLabel = useCallback(
    (line: DraftLine) => {
      if (lockAssignee && prefilledAssigneeLabel) return prefilledAssigneeLabel;
      if (!line.delegateUserId) return undefined;
      return (
        assigneeOptions.find((chip) => chip.userId === line.delegateUserId)
          ?.label ?? undefined
      );
    },
    [assigneeOptions, lockAssignee, prefilledAssigneeLabel],
  );

  useEffect(() => {
    if (!open) {
      setPlanAudience('self');
      setExpandedRowId(null);
      return;
    }
    setSubmitting(false);
    if (lockAssignee && prefilledAssigneeUserId) {
      setPlanAudience('delegate');
      const initial = wrapLine(
        createDelegatedDraftLine(prefilledAssigneeUserId),
      );
      setRows([initial]);
      setExpandedRowId(initial.line.id);
      return;
    }
    if (delegateOnly) {
      setPlanAudience('delegate');
      const initial = wrapLine({
        ...createEmptyDraftLine(),
        assigneeMode: 'self',
        delegateUserId: userId ? String(userId) : null,
      });
      setRows([initial]);
      setExpandedRowId(initial.line.id);
      return;
    }
    setPlanAudience('self');
    const initial = wrapLine(createEmptyDraftLine());
    setRows([initial]);
    setExpandedRowId(initial.line.id);
  }, [
    open,
    lockAssignee,
    prefilledAssigneeUserId,
    delegateOnly,
    userId,
    wrapLine,
  ]);

  const handleAudienceChange = (next: PlanAudience) => {
    setPlanAudience(next);
    setRows((prev) =>
      prev.map((bundle) => {
        if (next === 'self') {
          return {
            ...bundle,
            line: {
              ...bundle.line,
              assigneeMode: 'self',
              delegateUserId: null,
            },
          };
        }
        return {
          ...bundle,
          line: {
            ...applyTargetToDraftLine(bundle.line, null),
            assigneeMode: 'delegate',
            delegateUserId: bundle.line.delegateUserId ?? null,
          },
        };
      }),
    );
  };

  const updateRow = useCallback((id: string, next: DraftLine) => {
    setRows((prev) =>
      prev.map((bundle) =>
        bundle.line.id === id ? { ...bundle, line: next } : bundle,
      ),
    );
  }, []);

  const updateRowSubtasks = useCallback(
    (id: string, subtasks: DraftSubtask[]) => {
      setRows((prev) =>
        prev.map((bundle) =>
          bundle.line.id === id ? { ...bundle, subtasks } : bundle,
        ),
      );
    },
    [],
  );

  const updateRowTarget = useCallback(
    (id: string, selectValue: string) => {
      setRows((prev) =>
        prev.map((bundle) => {
          if (bundle.line.id !== id) return bundle;
          const target = findTargetBySelectValue(
            selectValue,
            selectableTargets,
          );
          return {
            ...bundle,
            line: applyTargetToDraftLine(bundle.line, target),
          };
        }),
      );
    },
    [selectableTargets],
  );

  const addRow = () => {
    const next = buildInitialRow();
    setRows((prev) => [...prev, next]);
    setExpandedRowId(next.line.id);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((bundle) => bundle.line.id !== id);
      setExpandedRowId((current) => {
        if (current !== id) return current;
        return next[next.length - 1]?.line.id ?? null;
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    const lines = rows.map((bundle) => bundle.line);
    const error = validateDraftLinesForCreate(lines);
    if (error) {
      message.warning(error);
      return;
    }

    for (const bundle of rows) {
      const subError = validateDraftSubtasksForCreate(bundle.subtasks);
      if (subError) {
        message.warning(subError);
        return;
      }
    }

    for (const bundle of rows) {
      if (!bundle.line.delegateUserId && showAssigneePicker) {
        message.warning('Choose an assignee for each task.');
        return;
      }
    }

    const preparedRows = rows.map((bundle) => {
      const row = bundle.line;
      const delegated = isDraftLineDelegated(row, userId);
      const targetUserId = delegated
        ? String(row.delegateUserId)
        : String(userId);
      return {
        line: delegated ? applyTargetToDraftLine(row, null) : row,
        subtasks: bundle.subtasks,
        targetUserId,
        assignedByUserId: delegated && userId ? String(userId) : undefined,
      };
    });

    setSubmitting(true);
    try {
      let createdCount = 0;
      let delegatedCount = 0;
      const delegateTargets = new Set<string>();

      if (mockEnabled) {
        for (const item of preparedRows) {
          const grouped = groupLinesByDeadlineCadence(
            [item.line],
            cadenceAssignments,
          );
          if (!grouped.ok) {
            message.warning(grouped.error);
            return;
          }
          for (const group of grouped.groups) {
            for (const line of group.lines) {
              const description = line.description?.trim();
              const result = appendTask(item.targetUserId, {
                title: line.task,
                start: line.start,
                deadline: line.deadline,
                ...(description ? { description } : {}),
                keyResultId: item.assignedByUserId
                  ? UNLINKED_KR_ID
                  : line.keyResultId || UNLINKED_KR_ID,
                priority: line.priority,
                parentId: line.parentTaskId,
                assignedByUserId: item.assignedByUserId,
              });
              if (!result.ok) {
                message.warning(result.error);
                return;
              }
              createdCount += 1;
              if (item.assignedByUserId) {
                delegatedCount += 1;
                delegateTargets.add(item.targetUserId);
              }

              const parentTask = result.task;
              const subCtx = inferSubtaskContext(line);
              if (subCtx.canAddSubtasks && item.subtasks.length > 0) {
                const validationParent = {
                  ...parentTask,
                  kind: resolveHierarchyParentKind(parentTask),
                };
                for (const sub of item.subtasks) {
                  if (subCtx.childKind === 'daily') {
                    const valid = validateDailySubtask(
                      validationParent,
                      sub.start,
                    );
                    if (!valid.ok) {
                      message.warning(valid.error);
                      return;
                    }
                  } else {
                    const valid = validateWeeklySubtask(
                      validationParent,
                      sub.start,
                      sub.deadline,
                    );
                    if (!valid.ok) {
                      message.warning(valid.error);
                      return;
                    }
                  }
                  const subDescription = sub.description?.trim();
                  const subResult = appendTask(item.targetUserId, {
                    title: sub.task,
                    start: sub.start,
                    deadline:
                      subCtx.childKind === 'daily' ? sub.start : sub.deadline,
                    ...(subDescription ? { description: subDescription } : {}),
                    priority: line.priority,
                    parentId: parentTask.id,
                    assignedByUserId: item.assignedByUserId,
                  });
                  if (!subResult.ok) {
                    message.warning(subResult.error);
                    return;
                  }
                  createdCount += 1;
                  if (item.assignedByUserId) {
                    delegatedCount += 1;
                    delegateTargets.add(item.targetUserId);
                  }
                }
              }
            }
          }
        }
      } else {
        const overlayEntries: Record<
          string,
          { start: string; deadline: string }
        > = {};
        for (const item of preparedRows) {
          const grouped = groupLinesByDeadlineCadence(
            [item.line],
            cadenceAssignments,
          );
          if (!grouped.ok) {
            message.warning(grouped.error);
            return;
          }
          for (const group of grouped.groups) {
            const tasks = draftLinesToCreatePayloads(
              item.targetUserId,
              group,
              item.assignedByUserId,
            );
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
            createdCount += group.lines.length;
            if (item.assignedByUserId) {
              delegatedCount += group.lines.length;
              delegateTargets.add(item.targetUserId);
            }
          }
        }
        setTaskDatesBulk(overlayEntries);
      }

      if (delegatedCount > 0 && delegatedCount === createdCount) {
        message.success(
          createdCount === 1
            ? 'Plan delegated.'
            : `${createdCount} plans delegated.`,
        );
      } else if (delegatedCount > 0) {
        message.success(
          `${createdCount} plans created (${delegatedCount} delegated).`,
        );
      } else {
        message.success(
          createdCount === 1
            ? 'Plan created.'
            : `${createdCount} plans created.`,
        );
      }

      onSuccess?.(
        delegateTargets.size === 1 ? [...delegateTargets][0] : undefined,
      );
      onClose();
    } catch {
      /* mutation hook surfaces the error */
    } finally {
      setSubmitting(false);
    }
  };

  const loading = submitting || isCreating;
  const modalTitle =
    lockAssignee && prefilledAssigneeLabel
      ? `Add task for ${prefilledAssigneeLabel}`
      : 'Add task';
  const modalSubtitle =
    lockAssignee && prefilledAssigneeLabel
      ? `Tasks for ${prefilledAssigneeLabel} are added directly to their locked plan.`
      : null;
  return (
    <Modal
      title={
        <div
          data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-552"
          className="pr-6"
        >
          <p
            data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-p-553"
            className="m-0 text-[16px] font-semibold leading-tight text-[#161A2C]"
          >
            {modalTitle}
          </p>
          {modalSubtitle ? (
            <p
              data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-p-556"
              className="m-0 mt-1 text-[12px] font-normal leading-snug text-[#8F94A3]"
            >
              {modalSubtitle}
            </p>
          ) : null}
        </div>
      }
      open={open}
      onCancel={onClose}
      destroyOnClose
      width={640}
      centered
      data-cy="create-plans-modal"
      classNames={{
        body: '!pt-3',
        footer: '!border-t !border-[#F1F2F6]',
      }}
      footer={
        <div
          data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-572"
          className="flex items-center justify-end gap-2"
        >
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={addRow}
            disabled={loading}
            data-cy="create-plans-add-row"
            className={footerAddActionLinkButtonClass}
          >
            Add plan
          </Button>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => void handleSubmit()}
            data-cy="create-plans-submit"
            className="!border-[#1E40AF] !bg-[#1E40AF] hover:!bg-[#1E3A8A]"
          >
            Submit
          </Button>
        </div>
      }
    >
      <div
        data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-588"
        className="max-h-[min(62vh,32rem)] space-y-3 overflow-y-auto pr-1 scrollbar-hide"
      >
        {canDelegate &&
        !lockAssignee &&
        !delegateOnly &&
        !showAssigneePicker ? (
          <div
            data-cy="create-plans-audience-row"
            className="flex min-w-0 items-center justify-start"
          >
            <ConfigProvider
              theme={{
                token: { colorPrimary: '#1E40AF' },
                components: {
                  Radio: {
                    colorPrimary: '#1E40AF',
                    dotSize: 8,
                    radioSize: 16,
                  },
                },
              }}
            >
              <Radio.Group
                value={planAudience}
                onChange={(e: RadioChangeEvent) =>
                  handleAudienceChange(e.target.value as PlanAudience)
                }
                className={createPlansAudienceRadioGroupClass}
                data-cy="create-plans-audience-radio"
              >
                <Radio value="self" data-cy="create-plans-audience-self">
                  Self
                </Radio>
                <Radio
                  value="delegate"
                  data-cy="create-plans-audience-delegate"
                >
                  Delegate
                </Radio>
              </Radio.Group>
            </ConfigProvider>
          </div>
        ) : null}
        {rows.map((bundle, index) => {
          const isExpanded =
            rows.length === 1 || expandedRowId === bundle.line.id;
          const isSelfAssignee = !isDraftLineDelegated(bundle.line, userId);

          if (!isExpanded) {
            return (
              <CollapsedPlanRow
                key={bundle.line.id}
                line={bundle.line}
                index={index}
                subtaskCount={bundle.subtasks.length}
                delegateMode={showAssigneePicker && !isSelfAssignee}
                assigneeLabel={resolveAssigneeLabel(bundle.line)}
                canRemove={rows.length > 1}
                onExpand={() => setExpandedRowId(bundle.line.id)}
                onRemove={() => removeRow(bundle.line.id)}
              />
            );
          }

          return (
            <PlanRowEditor
              key={bundle.line.id}
              line={bundle.line}
              index={index}
              canRemove={rows.length > 1}
              showAssigneePicker={showAssigneePicker}
              isSelfAssignee={isSelfAssignee}
              viewerUserId={userId ? String(userId) : undefined}
              lockAssignee={lockAssignee}
              lockedAssigneeLabel={prefilledAssigneeLabel}
              assigneeOptions={assigneeOptions}
              targetOptions={targetOptions}
              userKeyResultItems={userKeyResultItems}
              subtasks={bundle.subtasks}
              onSubtasksChange={(next) =>
                updateRowSubtasks(bundle.line.id, next)
              }
              onChange={(next) => updateRow(bundle.line.id, next)}
              onTargetSelect={(value) => updateRowTarget(bundle.line.id, value)}
              onRemove={() => removeRow(bundle.line.id)}
              onCollapse={
                rows.length > 1
                  ? () =>
                      setExpandedRowId((current) =>
                        current === bundle.line.id ? null : current,
                      )
                  : undefined
              }
            />
          );
        })}
      </div>
    </Modal>
  );
}
