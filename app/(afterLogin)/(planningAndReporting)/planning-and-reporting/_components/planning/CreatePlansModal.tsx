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
  Collapse,
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
  validateDraftBundlesForCreate,
  validateDraftLineField,
  validateDraftSubtaskField,
  type DraftFieldKey,
  type DraftLine,
  type DraftSubtask,
  type DraftValidationError,
} from './planDraft';

type PlanDraftBundle = {
  line: DraftLine;
  subtasks: DraftSubtask[];
};

const inlineErrorClass = 'mt-1 block text-[12px] text-red-500';

function validationFocusAttr(
  rowId: string,
  field: DraftFieldKey,
  subtaskId?: string,
): { 'data-validation-focus': string } {
  return {
    'data-validation-focus': `${rowId}:${field}:${subtaskId ?? ''}`,
  };
}

function matchesValidationError(
  error: DraftValidationError,
  rowId: string,
  field: DraftFieldKey,
  subtaskId?: string,
): boolean {
  return (
    error.rowId === rowId &&
    error.field === field &&
    (subtaskId ? error.subtaskId === subtaskId : !error.subtaskId)
  );
}

function collectSubtaskDateValidationErrors(
  bundles: PlanDraftBundle[],
): DraftValidationError[] {
  const errors: DraftValidationError[] = [];

  for (const bundle of bundles) {
    const subCtx = inferSubtaskContext(bundle.line);
    if (!subCtx.canAddSubtasks || bundle.subtasks.length === 0) continue;

    const built = buildParentTask({
      id: 'draft',
      title: bundle.line.task || 'Task',
      start: bundle.line.start,
      deadline: bundle.line.deadline,
    });
    if (!built.ok) continue;

    const validationParent = {
      ...built.task,
      kind: resolveHierarchyParentKind(built.task),
    };

    for (const sub of bundle.subtasks) {
      const valid =
        subCtx.childKind === 'daily'
          ? validateDailySubtask(validationParent, sub.start)
          : validateWeeklySubtask(validationParent, sub.start, sub.deadline);
      if (!valid.ok) {
        errors.push({
          rowId: bundle.line.id,
          subtaskId: sub.id,
          field:
            subCtx.childKind === 'daily' ? 'subtask.start' : 'subtask.deadline',
          message: valid.error,
        });
      }
    }
  }

  return errors;
}

function subtaskHasValidationError(
  rowId: string,
  subtaskId: string,
  validationErrors: DraftValidationError[],
): boolean {
  return validationErrors.some(
    (error) => error.rowId === rowId && error.subtaskId === subtaskId,
  );
}

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

const fieldLabelClass =
  'mb-1 block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#8F94A3]';

const controlClass =
  'w-full !rounded-lg [&_.ant-select-selector]:!rounded-lg [&_.ant-picker]:!rounded-lg';

const addActionLinkButtonClass =
  '!h-auto w-full !justify-start !border-0 !bg-transparent !px-0 !py-0 !shadow-none !text-[13px] !font-semibold !text-[#574CFF] hover:!bg-transparent hover:!text-[#4639E8]';

const taskRowCollapseClass =
  '!bg-transparent [&_.ant-collapse-item]:!mb-3 [&_.ant-collapse-item]:!overflow-hidden [&_.ant-collapse-item]:!rounded-xl [&_.ant-collapse-item]:!border [&_.ant-collapse-item]:!border-[#F1F2F6] [&_.ant-collapse-item]:!bg-white [&_.ant-collapse-item]:!shadow-[0_1px_2px_rgba(22,26,44,0.04)] hover:[&_.ant-collapse-item]:!border-[#E0E7FF] [&_.ant-collapse-header]:!items-start [&_.ant-collapse-header]:!px-3 [&_.ant-collapse-header]:!py-3 sm:[&_.ant-collapse-header]:!px-3.5 [&_.ant-collapse-content-box]:!px-3 [&_.ant-collapse-content-box]:!pb-3 sm:[&_.ant-collapse-content-box]:!px-3.5 sm:[&_.ant-collapse-content-box]:!pb-3.5';

function planningTargetFieldLabel(
  metricTypeName: string | null | undefined,
): string {
  if (!metricTypeName) return 'Target';
  if (metricTypeName === 'KPI') return 'KPI target';
  if (metricTypeName === 'Percentage' || metricTypeName === 'Percent') {
    return 'Target (%)';
  }
  if (metricTypeName === 'Currency') return 'Target amount';
  if (metricTypeName === 'Numeric') return 'Target value';
  return `Target (${metricTypeName})`;
}

