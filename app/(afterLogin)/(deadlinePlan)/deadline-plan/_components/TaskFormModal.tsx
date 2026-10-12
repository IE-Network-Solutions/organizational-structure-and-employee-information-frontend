'use client';
import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Select,
} from 'antd';
import {
  CloseOutlined,
  DownOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { DeadlineKeyResult } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlineKeyResults } from '@/store/server/features/deadlinePlan/queries';
import {
  useCreateDeadlineTasks,
  useUpdateDeadlineTask,
} from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import { UserAvatar } from './TaskBadges';
import {
  createSubTaskDraft,
  createTaskDraft,
  draftFromTask,
  draftToPayload,
  SubTaskDraft,
  TaskDraft,
  TaskDraftErrors,
  validateTaskDraft,
  withAssignee,
  withDateRange,
  withKeyResult,
} from './taskDrafts';
import { DATE_FORMAT, resolveMetricKind } from './utils';
import { PersonOption } from './useDeadlinePeople';
import styles from './deadlinePlan.module.css';

const LABEL_CLASS = 'mb-2 block text-xs font-medium text-slate-500';
const ERROR_CLASS = 'mt-1 text-xs text-red-600';
const NO_KEY_RESULT = 'none';

const PRIORITY_OPTIONS = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

interface TaskFormModalProps {
  userId: string;
  people: PersonOption[];
}

