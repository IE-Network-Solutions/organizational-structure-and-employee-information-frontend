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
  FlagOutlined,
  KeyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  formatDate,
  todayIso,
  validateRange,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
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
  buildSubordinatePickerRoster,
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
  DEFAULT_INLINE_PRIORITY,
  NO_KEY_RESULT_VALUE,
  applyTargetToDraftLine,
  canUseAchieveMK,
  createDelegatedDraftLine,
  createEmptyDraftLine,
  draftLinesToCreatePayloads,
  selectablePlanningTargets,
  shouldShowPlanningTarget,
  validateDraftLinesForCreate,
  type DraftLine,
} from './planDraft';

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

function PlanRowEditor({
  line,
  index,
  canRemove,
  delegateMode = false,
  lockAssignee = false,
  lockedAssigneeLabel,
  assigneeOptions,
  targetOptions,
  onChange,
  onTargetSelect,
  onRemove,
}: {
  line: DraftLine;
  index: number;
  canRemove: boolean;
  delegateMode?: boolean;
  lockAssignee?: boolean;
  lockedAssigneeLabel?: string;
  assigneeOptions: AssigneeChip[];
  targetOptions: { value: string; label: string }[];
  onChange: (next: DraftLine) => void;
  onTargetSelect: (selectValue: string) => void;
  onRemove: () => void;
}) {
  const hideKeyResult = delegateMode;
  const linked =
    !hideKeyResult && !!line.keyResultId && line.keyResultId !== UNLINKED_KR_ID;

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

  const setStart = (value: Dayjs | null) => {
    const iso = value ? formatDate(value) : todayIso();
    const endIso = line.deadline || iso;
    const range = validateRange(iso, endIso);
    onChange({
      ...line,
      start: iso,
      deadline: range.ok ? endIso : iso,
    });
  };

  const setDeadline = (value: Dayjs | null) => {
    const iso = value ? formatDate(value) : line.start || todayIso();
    const startIso = line.start || iso;
    const range = validateRange(startIso, iso);
    onChange({
      ...line,
      start: startIso,
      deadline: range.ok ? iso : startIso,
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

        {delegateMode ? (
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
                  value={line.delegateUserId ?? undefined}
                  onChange={(value) =>
                    onChange({
                      ...line,
                      assigneeMode: 'delegate',
                      delegateUserId: value ?? null,
                    })
                  }
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
          <FieldShell label="Start" className="sm:col-span-4">
            <DatePicker
              className={`${controlClass} !h-9 w-full [&_.ant-picker-input>input]:!text-[13px]`}
              value={start}
              onChange={setStart}
              allowClear={false}
              placeholder="Start"
              data-cy={`create-plan-row-start-${index}`}
            />
          </FieldShell>
          <FieldShell label="Deadline" className="sm:col-span-4">
            <DatePicker
              className={`${controlClass} !h-9 w-full [&_.ant-picker-input>input]:!text-[13px]`}
              value={deadline}
              onChange={setDeadline}
              allowClear={false}
              placeholder="Deadline"
              data-cy={`create-plan-row-deadline-${index}`}
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
                    min={getMetricValueInputMin(null)}
                    max={getMetricValueInputMax(null)}
                    value={line.targetValue || undefined}
                    onChange={(v) =>
                      onChange({
                        ...line,
                        targetValue:
                          v == null ? 0 : Math.max(0, Number(v) || 0),
                      })
                    }
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

  const [rows, setRows] = useState<DraftLine[]>(() => [createEmptyDraftLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [planAudience, setPlanAudience] = useState<PlanAudience>('self');

  const assigneeOptions = useMemo(() => {
    if (!userId) return [] as AssigneeChip[];
    return buildSubordinatePickerRoster(
      employeeData,
      String(userId),
      planningFilterDepartment,
      mockEnabled,
    );
  }, [userId, employeeData, planningFilterDepartment, mockEnabled]);

  const canDelegate = assigneeOptions.length > 0;

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

  const isDelegateMode =
    delegateOnly || lockAssignee || planAudience === 'delegate';

  const buildInitialRow = useCallback(() => {
    if (lockAssignee && prefilledAssigneeUserId) {
      return createDelegatedDraftLine(prefilledAssigneeUserId);
    }
    if (planAudience === 'delegate') {
      return applyTargetToDraftLine(
        {
          ...createEmptyDraftLine(),
          assigneeMode: 'delegate',
          delegateUserId: null,
        },
        null,
      );
    }
    return createEmptyDraftLine();
  }, [lockAssignee, prefilledAssigneeUserId, planAudience]);

  useEffect(() => {
    if (!open) {
      setPlanAudience('self');
      return;
    }
    setSubmitting(false);
    if (lockAssignee && prefilledAssigneeUserId) {
      setPlanAudience('delegate');
      setRows([createDelegatedDraftLine(prefilledAssigneeUserId)]);
      return;
    }
    if (delegateOnly) {
      setPlanAudience('delegate');
      setRows([
        applyTargetToDraftLine(
          {
            ...createEmptyDraftLine(),
            assigneeMode: 'delegate',
            delegateUserId: null,
          },
          null,
        ),
      ]);
      return;
    }
    setPlanAudience('self');
    setRows([createEmptyDraftLine()]);
  }, [open, lockAssignee, prefilledAssigneeUserId, delegateOnly]);

  const handleAudienceChange = (next: PlanAudience) => {
    setPlanAudience(next);
    setRows((prev) =>
      prev.map((row) => {
        if (next === 'self') {
          return { ...row, assigneeMode: 'self', delegateUserId: null };
        }
        return {
          ...applyTargetToDraftLine(row, null),
          assigneeMode: 'delegate',
          delegateUserId: row.delegateUserId ?? null,
        };
      }),
    );
  };

  const updateRow = useCallback((id: string, next: DraftLine) => {
    setRows((prev) => prev.map((row) => (row.id === id ? next : row)));
  }, []);

  const updateRowTarget = useCallback(
    (id: string, selectValue: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          const target = findTargetBySelectValue(
            selectValue,
            selectableTargets,
          );
          return applyTargetToDraftLine(row, target);
        }),
      );
    },
    [selectableTargets],
  );

  const addRow = () => {
    setRows((prev) => [...prev, buildInitialRow()]);
  };

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.id !== id),
    );
  };

  const handleSubmit = async () => {
    const error = validateDraftLinesForCreate(rows);
    if (error) {
      message.warning(error);
      return;
    }

    if (isDelegateMode) {
      for (const row of rows) {
        if (!row.delegateUserId) {
          message.warning('Choose an assignee for each delegated task.');
          return;
        }
      }
    }

    const preparedRows = rows.map((row) => {
      const delegated =
        isDelegateMode &&
        !!row.delegateUserId &&
        String(row.delegateUserId) !== String(userId);
      return {
        line: delegated ? applyTargetToDraftLine(row, null) : row,
        targetUserId: delegated ? String(row.delegateUserId) : String(userId),
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
              const result = appendTask(item.targetUserId, {
                title: line.task,
                start: line.start,
                deadline: line.deadline,
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
  const modalTitle = lockAssignee
    ? prefilledAssigneeLabel
      ? `Delegate to ${prefilledAssigneeLabel}`
      : 'Delegate plans'
    : isDelegateMode
      ? 'Delegate plans'
      : 'Add plans';
  const modalSubtitle = lockAssignee
    ? prefilledAssigneeLabel
      ? `Tasks for ${prefilledAssigneeLabel} are added directly to their locked plan.`
      : 'Delegated tasks are added directly to their locked plan.'
    : isDelegateMode
      ? 'Pick an assignee for each task below.'
      : canDelegate
        ? 'These tasks will be added to your plan. Switch to Delegate to assign tasks to your team.'
        : 'These tasks will be added to your plan.';
  const submitLabel =
    rows.length > 1 ? `Create ${rows.length} plans` : 'Create plan';

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
          <p
            data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-p-556"
            className="m-0 mt-1 text-[12px] font-normal leading-snug text-[#8F94A3]"
          >
            {modalSubtitle}
          </p>
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
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div
        data-cy="planning-and-reporting-components-planning-createplansmodal-tsx-createplansmodal-div-588"
        className="max-h-[min(62vh,32rem)] space-y-3 overflow-y-auto pr-1 scrollbar-hide"
      >
        {canDelegate && !lockAssignee && !delegateOnly ? (
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
        {rows.map((line, index) => (
          <PlanRowEditor
            key={line.id}
            line={line}
            index={index}
            canRemove={rows.length > 1}
            delegateMode={isDelegateMode}
            lockAssignee={lockAssignee}
            lockedAssigneeLabel={prefilledAssigneeLabel}
            assigneeOptions={assigneeOptions}
            targetOptions={targetOptions}
            onChange={(next) => updateRow(line.id, next)}
            onTargetSelect={(value) => updateRowTarget(line.id, value)}
            onRemove={() => removeRow(line.id)}
          />
        ))}

        <button
          type="button"
          onClick={addRow}
          data-cy="create-plans-add-row"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#D6D3FF] bg-[#FAFBFF] px-3 py-2.5 text-[13px] font-semibold text-[#574CFF] transition-colors hover:border-[#574CFF] hover:bg-[#F0EEFF]"
        >
          <PlusOutlined className="text-[12px]" />
          Add another plan
        </button>
      </div>
    </Modal>
  );
}