function buildKeyResultSelectOptions(
  targets: PlanningTarget[],
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [
    { value: NO_KEY_RESULT_VALUE, label: 'No key result' },
  ];
  const seen = new Set<string>();
  for (const t of targets) {
    if (t.isDailySlot) continue;
    const id = String(t.keyResultId);
    if (seen.has(id)) continue;
    seen.add(id);
    options.push({ value: `kr:${id}`, label: t.keyResultTitle });
  }
  return options;
}

function milestoneOptionsForKeyResult(
  targets: PlanningTarget[],
  keyResultId: string,
): { value: string; label: string }[] {
  return targets
    .filter(
      (t) =>
        String(t.keyResultId) === String(keyResultId) &&
        !!t.milestoneId &&
        !t.isDailySlot,
    )
    .map((t) => ({
      value: String(t.milestoneId),
      label: t.milestoneTitle || 'Milestone',
    }));
}

function keyResultSelectValue(line: DraftLine): string {
  if (!line.keyResultId || line.keyResultId === UNLINKED_KR_ID) {
    return NO_KEY_RESULT_VALUE;
  }
  return `kr:${line.keyResultId}`;
}

function findPlanningTargetForApply(
  targets: PlanningTarget[],
  keyResultId: string,
  milestoneId?: string | null,
): PlanningTarget | null {
  if (milestoneId) {
    return (
      targets.find(
        (t) =>
          String(t.keyResultId) === String(keyResultId) &&
          String(t.milestoneId) === String(milestoneId),
      ) ?? null
    );
  }
  const krLevel =
    targets.find(
      (t) =>
        String(t.keyResultId) === String(keyResultId) &&
        !t.milestoneId &&
        !t.isDailySlot,
    ) ??
    targets.find(
      (t) => String(t.keyResultId) === String(keyResultId) && !t.isDailySlot,
    );
  if (!krLevel) return null;
  return { ...krLevel, milestoneId: null, milestoneTitle: null };
}

const createPlansAudienceRadioGroupClass =
  'create-plans-audience-radio !flex !shrink-0 !items-center !justify-start !gap-2 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:!inline-flex [&_.ant-radio-wrapper]:!h-9 [&_.ant-radio-wrapper]:!items-center [&_.ant-radio-wrapper]:!gap-2 [&_.ant-radio-wrapper]:!rounded-lg [&_.ant-radio-wrapper]:!border [&_.ant-radio-wrapper]:!border-[#D9D9D9] [&_.ant-radio-wrapper]:!bg-white [&_.ant-radio-wrapper]:!px-3 [&_.ant-radio-wrapper]:!text-[13px] [&_.ant-radio-wrapper]:!font-medium [&_.ant-radio-wrapper]:!text-[#575B7A] [&_.ant-radio-wrapper]:!shadow-none [&_.ant-radio-wrapper]:after:!content-none [&_.ant-radio-wrapper:hover]:!border-[#1E40AF] [&_.ant-radio-wrapper-checked]:!border-[#1E40AF] [&_.ant-radio-wrapper-checked]:!text-[#2D2F45] [&_.ant-radio]:!top-0 [&_.ant-radio]:!shrink-0 [&_.ant-radio-inner]:!h-4 [&_.ant-radio-inner]:!w-4 [&_.ant-radio-inner]:!border-[#D9D9D9] [&_.ant-radio-inner]:!bg-white [&_.ant-radio-checked_.ant-radio-inner]:!border-[#1E40AF] [&_.ant-radio-checked_.ant-radio-inner]:!bg-[#1E40AF] [&_.ant-radio-checked_.ant-radio-inner::after]:!scale-[0.375] [&_.ant-radio-checked_.ant-radio-inner::after]:!bg-white [&_.ant-radio-checked_.ant-radio-inner::after]:!opacity-100';

type PlanAudience = 'self' | 'delegate';

function FieldError({
  message,
  dataCy,
}: {
  message?: string;
  dataCy: string;
}): ReactElement | null {
  if (!message) return null;
  return (
    <span data-cy={dataCy} className={inlineErrorClass} role="alert">
      {message}
    </span>
  );
}

function FieldShell({
  label,
  children,
  className = '',
  error,
  errorDataCy,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  error?: string;
  errorDataCy?: string;
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
      {errorDataCy ? <FieldError message={error} dataCy={errorDataCy} /> : null}
    </label>
  );
}