export default function TaskFormModal({ userId, people }: TaskFormModalProps) {
  const isOpen = useDeadlinePlanStore((state) => state.isTaskFormOpen);
  const editingTask = useDeadlinePlanStore((state) => state.editingTask);
  const presetKeyResult = useDeadlinePlanStore(
    (state) => state.taskFormKeyResult,
  );
  const presetAssigneeId = useDeadlinePlanStore(
    (state) => state.taskFormAssigneeId,
  );
  const closeTaskForm = useDeadlinePlanStore((state) => state.closeTaskForm);

  const { mutate: createTasks, isLoading: isCreating } =
    useCreateDeadlineTasks();
  const { mutate: updateTask, isLoading: isUpdating } = useUpdateDeadlineTask();

  const [drafts, setDrafts] = useState<TaskDraft[]>([]);
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setShowErrors(false);
    setCollapsedKeys([]);
    setDrafts([
      editingTask
        ? draftFromTask(editingTask)
        : createTaskDraft({
            assigneeId: presetKeyResult?.ownerId ?? presetAssigneeId ?? userId,
            date: dayjs().format(DATE_FORMAT),
            keyResultId: presetKeyResult?.id,
          }),
    ]);
  }, [isOpen, editingTask, presetKeyResult, presetAssigneeId, userId]);

  const assigneeIds = useMemo(
    () => Array.from(new Set(drafts.map((draft) => draft.assigneeId))),
    [drafts],
  );
  const keyResultQueries = useDeadlineKeyResults(assigneeIds);
  const keyResultsOf = (assigneeId: string) => {
    const query = keyResultQueries[assigneeIds.indexOf(assigneeId)];
    return {
      keyResults: (query?.data ?? []) as DeadlineKeyResult[],
      isLoading: !!query?.isLoading,
    };
  };

  const assigneeOptions = useMemo(() => {
    // Keep the current assignee selectable even when they are outside the
    // viewer's scope (e.g. a task a manager moved elsewhere).
    const known = new Set(people.map((person) => person.id));
    const extra = editingTask && !known.has(editingTask.assigneeId);
    const options = people.map((person) => ({
      value: person.id,
      name: person.id === userId ? `${person.name} (You)` : person.name,
    }));
    return extra
      ? [
          ...options,
          { value: editingTask.assigneeId, name: 'Current assignee' },
        ]
      : options;
  }, [people, userId, editingTask]);

  const patchDraft = (key: string, change: (draft: TaskDraft) => TaskDraft) =>
    setDrafts((current) =>
      current.map((draft) => (draft.key === key ? change(draft) : draft)),
    );

  const patchSubTask = (
    draftKey: string,
    subTaskKey: string,
    patch: Partial<SubTaskDraft>,
  ) =>
    patchDraft(draftKey, (draft) => ({
      ...draft,
      subTasks: draft.subTasks.map((subTask) =>
        subTask.key === subTaskKey ? { ...subTask, ...patch } : subTask,
      ),
    }));

  const toggleCollapsed = (key: string) =>
    setCollapsedKeys((keys) =>
      keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key],
    );

  const addDraft = () =>
    setDrafts((current) => [
      ...current,
      createTaskDraft({
        assigneeId: presetKeyResult?.ownerId ?? presetAssigneeId ?? userId,
        date: dayjs().format(DATE_FORMAT),
      }),
    ]);

  const submit = () => {
    const invalid = drafts.filter((draft) => validateTaskDraft(draft));
    if (invalid.length) {
      setShowErrors(true);
      // Open whatever holds an error so it is not hidden behind a collapse.
      const invalidKeys = invalid.flatMap((draft) => [
        draft.key,
        `${draft.key}-subtasks`,
      ]);
      setCollapsedKeys((keys) =>
        keys.filter((key) => !invalidKeys.includes(key)),
      );
      return;
    }

    const payloads = drafts.map((draft) =>
      draftToPayload(
        draft,
        keyResultsOf(draft.assigneeId).keyResults.find(
          (keyResult) => keyResult.id === draft.keyResultId,
        ),
      ),
    );

    if (editingTask) {
      updateTask(
        { id: editingTask.id, task: payloads[0] },
        { onSuccess: closeTaskForm },
      );
    } else {
      createTasks(payloads, { onSuccess: closeTaskForm });
    }
  };

  const renderSubTasks = (draft: TaskDraft, errors: TaskDraftErrors | null) => {
    const sectionKey = `${draft.key}-subtasks`;
    const collapsed = collapsedKeys.includes(sectionKey);
    const addSubTask = () => {
      patchDraft(draft.key, (current) => ({
        ...current,
        subTasks: [...current.subTasks, createSubTaskDraft(current.startDate)],
      }));
      setCollapsedKeys((keys) => keys.filter((key) => key !== sectionKey));
    };

    return (
      <>
        {draft.subTasks.length > 0 ? (
          <div data-cy="deadline-form-subtasks" className="mt-2">
            <button
              type="button"
              data-cy="deadline-form-subtasks-toggle"
              onClick={() => toggleCollapsed(sectionKey)}
              className="flex w-full items-center gap-2 text-sm font-medium text-[#161A2C]"
              aria-expanded={!collapsed}
            >
              {collapsed ? <RightOutlined /> : <DownOutlined />}
              Subtasks ({draft.subTasks.length})
            </button>

            {!collapsed ? (
              <div
                data-cy="deadline-form-subtask-list"
                className="mt-3 flex flex-col gap-2"
              >
                {draft.subTasks.map((subTask, index) => (
                  <div
                    key={subTask.key}
                    data-cy={`deadline-form-subtask-${index}`}
                    className="py-3"
                  >
                    <div
                      data-cy="deadline-form-subtask-header"
                      className="mb-1 flex items-center justify-between"
                    >
                      <span
                        data-cy="deadline-form-subtask-number"
                        className="text-xs text-slate-500"
                      >
                        Subtask {index + 1}
                      </span>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        aria-label={`Remove subtask ${index + 1}`}
                        onClick={() =>
                          patchDraft(draft.key, (current) => ({
                            ...current,
                            subTasks: current.subTasks.filter(
                              (item) => item.key !== subTask.key,
                            ),
                          }))
                        }
                        data-cy={`deadline-form-subtask-remove-${index}`}
                      />
                    </div>
                    <div
                      data-cy="deadline-form-subtask-fields"
                      className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[minmax(0,1fr)_148px]"
                    >
                      <Input
                        variant="borderless"
                        className="!px-0 !font-medium"
                        aria-label={`Subtask ${index + 1} title`}
                        value={subTask.title}
                        placeholder="Subtask title"
                        onChange={(event) =>
                          patchSubTask(draft.key, subTask.key, {
                            title: event.target.value,
                          })
                        }
                        data-cy={`deadline-form-subtask-title-${index}`}
                      />
                      <DatePicker
                        variant="borderless"
                        className="w-full !px-0"
                        aria-label={`Subtask ${index + 1} date`}
                        allowClear={false}
                        value={dayjs(subTask.date)}
                        disabledDate={(date) =>
                          date.isBefore(dayjs(draft.startDate), 'day') ||
                          date.isAfter(dayjs(draft.deadline), 'day')
                        }
                        onChange={(date) =>
                          date &&
                          patchSubTask(draft.key, subTask.key, {
                            date: date.format(DATE_FORMAT),
                          })
                        }
                        data-cy={`deadline-form-subtask-date-${index}`}
                      />
                      <div
                        data-cy="deadline-form-subtask-description-field"
                        className="sm:col-span-2"
                      >
                        <span
                          data-cy="deadline-form-subtask-description-label"
                          className="sr-only"
                        >
                          Description
                        </span>
                        <Input.TextArea
                          variant="borderless"
                          className="!px-0 !text-sm"
                          aria-label={`Subtask ${index + 1} description`}
                          rows={2}
                          value={subTask.description}
                          placeholder="Optional subtask description"
                          onChange={(event) =>
                            patchSubTask(draft.key, subTask.key, {
                              description: event.target.value,
                            })
                          }
                          data-cy={`deadline-form-subtask-description-${index}`}
                        />
                      </div>
                      {errors?.subTasks[subTask.key] ? (
                        <div
                          data-cy="deadline-form-subtask-error"
                          className={classNames(ERROR_CLASS, 'sm:col-span-2')}
                        >
                          {errors.subTasks[subTask.key]}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          data-cy="deadline-form-add-subtask"
          onClick={addSubTask}
          className="inline-flex items-center gap-2 self-start py-2 text-sm text-slate-500 hover:text-okr-primary"
        >
          <PlusOutlined className="text-okr-primary" /> Add subtask
        </button>
      </>
    );
  };

  const renderDraft = (draft: TaskDraft, index: number) => {
    const collapsed = collapsedKeys.includes(draft.key);
    const errors = showErrors ? validateTaskDraft(draft) : null;
    const { keyResults, isLoading: isLoadingKeyResults } = keyResultsOf(
      draft.assigneeId,
    );
    const keyResult = keyResults.find((item) => item.id === draft.keyResultId);
    const metricKind = resolveMetricKind(keyResult);
    const milestones = keyResult?.milestones ?? [];
    const showAchieve =
      metricKind === 'achieve' ||
      (metricKind === 'milestone' && !!draft.milestoneId);

    return (
      <div
        key={draft.key}
        data-cy={`deadline-form-task-${index}`}
        className="min-w-0"
      >
        <div
          data-cy="deadline-form-task-header"
          className="flex items-center gap-3 px-6 py-3 sm:px-8"
        >
          <button
            type="button"
            data-cy={`deadline-form-task-toggle-${index}`}
            onClick={() => toggleCollapsed(draft.key)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <RightOutlined className="text-[10px] text-slate-400" />
            ) : (
              <DownOutlined className="text-[10px] text-slate-400" />
            )}
            <span
              data-cy="deadline-form-task-number"
              className="shrink-0 text-xs text-slate-500"
            >
              Task {index + 1}
            </span>
            <span
              data-cy="deadline-form-task-heading"
              className="truncate text-xs text-slate-500"
            >
              {collapsed ? draft.title.trim() || 'Untitled task' : ''}
            </span>
          </button>
          {drafts.length > 1 ? (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              aria-label={`Remove task ${index + 1}`}
              onClick={() =>
                setDrafts((current) =>
                  current.filter((item) => item.key !== draft.key),
                )
              }
              data-cy={`deadline-form-task-remove-${index}`}
            />
          ) : null}
        </div>

        {!collapsed ? (
          <div
            data-cy="deadline-form-task-body"
            className="grid min-w-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]"
          >
            <div
              data-cy="deadline-form-writing-area"
              className="flex min-w-0 flex-col gap-5 px-6 pb-8 pt-3 sm:px-8"
            >
              <div data-cy="deadline-form-title-field">
                <Input
                  variant="borderless"
                  className="!px-0 !text-[22px] !font-semibold !text-[#161A2C]"
                  value={draft.title}
                  placeholder="Task Name"
                  aria-label="Task name"
                  autoFocus={index === drafts.length - 1}
                  onChange={(event) =>
                    patchDraft(draft.key, (current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  data-cy={`deadline-form-title-${index}`}
                />
                {errors?.title ? (
                  <div
                    data-cy="deadline-form-title-error"
                    className={ERROR_CLASS}
                  >
                    {errors.title}
                  </div>
                ) : null}
              </div>

              <div data-cy="deadline-form-description-field">
                <span
                  data-cy="deadline-form-description-label"
                  className="sr-only"
                >
                  Description
                </span>
                <Input.TextArea
                  variant="borderless"
                  className="!px-0 !text-sm"
                  rows={3}
                  aria-label="Task description"
                  value={draft.description}
                  placeholder="Add a description…"
                  onChange={(event) =>
                    patchDraft(draft.key, (current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  data-cy={`deadline-form-description-${index}`}
                />
              </div>
              {renderSubTasks(draft, errors)}
            </div>

            <div
              data-cy="deadline-form-metadata"
              className={classNames(
                'flex min-w-0 flex-col gap-5 bg-slate-50/80 px-6 py-6',
                styles.formMetadata,
              )}
            >
              <div data-cy="deadline-form-assignee-field">
                <span
                  data-cy="deadline-form-assignee-label"
                  className={LABEL_CLASS}
                >
                  Assignee
                </span>
                <Select
                  variant="borderless"
                  aria-label="Task assignee"
                  className="w-full"
                  size="large"
                  showSearch
                  optionFilterProp="name"
                  value={draft.assigneeId}
                  options={assigneeOptions}
                  fieldNames={{ label: 'name', value: 'value' }}
                  optionRender={(option) => (
                    <span
                      data-cy="deadline-form-assignee-option"
                      className="inline-flex items-center gap-2"
                    >
                      <UserAvatar name={String(option.data.name)} size="sm" />
                      {option.data.name}
                    </span>
                  )}
                  onChange={(assigneeId) =>
                    patchDraft(draft.key, (current) =>
                      withAssignee(current, assigneeId),
                    )
                  }
                  data-cy={`deadline-form-assignee-${index}`}
                />
              </div>

              <div
                data-cy="deadline-form-dates-row"
                className="flex flex-col gap-5"
              >
                <div data-cy="deadline-form-dates-field" className="min-w-0">
                  <span
                    data-cy="deadline-form-dates-label"
                    className={LABEL_CLASS}
                  >
                    Date range
                  </span>
                  <DatePicker.RangePicker
                    variant="borderless"
                    aria-label="Task date range"
                    className="w-full"
                    size="large"
                    allowClear={false}
                    value={[dayjs(draft.startDate), dayjs(draft.deadline)]}
                    onChange={(range) => {
                      const [start, end] = range ?? [];
                      if (!start || !end) return;
                      patchDraft(draft.key, (current) =>
                        withDateRange(
                          current,
                          start.format(DATE_FORMAT),
                          end.format(DATE_FORMAT),
                        ),
                      );
                    }}
                    data-cy={`deadline-form-dates-${index}`}
                  />
                  {errors?.dates ? (
                    <div
                      data-cy="deadline-form-dates-error"
                      className={ERROR_CLASS}
                    >
                      {errors.dates}
                    </div>
                  ) : null}
                </div>
                <div data-cy="deadline-form-priority-field">
                  <span
                    data-cy="deadline-form-priority-label"
                    className={LABEL_CLASS}
                  >
                    Priority
                  </span>
                  <Select
                    variant="borderless"
                    aria-label="Task priority"
                    className="w-full"
                    size="large"
                    value={draft.priority}
                    options={PRIORITY_OPTIONS}
                    onChange={(priority) =>
                      patchDraft(draft.key, (current) => ({
                        ...current,
                        priority,
                      }))
                    }
                    data-cy={`deadline-form-priority-${index}`}
                  />
                </div>
              </div>

              <div data-cy="deadline-form-key-result-field">
                <span
                  data-cy="deadline-form-key-result-label"
                  className={LABEL_CLASS}
                >
                  Key result
                </span>
                <Select
                  variant="borderless"
                  aria-label="Task key result"
                  className="w-full"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  loading={isLoadingKeyResults}
                  value={draft.keyResultId ?? NO_KEY_RESULT}
                  options={[
                    { label: 'No key result', value: NO_KEY_RESULT },
                    ...keyResults.map((item) => ({
                      label: item.title,
                      value: item.id,
                    })),
                  ]}
                  onChange={(value) =>
                    patchDraft(draft.key, (current) =>
                      withKeyResult(
                        current,
                        value === NO_KEY_RESULT ? null : value,
                      ),
                    )
                  }
                  data-cy={`deadline-form-key-result-${index}`}
                />
              </div>

              {keyResult && milestones.length > 0 ? (
                <div data-cy="deadline-form-milestone-field">
                  <span
                    data-cy="deadline-form-milestone-label"
                    className={LABEL_CLASS}
                  >
                    Milestone
                  </span>
                  <Select
                    variant="borderless"
                    aria-label="Task milestone"
                    className="w-full"
                    size="large"
                    allowClear
                    placeholder="No milestone"
                    value={draft.milestoneId ?? undefined}
                    options={milestones.map((milestone) => ({
                      label: milestone.title,
                      value: milestone.id,
                    }))}
                    onChange={(milestoneId) =>
                      patchDraft(draft.key, (current) => ({
                        ...current,
                        milestoneId: milestoneId ?? null,
                        achieveKR: milestoneId ? current.achieveKR : false,
                      }))
                    }
                    data-cy={`deadline-form-milestone-${index}`}
                  />
                </div>
              ) : null}

              {keyResult && metricKind === 'numeric' ? (
                <div data-cy="deadline-form-target-field">
                  <span
                    data-cy="deadline-form-target-label"
                    className={LABEL_CLASS}
                  >
                    Target ({keyResult.metricType?.name})
                  </span>
                  <InputNumber
                    variant="borderless"
                    aria-label="Task target value"
                    className="w-full"
                    size="large"
                    value={draft.targetValue}
                    placeholder="How much this task should contribute"
                    onChange={(targetValue) =>
                      patchDraft(draft.key, (current) => ({
                        ...current,
                        targetValue,
                      }))
                    }
                    data-cy={`deadline-form-target-${index}`}
                  />
                  <div
                    data-cy="deadline-form-target-hint"
                    className="mt-1 text-xs text-slate-500"
                  >
                    Key result is at {Number(keyResult.currentValue ?? 0)} of{' '}
                    {Number(keyResult.targetValue ?? 0)}.
                  </div>
                </div>
              ) : null}

              {keyResult && showAchieve ? (
                <Checkbox
                  checked={draft.achieveKR}
                  onChange={(event) =>
                    patchDraft(draft.key, (current) => ({
                      ...current,
                      achieveKR: event.target.checked,
                    }))
                  }
                  data-cy={`deadline-form-achieve-${index}`}
                >
                  {metricKind === 'achieve'
                    ? 'Achieve KR when this task is done'
                    : 'Complete this milestone when the task is done'}
                </Checkbox>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      title={editingTask ? 'Edit task' : 'Add task'}
      onCancel={closeTaskForm}
      width={980}
      className={styles.formModal}
      centered
      destroyOnClose
      maskClosable={false}
      data-cy="deadline-task-form-modal"
      footer={
        <div
          data-cy="deadline-form-footer"
          className="flex flex-wrap items-center justify-end gap-2"
        >
          {!editingTask ? (
            <Button
              type="text"
              className="!mr-auto !text-okr-primary"
              icon={<PlusOutlined />}
              onClick={addDraft}
              data-cy="deadline-form-add-plan"
            >
              Add plan
            </Button>
          ) : null}
          <Button
            type="text"
            onClick={closeTaskForm}
            data-cy="deadline-form-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isCreating || isUpdating}
            onClick={submit}
            data-cy="deadline-form-submit"
          >
            {editingTask ? 'Save' : 'Submit'}
          </Button>
        </div>
      }
    >
      <div
        data-cy="deadline-form-tasks"
        className="flex max-h-[70vh] flex-col divide-y divide-[#F1F2F6] overflow-y-auto"
      >
        {drafts.map(renderDraft)}
      </div>
    </Modal>
  );
}
