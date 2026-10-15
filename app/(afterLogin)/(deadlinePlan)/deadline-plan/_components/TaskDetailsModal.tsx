'use client';
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Button, Dropdown, Modal } from 'antd';
import {
  AimOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  FileTextOutlined,
  FlagOutlined,
  LinkOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import {
  PriorityLabel,
  ToneBadge,
  ToneText,
  UserAvatar,
  UserCell,
} from './TaskBadges';
import TaskCompletion from './TaskCompletion';
import TaskLockButton from './TaskLockButton';
import TaskReview from './TaskReview';
import { PersonOption } from './useDeadlinePeople';
import { isTaskDone, TaskActions } from './useTaskActions';
import {
  deadlineLabel,
  resolveApproval,
  resolveMetricKind,
  resolveTaskStatus,
  TaskViewer,
} from './utils';
import styles from './deadlinePlan.module.css';

function DetailField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      data-cy={`deadline-detail-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="border-b border-slate-200/70 py-4 last:border-0"
    >
      <dt
        data-cy="deadline-detail-label"
        className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500"
      >
        {icon} {label}
      </dt>
      <dd
        data-cy="deadline-detail-value"
        className="min-w-0 break-words text-sm text-[#161A2C]"
      >
        {children}
      </dd>
    </div>
  );
}

interface TaskDetailsModalProps {
  task: DeadlineTask | null;
  actions: TaskActions;
  viewer: TaskViewer;
  getPerson: (id: string | null | undefined) => PersonOption | null;
  onClose: () => void;
}

export default function TaskDetailsModal({
  task,
  actions,
  viewer,
  getPerson,
  onClose,
}: TaskDetailsModalProps) {
  const openTaskForm = useDeadlinePlanStore((state) => state.openTaskForm);
  const setReportingTask = useDeadlinePlanStore(
    (state) => state.setReportingTask,
  );
  const edit = () => {
    if (!task) return;
    onClose();
    openTaskForm({ task });
  };
  const permissions = task ? actions.permissionsOf(task) : null;
  const status = task ? resolveTaskStatus(task) : null;
  const approval = task ? resolveApproval(task) : null;
  const due = task ? deadlineLabel(task, dayjs()) : null;
  const menuItems = task ? actions.menuItemsOf(task, undefined, onClose) : [];

  return (
    <Modal
      open={!!task}
      onCancel={onClose}
      footer={null}
      title={null}
      aria-label="Task details"
      width={980}
      className={styles.detailsModal}
      centered
      destroyOnClose
      data-cy="deadline-task-details-modal"
    >
      {task ? (
        <>
          <div
            data-cy="deadline-detail-header"
            className="flex min-h-16 items-center justify-between gap-3 border-b border-[#F1F2F6] px-5 pr-16"
          >
            <span
              data-cy="deadline-detail-breadcrumb"
              className="flex min-w-0 items-center gap-2 text-xs text-slate-500"
            >
              <span
                data-cy="deadline-detail-project-icon"
                className="text-base text-slate-400"
              >
                #
              </span>
              <span
                data-cy="deadline-detail-project"
                className="font-medium text-okr-primary"
              >
                Deadline Plan
              </span>
              <span
                data-cy="deadline-detail-divider"
                className="text-slate-300"
              >
                /
              </span>
              Task details
            </span>
            <div
              className="flex shrink-0 items-center gap-1"
              data-cy="deadline-detail-management-actions"
            >
              <TaskLockButton task={task} actions={actions} />
              {permissions?.canComment ? (
                <Button
                  type="text"
                  icon={<CommentOutlined />}
                  onClick={() =>
                    document
                      .getElementById(`deadline-review-comment-${task.id}`)
                      ?.focus()
                  }
                  className="!text-slate-500"
                >
                  Comment
                </Button>
              ) : null}
              {menuItems?.length ? (
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    aria-label="Task actions"
                    data-cy={`deadline-task-actions-${task.id}`}
                  />
                </Dropdown>
              ) : null}
            </div>
          </div>
          <div
            data-cy="deadline-detail-layout"
            className="grid max-h-[75vh] min-h-[420px] grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,1fr)_264px]"
          >
            <div
              data-cy="deadline-detail-main"
              className="flex min-w-0 flex-col px-5 py-6 sm:px-8 sm:py-8"
            >
              <div
                data-cy="deadline-detail-title-row"
                className="flex items-start gap-3"
              >
                <TaskCompletion
                  task={task}
                  actions={actions}
                  onReport={onClose}
                />
                <h2
                  data-cy="deadline-detail-title"
                  className={classNames(
                    'min-w-0 break-words text-[22px] font-semibold leading-tight text-[#161A2C]',
                    isTaskDone(task) && 'text-slate-400 line-through',
                  )}
                >
                  {task.title}
                </h2>
              </div>
              <div
                data-cy="deadline-detail-description"
                className="mt-5 pl-8 text-sm leading-relaxed text-slate-600"
              >
                {task.description ? (
                  <p
                    data-cy="deadline-detail-description-text"
                    className="whitespace-pre-wrap break-words"
                  >
                    {task.description}
                  </p>
                ) : permissions?.canEdit ? (
                  <button
                    type="button"
                    onClick={edit}
                    data-cy="deadline-detail-add-description"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-okr-primary"
                  >
                    <FileTextOutlined /> Add description
                  </button>
                ) : (
                  <p
                    data-cy="deadline-detail-no-description"
                    className="text-slate-400"
                  >
                    No description
                  </p>
                )}
              </div>

              <div data-cy="deadline-detail-subtasks" className="mt-8 pl-8">
                {task.subTasks?.length ? (
                  <>
                    <h3
                      data-cy="deadline-detail-subtasks-heading"
                      className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#161A2C]"
                    >
                      Subtasks{' '}
                      <span
                        data-cy="deadline-detail-subtasks-count"
                        className="text-xs font-normal text-slate-400"
                      >
                        {task.subTasks.filter(isTaskDone).length}/
                        {task.subTasks.length}
                      </span>
                    </h3>
                    <div
                      data-cy="deadline-detail-subtasks-list"
                      className="divide-y divide-[#F1F2F6] border-y border-[#F1F2F6]"
                    >
                      {task.subTasks.map((subTask) => {
                        const items = actions.menuItemsOf(subTask, task);
                        const subTaskStatus = resolveTaskStatus(subTask);
                        return (
                          <div
                            key={subTask.id}
                            data-cy={`deadline-detail-subtask-${subTask.id}`}
                            className="flex items-start gap-3 py-3"
                          >
                            <TaskCompletion
                              task={subTask}
                              parent={task}
                              actions={actions}
                            />
                            <div
                              data-cy="deadline-detail-subtask-content"
                              className="min-w-0 flex-1"
                            >
                              <p
                                data-cy="deadline-detail-subtask-title"
                                className={classNames(
                                  'break-words text-sm text-[#161A2C]',
                                  isTaskDone(subTask) &&
                                    'text-slate-400 line-through',
                                )}
                              >
                                {subTask.title}
                              </p>
                              {subTask.description ? (
                                <p
                                  data-cy="deadline-detail-subtask-description"
                                  className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500"
                                >
                                  {subTask.description}
                                </p>
                              ) : null}
                              <div
                                data-cy="deadline-detail-subtask-meta"
                                className="mt-2 flex flex-wrap items-center gap-3"
                              >
                                <time
                                  dateTime={subTask.deadline}
                                  data-cy="deadline-detail-subtask-date"
                                  className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                                >
                                  <CalendarOutlined />{' '}
                                  {dayjs(subTask.deadline).format(
                                    'MMM D, YYYY',
                                  )}
                                </time>
                                <ToneBadge
                                  label={subTaskStatus.label}
                                  tone={subTaskStatus.tone}
                                />
                              </div>
                            </div>
                            {items?.length ? (
                              <Dropdown
                                menu={{ items }}
                                trigger={['click']}
                                placement="bottomRight"
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<MoreOutlined />}
                                  aria-label={`Actions for ${subTask.title}`}
                                  data-cy={`deadline-task-actions-${subTask.id}`}
                                />
                              </Dropdown>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
                {permissions?.canEdit ? (
                  <button
                    type="button"
                    onClick={edit}
                    data-cy="deadline-detail-add-subtask"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-okr-primary"
                  >
                    <PlusOutlined className="text-okr-primary" /> Add subtask
                  </button>
                ) : null}
              </div>

              {task.status === 'reported' ? (
                <div
                  data-cy="deadline-detail-report"
                  className="mt-8 rounded-xl border border-[#F1F2F6] bg-slate-50/60 p-4"
                >
                  <h3
                    data-cy="deadline-detail-report-heading"
                    className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#161A2C]"
                  >
                    <CheckCircleOutlined className="text-okr-primary" /> Task
                    report
                  </h3>
                  <dl
                    data-cy="deadline-detail-report-fields"
                    className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
                  >
                    <dt
                      data-cy="deadline-detail-outcome-label"
                      className="text-slate-500"
                    >
                      Outcome
                    </dt>
                    <dd
                      data-cy="deadline-detail-outcome"
                      className="text-[#161A2C]"
                    >
                      {task.outcome === 'done' ? 'Done' : 'Not done'}
                    </dd>
                    {task.actualValue != null ? (
                      <>
                        <dt
                          data-cy="deadline-detail-actual-label"
                          className="text-slate-500"
                        >
                          Achieved value
                        </dt>
                        <dd
                          data-cy="deadline-detail-actual"
                          className="text-[#161A2C]"
                        >
                          {task.actualValue.toLocaleString()}
                        </dd>
                      </>
                    ) : null}
                    {task.reportedAt ? (
                      <>
                        <dt
                          data-cy="deadline-detail-reported-label"
                          className="text-slate-500"
                        >
                          Reported
                        </dt>
                        <dd
                          data-cy="deadline-detail-reported"
                          className="text-[#161A2C]"
                        >
                          {dayjs(task.reportedAt).format(
                            'MMM D, YYYY · h:mm A',
                          )}
                        </dd>
                      </>
                    ) : null}
                  </dl>
                  {task.customReason ? (
                    <p
                      data-cy="deadline-detail-report-reason"
                      className="mt-3 whitespace-pre-wrap break-words border-t border-slate-200 pt-3 text-sm text-slate-600"
                    >
                      {task.customReason}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <TaskReview task={task} actions={actions} getPerson={getPerson} />

              {permissions?.canEdit || permissions?.canReport ? (
                <div
                  data-cy="deadline-detail-primary-actions"
                  className="mt-auto flex flex-wrap items-center gap-2 pt-8"
                >
                  {permissions.canReport ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        onClose();
                        setReportingTask(task);
                      }}
                      data-cy="deadline-detail-report-button"
                    >
                      Report task
                    </Button>
                  ) : null}
                  {permissions.canEdit ? (
                    <Button
                      onClick={edit}
                      data-cy="deadline-detail-edit-button"
                    >
                      Edit task
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <aside
              data-cy="deadline-detail-sidebar"
              className="border-t border-[#F1F2F6] bg-slate-50/80 px-6 py-2 md:border-l md:border-t-0"
            >
              <dl data-cy="deadline-detail-metadata">
                <DetailField label="Assignee" icon={<UserOutlined />}>
                  <span
                    data-cy="deadline-detail-assignee-person"
                    className="inline-flex min-w-0 max-w-full items-center gap-2"
                  >
                    <UserAvatar
                      name={getPerson(task.assigneeId)?.name ?? 'Unknown user'}
                      size="sm"
                    />
                    <UserCell
                      name={getPerson(task.assigneeId)?.name ?? 'Unknown user'}
                      isSelf={task.assigneeId === viewer.userId}
                    />
                  </span>
                </DetailField>
                <DetailField label="Assigned by" icon={<UserOutlined />}>
                  <UserCell
                    name={getPerson(task.assignedById)?.name ?? null}
                    isSelf={task.assignedById === viewer.userId}
                  />
                </DetailField>
                <DetailField label="Start date" icon={<CalendarOutlined />}>
                  <time
                    data-cy="deadline-detail-start-date"
                    dateTime={task.startDate}
                  >
                    {dayjs(task.startDate).format('MMM D, YYYY')}
                  </time>
                </DetailField>
                <DetailField label="Deadline" icon={<CalendarOutlined />}>
                  <time
                    data-cy="deadline-detail-deadline-date"
                    dateTime={task.deadline}
                  >
                    {dayjs(task.deadline).format('MMM D, YYYY')}
                  </time>
                  {due ? (
                    <div
                      data-cy="deadline-detail-deadline-relative"
                      className="mt-1"
                    >
                      <ToneText text={due.text} tone={due.tone} />
                    </div>
                  ) : null}
                </DetailField>
                <DetailField label="Priority" icon={<FlagOutlined />}>
                  <PriorityLabel priority={task.priority} />
                </DetailField>
                <DetailField label="Metric" icon={<AimOutlined />}>
                  {task.keyResult?.metricType?.name ?? 'General task'}
                  {resolveMetricKind(task.keyResult) === 'numeric' &&
                  task.targetValue != null ? (
                    <p
                      data-cy="deadline-detail-target"
                      className="mt-1 text-xs text-slate-500"
                    >
                      Planned value: {task.targetValue.toLocaleString()}
                    </p>
                  ) : null}
                </DetailField>
                {task.keyResult ? (
                  <DetailField label="Key result" icon={<LinkOutlined />}>
                    {task.keyResult.title}
                    {task.achieveKR ? (
                      <p
                        data-cy="deadline-detail-achieve-kr"
                        className="mt-1 text-xs text-slate-500"
                      >
                        Completes{' '}
                        {task.milestone ? 'the milestone' : 'the key result'}{' '}
                        when done
                      </p>
                    ) : null}
                  </DetailField>
                ) : null}
                {task.milestone ? (
                  <DetailField label="Milestone" icon={<FlagOutlined />}>
                    {task.milestone.title}
                  </DetailField>
                ) : null}
                {status ? (
                  <DetailField label="Status" icon={<CheckCircleOutlined />}>
                    <ToneBadge label={status.label} tone={status.tone} />
                    {task.isLocked && status.label !== 'Locked' ? (
                      <span
                        data-cy="deadline-detail-locked"
                        className="ml-2 inline-flex items-center gap-1 text-xs text-slate-500"
                      >
                        <LockOutlined /> Locked
                      </span>
                    ) : null}
                  </DetailField>
                ) : null}
                <DetailField label="Approval" icon={<CheckCircleOutlined />}>
                  {approval ? (
                    <ToneBadge label={approval.label} tone={approval.tone} />
                  ) : (
                    'Open'
                  )}
                </DetailField>
                {task.approvedById ? (
                  <DetailField label="Approved by" icon={<UserOutlined />}>
                    <UserCell
                      name={
                        getPerson(task.approvedById)?.name ?? 'Unknown user'
                      }
                    />
                  </DetailField>
                ) : null}
                {task.isLocked && task.lockedById ? (
                  <DetailField label="Locked by" icon={<LockOutlined />}>
                    <UserCell
                      name={getPerson(task.lockedById)?.name ?? 'Unknown user'}
                    />
                  </DetailField>
                ) : null}
              </dl>
            </aside>
          </div>
        </>
      ) : null}
    </Modal>
  );
}