function PlanRowCollapseHeader({
  line,
  index,
  subtaskCount,
  delegateMode,
  assigneeLabel,
  canRemove,
  onRemove,
}: {
  line: DraftLine;
  index: number;
  subtaskCount: number;
  delegateMode: boolean;
  assigneeLabel?: string;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const title = line.task.trim() || 'Untitled task';

  return (
    <div
      className="flex w-full items-start gap-2.5 pr-1"
      data-cy={`create-plan-row-collapsed-${index}`}
    >
      <span
        className="mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-[#F1F2F6] px-1.5 text-[11px] font-bold tabular-nums text-[#575B7A]"
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
          {subtaskCount > 0 ? (
            <span
              className="inline-flex shrink-0 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#4338CA]"
              data-cy={`create-plan-row-collapsed-subtask-count-${index}`}
            >
              {subtaskCount} subtask{subtaskCount === 1 ? '' : 's'}
            </span>
          ) : null}
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] opacity-70 transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:opacity-100"
          aria-label={`Remove task ${index + 1}`}
          data-cy={`create-plan-row-remove-${index}`}
        >
          <CloseOutlined className="text-[12px]" />
        </button>
      ) : null}
    </div>
  );
}

function PlanTaskRowCollapse({
  bundle,
  index,
  isExpanded,
  delegateMode,
  assigneeLabel,
  canRemove,
  onExpandedChange,
  onRemove,
  children,
}: {
  bundle: PlanDraftBundle;
  index: number;
  isExpanded: boolean;
  delegateMode: boolean;
  assigneeLabel?: string;
  canRemove: boolean;
  onExpandedChange: (rowId: string | null) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <Collapse
      bordered={false}
      activeKey={isExpanded ? [bundle.line.id] : []}
      onChange={(keys) => {
        const keyList = Array.isArray(keys) ? keys : keys ? [keys] : [];
        const open = keyList.includes(bundle.line.id);
        onExpandedChange(open ? bundle.line.id : null);
      }}
      expandIcon={({ isActive }) =>
        isActive ? (
          <DownOutlined className="text-[10px] text-[#575B7A]" />
        ) : (
          <RightOutlined className="text-[10px] text-[#94A3B8]" />
        )
      }
      className={taskRowCollapseClass}
      data-cy={`create-plan-row-collapse-wrap-${index}`}
    >
      <Collapse.Panel
        key={bundle.line.id}
        header={
          <PlanRowCollapseHeader
            line={bundle.line}
            index={index}
            subtaskCount={bundle.subtasks.length}
            delegateMode={delegateMode}
            assigneeLabel={assigneeLabel}
            canRemove={canRemove}
            onRemove={onRemove}
          />
        }
      >
        {children}
      </Collapse.Panel>
    </Collapse>
  );
}

const subtaskAccordionClass =
  '!bg-transparent [&_.ant-collapse-item]:!mb-2 [&_.ant-collapse-item]:!overflow-hidden [&_.ant-collapse-item]:!rounded-xl [&_.ant-collapse-item]:!border [&_.ant-collapse-item]:!border-[#F1F2F6] [&_.ant-collapse-item]:!bg-[#FAFBFC] [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!px-3 [&_.ant-collapse-header]:!py-2.5 [&_.ant-collapse-content-box]:!px-3 [&_.ant-collapse-content-box]:!pb-3';

function PlanRowSubtasksEditor({
  rowId,
  line,
  subtasks,
  onChange,
  validationErrors,
  getFieldError,
  onSubtaskFieldBlur,
  onClearFieldError,
  expandedSubtaskId,
  onExpandedSubtaskChange,
  subtasksSectionExpanded,
  onSubtasksSectionExpandedChange,
}: {
  rowId: string;
  line: DraftLine;
  subtasks: DraftSubtask[];
  onChange: (next: DraftSubtask[]) => void;
  validationErrors: DraftValidationError[];
  getFieldError: (
    field: DraftFieldKey,
    subtaskId: string,
  ) => string | undefined;
  onSubtaskFieldBlur: (subtaskId: string, field: DraftFieldKey) => void;
  onClearFieldError: (field: DraftFieldKey, subtaskId: string) => void;
  expandedSubtaskId: string | null;
  onExpandedSubtaskChange: (subtaskId: string | null) => void;
  subtasksSectionExpanded: boolean;
  onSubtasksSectionExpandedChange: (expanded: boolean) => void;
}) {
  const ctx = inferSubtaskContext(line);

  if (!ctx.canAddSubtasks) {
    return null;
  }

  const { childKind } = ctx;
  const label = childKindLabel(childKind);

  const updateSubtask = (id: string, patch: Partial<DraftSubtask>) => {
    onChange(
      subtasks.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
    );
  };

  const addSubtask = () => {
    const newSub = createEmptyDraftSubtask(
      line.start,
      line.deadline,
      childKind,
    );
    onChange([...subtasks, newSub]);
    onSubtasksSectionExpandedChange(true);
    onExpandedSubtaskChange(newSub.id);
  };

  const removeSubtask = (id: string) => {
    const next = subtasks.filter((sub) => sub.id !== id);
    onChange(next);
    if (expandedSubtaskId === id) {
      onExpandedSubtaskChange(next[next.length - 1]?.id ?? null);
    }
  };

  const subtaskAccordion = (
    <Collapse
      accordion
      bordered={false}
      activeKey={expandedSubtaskId ?? undefined}
      onChange={(key) => {
        const nextKey = Array.isArray(key) ? key[0] : key;
        onExpandedSubtaskChange(typeof nextKey === 'string' ? nextKey : null);
      }}
      expandIcon={({ isActive }) =>
        isActive ? (
          <DownOutlined className="text-[10px] text-[#575B7A]" />
        ) : (
          <RightOutlined className="text-[10px] text-[#94A3B8]" />
        )
      }
      className={subtaskAccordionClass}
      data-cy="create-plan-subtasks-list"
    >
      {subtasks.map((sub, subIndex) => {
        const summary = sub.task.trim() || `Subtask ${subIndex + 1}`;
        const titleError = getFieldError('subtask.task', sub.id);
        const startError = getFieldError('subtask.start', sub.id);
        const deadlineError = getFieldError('subtask.deadline', sub.id);
        const hasError = subtaskHasValidationError(
          rowId,
          sub.id,
          validationErrors,
        );

        return (
          <Collapse.Panel
            key={sub.id}
            header={
              <div
                className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-1"
                data-cy={`create-plan-subtask-header-${subIndex}`}
                aria-invalid={hasError}
              >
                <span
                  className="flex min-w-0 items-center gap-1.5 truncate text-[13px] font-semibold text-[#161A2C]"
                  data-cy={`create-plan-subtask-summary-${subIndex}`}
                >
                  {hasError ? (
                    <span
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
                      aria-hidden
                      data-cy={`create-plan-subtask-error-indicator-${subIndex}`}
                    />
                  ) : null}
                  {summary}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSubtask(sub.id);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  aria-label="Remove subtask"
                  data-cy={`create-plan-subtask-remove-${subIndex}`}
                >
                  <CloseOutlined className="text-[12px]" />
                </button>
              </div>
            }
            data-cy={`create-plan-subtask-row-${subIndex}`}
          >
            <Input
              placeholder={`${label} subtask title`}
              value={sub.task}
              status={titleError ? 'error' : undefined}
              onChange={(e) => {
                onClearFieldError('subtask.task', sub.id);
                updateSubtask(sub.id, { task: e.target.value });
              }}
              onBlur={() => onSubtaskFieldBlur(sub.id, 'subtask.task')}
              className="!rounded-lg"
              data-cy={`create-plan-subtask-title-${subIndex}`}
              {...validationFocusAttr(rowId, 'subtask.task', sub.id)}
            />
            <FieldError
              message={titleError}
              dataCy={`create-plan-subtask-error-${subIndex}-task`}
            />
            <div
              className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
              data-cy={`create-plan-subtask-dates-${subIndex}`}
            >
              <div data-cy={`create-plan-subtask-start-wrap-${subIndex}`}>
                <DatePicker
                  className="w-full !rounded-lg [&_.ant-picker-input>input]:!text-[13px]"
                  status={startError ? 'error' : undefined}
                  value={sub.start ? dayjs(sub.start) : null}
                  onChange={(value) => {
                    onClearFieldError('subtask.start', sub.id);
                    const iso = value ? formatDate(value) : sub.start;
                    if (childKind === 'daily') {
                      updateSubtask(sub.id, { start: iso, deadline: iso });
                    } else {
                      updateSubtask(sub.id, { start: iso });
                    }
                  }}
                  onBlur={() => onSubtaskFieldBlur(sub.id, 'subtask.start')}
                  allowClear={false}
                  placeholder="Start"
                  data-cy={`create-plan-subtask-start-${subIndex}`}
                  {...validationFocusAttr(rowId, 'subtask.start', sub.id)}
                />
                <FieldError
                  message={startError}
                  dataCy={`create-plan-subtask-error-${subIndex}-start`}
                />
              </div>
              {childKind !== 'daily' ? (
                <div data-cy={`create-plan-subtask-deadline-wrap-${subIndex}`}>
                  <DatePicker
                    className="w-full !rounded-lg [&_.ant-picker-input>input]:!text-[13px]"
                    status={deadlineError ? 'error' : undefined}
                    value={sub.deadline ? dayjs(sub.deadline) : null}
                    onChange={(value) => {
                      onClearFieldError('subtask.deadline', sub.id);
                      const iso = value ? formatDate(value) : sub.deadline;
                      updateSubtask(sub.id, { deadline: iso });
                    }}
                    onBlur={() =>
                      onSubtaskFieldBlur(sub.id, 'subtask.deadline')
                    }
                    allowClear={false}
                    placeholder="End"
                    data-cy={`create-plan-subtask-deadline-${subIndex}`}
                    {...validationFocusAttr(rowId, 'subtask.deadline', sub.id)}
                  />
                  <FieldError
                    message={deadlineError}
                    dataCy={`create-plan-subtask-error-${subIndex}-deadline`}
                  />
                </div>
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
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );

  if (subtasks.length === 0) {
    return (
      <Button
        type="link"
        icon={<PlusOutlined />}
        onClick={addSubtask}
        data-cy="create-plan-subtask-add"
        className={addActionLinkButtonClass}
      >
        Add subtask
      </Button>
    );
  }

  return (
    <Collapse
      bordered={false}
      activeKey={subtasksSectionExpanded ? ['subtasks'] : []}
      onChange={(keys) => {
        const keyList = Array.isArray(keys) ? keys : keys ? [keys] : [];
        onSubtasksSectionExpandedChange(keyList.includes('subtasks'));
      }}
      className="!bg-transparent [&_.ant-collapse-item]:!border-[#F1F2F6] [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
      data-cy="create-plan-subtasks-collapse"
    >
      <Collapse.Panel header={`Subtasks (${subtasks.length})`} key="subtasks">
        {subtaskAccordion}
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={addSubtask}
          data-cy="create-plan-subtask-add-more"
          className={`${addActionLinkButtonClass} mt-2.5`}
        >
          Add subtask
        </Button>
      </Collapse.Panel>
    </Collapse>
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
  showAssigneePicker = false,
  isSelfAssignee = true,
  viewerUserId,
  lockAssignee = false,
  lockedAssigneeLabel,
  assigneeOptions,
  selectableTargets,
  userKeyResultItems = [],
  subtasks,
  validationErrors,
  getFieldError,
  onLineFieldBlur,
  onClearFieldError,
  onSubtaskFieldBlur,
  expandedSubtaskId,
  onExpandedSubtaskChange,
  subtasksSectionExpanded,
  onSubtasksSectionExpandedChange,
  onSubtasksChange,
  onChange,
  onKeyResultSelect,
  onMilestoneSelect,
}: {
  line: DraftLine;
  index: number;
  showAssigneePicker?: boolean;
  isSelfAssignee?: boolean;
  viewerUserId?: string;
  lockAssignee?: boolean;
  lockedAssigneeLabel?: string;
  assigneeOptions: AssigneeChip[];
  selectableTargets: PlanningTarget[];
  userKeyResultItems?: any[];
  subtasks: DraftSubtask[];
  validationErrors: DraftValidationError[];
  getFieldError: (
    field: DraftFieldKey,
    subtaskId?: string,
  ) => string | undefined;
  onLineFieldBlur: (field: DraftFieldKey) => void;
  onClearFieldError: (field: DraftFieldKey, subtaskId?: string) => void;
  onSubtaskFieldBlur: (subtaskId: string, field: DraftFieldKey) => void;
  expandedSubtaskId: string | null;
  onExpandedSubtaskChange: (subtaskId: string | null) => void;
  subtasksSectionExpanded: boolean;
  onSubtasksSectionExpandedChange: (expanded: boolean) => void;
  onSubtasksChange: (next: DraftSubtask[]) => void;
  onChange: (next: DraftLine) => void;
  onKeyResultSelect: (selectValue: string) => void;
  onMilestoneSelect: (milestoneId: string | null) => void;
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

  const keyResultOptions = useMemo(
    () => buildKeyResultSelectOptions(selectableTargets),
    [selectableTargets],
  );
  const milestoneOptions = useMemo(
    () =>
      linked && line.keyResultId
        ? milestoneOptionsForKeyResult(selectableTargets, line.keyResultId)
        : [],
    [selectableTargets, line.keyResultId, linked],
  );
  const showMilestoneField = linked && milestoneOptions.length > 0;

  const start = line.start ? dayjs(line.start) : null;
  const deadline = line.deadline ? dayjs(line.deadline) : null;
  const dateRange =
    start && deadline ? ([start, deadline] as [Dayjs, Dayjs]) : null;

  const setDateRange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (!values?.[0] || !values?.[1]) return;
    const startIso = formatDate(values[0]);
    const endIso = formatDate(values[1]);
    const range = validateRange(startIso, endIso);
    onClearFieldError('start');
    onClearFieldError('deadline');
    onChange({
      ...line,
      start: startIso,
      deadline: range.ok ? endIso : startIso,
    });
  };

  const taskError = getFieldError('task');
  const startError = getFieldError('start');
  const deadlineError = getFieldError('deadline');
  const dateRangeError = startError ?? deadlineError;
  const assigneeError = getFieldError('assignee');

  const handleDateRangeBlur = () => {
    onLineFieldBlur('start');
    onLineFieldBlur('deadline');
  };

  return (
    <div data-cy={`create-plan-row-${index}`}>
      <div
        data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-237"
        className="pt-1"
      >
        <div
          data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-238"
          className="mb-2.5"
        >
          <Input
            variant="borderless"
            placeholder="Task name"
            value={line.task}
            status={taskError ? 'error' : undefined}
            onChange={(e) => {
              onClearFieldError('task');
              onChange({ ...line, task: e.target.value });
            }}
            onBlur={() => onLineFieldBlur('task')}
            className="min-w-0 !px-0 !text-[15px] !font-semibold !leading-snug !text-[#161A2C] placeholder:!font-medium placeholder:!text-[#B0B3C0]"
            data-cy={`create-plan-row-title-${index}`}
            {...validationFocusAttr(line.id, 'task')}
          />
          <FieldError
            message={taskError}
            dataCy={`create-plan-row-error-${index}-task`}
          />
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
              <FieldShell
                label="Assignee"
                error={assigneeError}
                errorDataCy={`create-plan-row-error-${index}-assignee`}
              >
                <Select
                  showSearch
                  placeholder="Choose assignee"
                  status={assigneeError ? 'error' : undefined}
                  value={line.delegateUserId ?? viewerUserId ?? undefined}
                  onChange={(value) => {
                    onClearFieldError('assignee');
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
                  onBlur={() => onLineFieldBlur('assignee')}
                  optionFilterProp="label"
                  className={controlClass}
                  data-cy={`create-plan-row-assignee-select-${index}`}
                  {...validationFocusAttr(line.id, 'assignee')}
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
          <FieldShell
            label="Date range"
            className="sm:col-span-12"
            error={dateRangeError}
            errorDataCy={`create-plan-row-error-${index}-date-range`}
          >
            <div
              tabIndex={-1}
              data-cy={`create-plan-row-date-range-wrap-${index}`}
              {...validationFocusAttr(
                line.id,
                startError ? 'start' : 'deadline',
              )}
            >
              <DatePicker.RangePicker
                className={`${controlClass} !h-9 w-full [&_.ant-picker-input>input]:!text-[13px]`}
                status={dateRangeError ? 'error' : undefined}
                value={dateRange}
                onChange={setDateRange}
                onBlur={handleDateRangeBlur}
                allowClear={false}
                data-cy={`create-plan-row-date-range-${index}`}
              />
            </div>
          </FieldShell>

          {!hideKeyResult ? (
            <>
              <FieldShell
                label="Key result"
                className={
                  showMilestoneField
                    ? showTarget
                      ? 'sm:col-span-6'
                      : 'sm:col-span-6'
                    : showTarget
                      ? 'sm:col-span-9'
                      : 'sm:col-span-12'
                }
              >
                <Select
                  className={`${controlClass} w-full [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!min-h-9 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[13px]`}
                  showSearch
                  optionFilterProp="label"
                  value={keyResultSelectValue(line)}
                  onChange={onKeyResultSelect}
                  options={keyResultOptions}
                  placeholder="Optional link"
                  data-cy={`create-plan-row-kr-${index}`}
                />
              </FieldShell>
              {showMilestoneField ? (
                <FieldShell
                  label="Milestone"
                  className={showTarget ? 'sm:col-span-3' : 'sm:col-span-6'}
                >
                  <Select
                    className={`${controlClass} w-full [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!min-h-9 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-[13px]`}
                    showSearch
                    optionFilterProp="label"
                    value={line.milestoneId ?? undefined}
                    onChange={(value) => onMilestoneSelect(value ?? null)}
                    options={milestoneOptions}
                    placeholder="Select milestone"
                    allowClear
                    data-cy={`create-plan-row-milestone-${index}`}
                  />
                </FieldShell>
              ) : null}
              {showTarget ? (
                <FieldShell
                  label={planningTargetFieldLabel(line.metricTypeName)}
                  className="sm:col-span-3"
                >
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
            rowId={line.id}
            line={line}
            subtasks={subtasks}
            validationErrors={validationErrors}
            getFieldError={(field, subtaskId) =>
              getFieldError(field, subtaskId)
            }
            onSubtaskFieldBlur={onSubtaskFieldBlur}
            onClearFieldError={(field, subtaskId) =>
              onClearFieldError(field, subtaskId)
            }
            expandedSubtaskId={expandedSubtaskId}
            onExpandedSubtaskChange={onExpandedSubtaskChange}
            subtasksSectionExpanded={subtasksSectionExpanded}
            onSubtasksSectionExpandedChange={onSubtasksSectionExpandedChange}
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
  const [validationErrors, setValidationErrors] = useState<
    DraftValidationError[]
  >([]);
  const [expandedSubtaskByRow, setExpandedSubtaskByRow] = useState<
    Record<string, string | null>
  >({});
  const [subtasksSectionExpandedByRow, setSubtasksSectionExpandedByRow] =
    useState<Record<string, boolean>>({});
  const [focusTarget, setFocusTarget] = useState<DraftValidationError | null>(
    null,
  );
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

  const getFieldError = useCallback(
    (rowId: string, field: DraftFieldKey, subtaskId?: string) => {
      return validationErrors.find((error) =>
        matchesValidationError(error, rowId, field, subtaskId),
      )?.message;
    },
    [validationErrors],
  );

  const clearFieldError = useCallback(
    (rowId: string, field: DraftFieldKey, subtaskId?: string) => {
      setValidationErrors((prev) =>
        prev.filter(
          (error) => !matchesValidationError(error, rowId, field, subtaskId),
        ),
      );
    },
    [],
  );

  const handleLineFieldBlur = useCallback(
    (line: DraftLine, field: DraftFieldKey) => {
      const err = validateDraftLineField(line, field, {
        showAssigneePicker,
        lockAssignee,
      });
      setValidationErrors((prev) => {
        const filtered = prev.filter(
          (error) => !matchesValidationError(error, line.id, field),
        );
        return err ? [...filtered, err] : filtered;
      });
    },
    [showAssigneePicker, lockAssignee],
  );

  const handleSubtaskFieldBlur = useCallback(
    (rowId: string, sub: DraftSubtask, field: DraftFieldKey) => {
      const err = validateDraftSubtaskField(sub, rowId, field);
      setValidationErrors((prev) => {
        const filtered = prev.filter(
          (error) => !matchesValidationError(error, rowId, field, sub.id),
        );
        return err ? [...filtered, err] : filtered;
      });
    },
    [],
  );

  const applySubmitValidationErrors = useCallback(
    (errors: DraftValidationError[]) => {
      if (errors.length === 0) return;

      setValidationErrors(errors);
      const first = errors[0];
      if (first.rowId !== '__form__') {
        setExpandedRowId(first.rowId);
        if (first.subtaskId) {
          setSubtasksSectionExpandedByRow((prev) => ({
            ...prev,
            [first.rowId]: true,
          }));
          setExpandedSubtaskByRow((prev) => ({
            ...prev,
            [first.rowId]: first.subtaskId ?? null,
          }));
        }
      }
      setFocusTarget(first);
    },
    [],
  );

  useEffect(() => {
    if (!focusTarget || !open) return;

    const timer = window.setTimeout(() => {
      const selector = `[data-validation-focus="${focusTarget.rowId}:${focusTarget.field}:${focusTarget.subtaskId ?? ''}"]`;
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        el.focus();
      }
      setFocusTarget(null);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [
    focusTarget,
    open,
    expandedRowId,
    expandedSubtaskByRow,
    subtasksSectionExpandedByRow,
  ]);

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
      setValidationErrors([]);
      setExpandedSubtaskByRow({});
      setSubtasksSectionExpandedByRow({});
      setFocusTarget(null);
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

  const updateRowKeyResult = useCallback(
    (id: string, selectValue: string) => {
      setRows((prev) =>
        prev.map((bundle) => {
          if (bundle.line.id !== id) return bundle;
          if (selectValue === NO_KEY_RESULT_VALUE) {
            return {
              ...bundle,
              line: applyTargetToDraftLine(bundle.line, null),
            };
          }
          const krId = selectValue.startsWith('kr:')
            ? selectValue.slice(3)
            : selectValue;
          const target = findPlanningTargetForApply(selectableTargets, krId);
          return {
            ...bundle,
            line: applyTargetToDraftLine(bundle.line, target),
          };
        }),
      );
    },
    [selectableTargets],
  );

  const updateRowMilestone = useCallback(
    (id: string, milestoneId: string | null) => {
      setRows((prev) =>
        prev.map((bundle) => {
          if (bundle.line.id !== id) return bundle;
          const krId = bundle.line.keyResultId;
          if (!krId || krId === UNLINKED_KR_ID) return bundle;
          const target = findPlanningTargetForApply(
            selectableTargets,
            krId,
            milestoneId,
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
    const fieldErrors = validateDraftBundlesForCreate(rows, {
      showAssigneePicker,
      lockAssignee,
    });
    const dateErrors = collectSubtaskDateValidationErrors(rows);
    const allValidationErrors = [...fieldErrors, ...dateErrors];

    if (allValidationErrors.length > 0) {
      applySubmitValidationErrors(allValidationErrors);
      return;
    }

    setValidationErrors([]);

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
                for (const sub of item.subtasks) {
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
          className="flex w-full items-center justify-end gap-2"
        >
          <Button
            icon={<PlusOutlined />}
            onClick={addRow}
            disabled={loading}
            data-cy="create-plans-add-row"
          >
            Add plan
          </Button>
          <Button
            onClick={onClose}
            disabled={loading}
            data-cy="create-plans-cancel"
          >
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
          const isExpanded = expandedRowId === bundle.line.id;
          const isSelfAssignee = !isDraftLineDelegated(bundle.line, userId);

          return (
            <PlanTaskRowCollapse
              key={bundle.line.id}
              bundle={bundle}
              index={index}
              isExpanded={isExpanded}
              delegateMode={showAssigneePicker && !isSelfAssignee}
              assigneeLabel={resolveAssigneeLabel(bundle.line)}
              canRemove={rows.length > 1}
              onExpandedChange={(rowId) => setExpandedRowId(rowId)}
              onRemove={() => removeRow(bundle.line.id)}
            >
              <PlanRowEditor
                line={bundle.line}
                index={index}
                showAssigneePicker={showAssigneePicker}
                isSelfAssignee={isSelfAssignee}
                viewerUserId={userId ? String(userId) : undefined}
                lockAssignee={lockAssignee}
                lockedAssigneeLabel={prefilledAssigneeLabel}
                assigneeOptions={assigneeOptions}
                selectableTargets={selectableTargets}
                userKeyResultItems={userKeyResultItems}
                subtasks={bundle.subtasks}
                validationErrors={validationErrors}
                getFieldError={(field, subtaskId) =>
                  getFieldError(bundle.line.id, field, subtaskId)
                }
                onLineFieldBlur={(field) =>
                  handleLineFieldBlur(bundle.line, field)
                }
                onClearFieldError={(field, subtaskId) =>
                  clearFieldError(bundle.line.id, field, subtaskId)
                }
                onSubtaskFieldBlur={(subtaskId, field) => {
                  const sub = bundle.subtasks.find((s) => s.id === subtaskId);
                  if (sub) {
                    handleSubtaskFieldBlur(bundle.line.id, sub, field);
                  }
                }}
                expandedSubtaskId={expandedSubtaskByRow[bundle.line.id] ?? null}
                onExpandedSubtaskChange={(subtaskId) =>
                  setExpandedSubtaskByRow((prev) => ({
                    ...prev,
                    [bundle.line.id]: subtaskId,
                  }))
                }
                subtasksSectionExpanded={
                  subtasksSectionExpandedByRow[bundle.line.id] ??
                  bundle.subtasks.length > 0
                }
                onSubtasksSectionExpandedChange={(expanded) =>
                  setSubtasksSectionExpandedByRow((prev) => ({
                    ...prev,
                    [bundle.line.id]: expanded,
                  }))
                }
                onSubtasksChange={(next) =>
                  updateRowSubtasks(bundle.line.id, next)
                }
                onChange={(next) => updateRow(bundle.line.id, next)}
                onKeyResultSelect={(value) =>
                  updateRowKeyResult(bundle.line.id, value)
                }
                onMilestoneSelect={(milestoneId) =>
                  updateRowMilestone(bundle.line.id, milestoneId)
                }
              />
            </PlanTaskRowCollapse>
          );
        })}
      </div>
    </Modal>
  );
}
