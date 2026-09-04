'use client';

import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import {
  childrenOf,
  formatDate,
  isOverdue,
  todayIso,
  validateRange,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import { durationFilterLabel } from '../planning/durationFilter';
import { filterMockTasksByDuration } from './mockDurationFilter';
import {
  childCapForParent,
  countChildren,
  MOCK_KEY_RESULTS,
  UNLINKED_KR_ID,
} from './mockPlanningConstants';
import {
  useUserPlanRepositoryMock,
  type MockPlanTask,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

type ReportDraft = Record<
  string,
  { status: 'Done' | 'Not' | null; note?: string; actualValue?: number | null }
>;

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

function TaskMeta({ task, today }: { task: MockPlanTask; today: string }) {
  const overdue = isOverdue(task, today);
  return (
    <p
      data-cy="deadlineplanningprototype-50"
      className="m-0 text-xs text-[#64748B]"
    >
      {task.keyResultTitle ? `${task.keyResultTitle} · ` : 'Unlinked · '}
      {task.spanDays} day{task.spanDays === 1 ? '' : 's'} · {task.deadline}
      {task.isPendingApproval ? ' · Pending approval' : ''}
      {overdue ? ' · Overdue' : ''}
    </p>
  );
}

export function DeadlinePlanningPrototype({
  userId,
  displayName,
  durationKind,
  view,
}: {
  userId: string;
  displayName: string;
  durationKind: DeadlineKind;
  view: 'planning' | 'reporting';
}) {
  const today = todayIso();
  const plan = useUserPlanRepositoryMock(
    (s) => s.plansByUserId[userId] ?? null,
  );
  const ensurePlan = useUserPlanRepositoryMock((s) => s.ensurePlan);
  const appendTask = useUserPlanRepositoryMock((s) => s.appendTask);
  const approvePending = useUserPlanRepositoryMock((s) => s.approvePending);
  const reportTasks = useUserPlanRepositoryMock((s) => s.reportTasks);
  const requestReopen = useUserPlanRepositoryMock((s) => s.requestReopen);
  const approveReopen = useUserPlanRepositoryMock((s) => s.approveReopen);
  const openPlanDirect = useUserPlanRepositoryMock((s) => s.openPlanDirect);
  const dismissReopen = useUserPlanRepositoryMock(
    (s) => s.dismissReopenRequest,
  );
  const togglePreAchieved = useUserPlanRepositoryMock(
    (s) => s.togglePreAchieved,
  );
  const removeTask = useUserPlanRepositoryMock((s) => s.removeTask);

  React.useEffect(() => {
    if (userId) ensurePlan(userId, displayName);
  }, [userId, displayName, ensurePlan]);

  const activeTasks = plan?.activeTasks.filter((t) => !t.isReported) ?? [];
  const filtered = useMemo(
    () => filterMockTasksByDuration(activeTasks, durationKind, today),
    [activeTasks, durationKind, today],
  );
  const roots = filtered.filter((t) => t.parentId == null);
  const pendingCount = activeTasks.filter((t) => t.isPendingApproval).length;

  const [title, setTitle] = useState('');
  const [start, setStart] = useState(dayjs());
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(dayjs());
  const [priority, setPriority] = useState('medium');
  const [keyResultId, setKeyResultId] = useState<string>(UNLINKED_KR_ID);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [childTitle, setChildTitle] = useState('');
  const [reportDraft, setReportDraft] = useState<ReportDraft>({});

  const planTitle = displayName.endsWith('s')
    ? `${displayName}' Plan`
    : `${displayName}'s Plan`;

  const handleAddTask = () => {
    if (!deadline) {
      message.warning('Choose an end date.');
      return;
    }
    const startIso = formatDate(start);
    const deadlineIso = formatDate(deadline);
    const range = validateRange(startIso, deadlineIso);
    if (!range.ok) {
      message.warning(range.error);
      return;
    }
    const result = appendTask(userId, {
      title,
      start: startIso,
      deadline: deadlineIso,
      keyResultId,
      priority,
    });
    if (!result.ok) {
      message.warning(result.error);
      return;
    }
    message.success('Task added (pending manager approval if plan is closed).');
    setTitle('');
    setStart(dayjs());
    setDeadline(dayjs());
  };

  const handleAddChild = (parent: MockPlanTask) => {
    const cap = childCapForParent(parent.kind, parent.start, parent.deadline);
    if (countChildren(activeTasks, parent.id) >= cap) {
      message.warning(`Maximum ${cap} subtasks for this task.`);
      return;
    }
    const childStart =
      parent.kind === 'week' ? formatDate(dayjs()) : parent.start;
    const childDeadline = parent.kind === 'week' ? childStart : parent.deadline;
    const result = appendTask(userId, {
      title: childTitle,
      start: childStart,
      deadline: childDeadline,
      parentId: parent.id,
      priority: 'medium',
    });
    if (!result.ok) {
      message.warning(result.error);
      return;
    }
    message.success('Subtask added.');
    setChildTitle('');
  };

  const handleSubmitReport = () => {
    const rows = filtered
      .map((t) => {
        const d = reportDraft[t.id];
        if (!d?.status) return null;
        return {
          taskId: t.id,
          status: d.status,
          note: d.note,
          actualValue: d.actualValue,
        };
      })
      .filter(Boolean) as Array<{
      taskId: string;
      status: 'Done' | 'Not';
      note?: string;
      actualValue?: number | null;
    }>;
    if (rows.length === 0) {
      message.warning('Mark at least one task before submitting.');
      return;
    }
    reportTasks(userId, rows);
    setReportDraft({});
    message.success('Report submitted — tasks removed from active plan.');
  };

  const renderReportRow = (task: MockPlanTask, nested?: boolean) => {
    const draft = reportDraft[task.id] ?? { status: null };
    const isDaily = task.kind === 'daily';
    const isMonth = task.kind === 'month';
    const linked = task.keyResultId && task.keyResultId !== UNLINKED_KR_ID;

    return (
      <div
        data-cy="deadline-proto-div-201"
        key={task.id}
        className={classNames(
          'rounded-lg border border-[#E5E7EB] bg-white p-3',
          nested && 'ml-6',
        )}
      >
        <p
          data-cy="deadlineplanningprototype-208"
          className="m-0 text-sm font-medium text-[#161A2C]"
        >
          {task.title}
        </p>
        <TaskMeta task={task} today={today} />
        <div
          data-cy="deadlineplanningprototype-210"
          className="mt-3 flex flex-wrap items-center gap-3"
        >
          {isDaily ? (
            <Checkbox
              checked={draft.status === 'Done'}
              onChange={(e) =>
                setReportDraft((prev) => ({
                  ...prev,
                  [task.id]: {
                    ...prev[task.id],
                    status: e.target.checked ? 'Done' : 'Not',
                  },
                }))
              }
            >
              Done
            </Checkbox>
          ) : (
            <>
              <Button
                size="small"
                type={draft.status === 'Done' ? 'primary' : 'default'}
                onClick={() =>
                  setReportDraft((prev) => ({
                    ...prev,
                    [task.id]: { ...prev[task.id], status: 'Done' },
                  }))
                }
              >
                Done
              </Button>
              <Button
                size="small"
                danger={draft.status === 'Not'}
                type={draft.status === 'Not' ? 'primary' : 'default'}
                onClick={() =>
                  setReportDraft((prev) => ({
                    ...prev,
                    [task.id]: { ...prev[task.id], status: 'Not' },
                  }))
                }
              >
                Not
              </Button>
            </>
          )}
          {!isDaily ? (
            <Input
              placeholder="Note (optional)"
              className="max-w-xs"
              value={draft.note ?? ''}
              onChange={(e) =>
                setReportDraft((prev) => ({
                  ...prev,
                  [task.id]: { ...prev[task.id], note: e.target.value },
                }))
              }
            />
          ) : null}
          {isMonth && linked ? (
            <InputNumber
              placeholder="Progress / actual"
              min={0}
              value={draft.actualValue ?? undefined}
              onChange={(v) =>
                setReportDraft((prev) => ({
                  ...prev,
                  [task.id]: {
                    ...prev[task.id],
                    actualValue: v ?? null,
                  },
                }))
              }
            />
          ) : null}
        </div>
      </div>
    );
  };

  const renderPlanningRow = (task: MockPlanTask, nested?: boolean) => {
    const children = childrenOf(activeTasks, task.id);
    const cap = childCapForParent(task.kind, task.start, task.deadline);
    const canAddChild = cap > 0 && !plan?.isValidated;

    return (
      <div
        data-cy="deadlineplanningprototype-295"
        key={task.id}
        className={nested ? 'ml-6' : ''}
      >
        <div
          data-cy="deadlineplanningprototype-296"
          className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3"
        >
          <Checkbox
            checked={task.done}
            onChange={() => togglePreAchieved(userId, task.id)}
            className="mt-1"
          />
          <div
            data-cy="deadlineplanningprototype-302"
            className="min-w-0 flex-1"
          >
            <p
              data-cy="deadline-proto-p-303"
              className={classNames(
                'm-0 text-sm font-medium text-[#161A2C]',
                task.done && 'text-[#94A3B8] line-through',
              )}
            >
              {task.title}
            </p>
            <TaskMeta task={task} today={today} />
            {canAddChild ? (
              <button
                data-cy="deadline-proto-button-313"
                type="button"
                className="mt-2 text-xs font-semibold text-[#574CFF]"
                onClick={() =>
                  setExpandedParent((cur) => (cur === task.id ? null : task.id))
                }
              >
                {expandedParent === task.id ? 'Hide' : 'Add'} subtasks (
                {countChildren(activeTasks, task.id)}/{cap})
              </button>
            ) : null}
            {expandedParent === task.id && canAddChild ? (
              <div
                data-cy="deadlineplanningprototype-325"
                className="mt-2 flex gap-2"
              >
                <Input
                  placeholder="Subtask title"
                  value={childTitle}
                  onChange={(e) => setChildTitle(e.target.value)}
                  className="max-w-md"
                />
                <Button onClick={() => handleAddChild(task)}>Add</Button>
              </div>
            ) : null}
          </div>
          {!plan?.isValidated ? (
            <Button
              type="text"
              danger
              size="small"
              onClick={() => removeTask(userId, task.id)}
            >
              Remove
            </Button>
          ) : null}
        </div>
        {children.map((c) => renderPlanningRow(c, true))}
      </div>
    );
  };

  if (!plan) return null;

  return (
    <div className="space-y-4" data-cy="deadline-planning-prototype">
      <div
        data-cy="deadlineplanningprototype-356"
        className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
      >
        <div
          data-cy="deadlineplanningprototype-357"
          className="flex flex-wrap items-start justify-between gap-3"
        >
          <div data-cy="deadlineplanningprototype-358">
            <h2
              data-cy="deadlineplanningprototype-359"
              className="m-0 text-lg font-bold text-[#161A2C]"
            >
              {planTitle}
            </h2>
            <p
              data-cy="deadlineplanningprototype-362"
              className="m-0 mt-1 text-sm text-[#64748B]"
            >
              {durationFilterLabel(durationKind)} ·{' '}
              {plan.isValidated ? 'Closed' : 'Open'}
              {plan.pendingReopenRequest ? ' · Reopen requested' : ''}
            </p>
          </div>
          <div
            data-cy="deadlineplanningprototype-368"
            className="flex flex-wrap gap-2"
          >
            {pendingCount > 0 ? (
              <Button
                type="primary"
                onClick={() => {
                  const { mergedCount } = approvePending(userId);
                  message.success(
                    `Approved ${mergedCount} task(s) into ${planTitle}.`,
                  );
                }}
                data-cy="mock-manager-approve"
              >
                Manager: Approve pending ({pendingCount})
              </Button>
            ) : null}
            {plan.isValidated && !plan.pendingReopenRequest ? (
              <Button onClick={() => requestReopen(userId)}>
                Request reopen
              </Button>
            ) : null}
            {plan.pendingReopenRequest ? (
              <>
                <Button
                  type="primary"
                  onClick={() => {
                    approveReopen(userId);
                    message.success('Plan reopened for editing.');
                  }}
                >
                  Manager: Approve reopen
                </Button>
                <Button onClick={() => dismissReopen(userId)}>Dismiss</Button>
              </>
            ) : null}
            {plan.isValidated ? (
              <Button
                onClick={() => {
                  openPlanDirect(userId);
                  message.success('Manager opened plan directly.');
                }}
              >
                Manager: Open plan
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {view === 'planning' ? (
        <>
          {!plan.isValidated ? (
            <div
              className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4"
              data-cy="mock-task-composer"
            >
              <p
                data-cy="deadlineplanningprototype-423"
                className="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]"
              >
                Add task (no weight)
              </p>
              <div
                data-cy="deadlineplanningprototype-426"
                className="grid gap-3 md:grid-cols-2"
              >
                <Input
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Select
                  value={keyResultId}
                  onChange={setKeyResultId}
                  options={MOCK_KEY_RESULTS.map((k) => ({
                    value: k.id,
                    label: k.title,
                  }))}
                />
                <DatePicker
                  value={start}
                  onChange={(v) => v && setStart(v)}
                  className="w-full"
                />
                <DatePicker
                  value={deadline}
                  onChange={setDeadline}
                  className="w-full"
                  disabledDate={(c) => c.isBefore(start, 'day')}
                />
                <Select
                  value={priority}
                  onChange={setPriority}
                  options={priorityOptions}
                />
                <Button type="primary" onClick={handleAddTask}>
                  Add to plan
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4"
              data-cy="mock-closed-add"
            >
              <p
                data-cy="deadlineplanningprototype-466"
                className="m-0 mb-3 text-sm text-[#64748B]"
              >
                Plan is closed. Add tasks — they stay pending until the manager
                approves.
              </p>
              <div
                data-cy="deadlineplanningprototype-470"
                className="grid gap-3 md:grid-cols-2"
              >
                <Input
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Select
                  value={keyResultId}
                  onChange={setKeyResultId}
                  options={MOCK_KEY_RESULTS.map((k) => ({
                    value: k.id,
                    label: k.title,
                  }))}
                />
                <DatePicker
                  value={start}
                  onChange={(v) => v && setStart(v)}
                  className="w-full"
                />
                <DatePicker
                  value={deadline}
                  onChange={setDeadline}
                  className="w-full"
                  disabledDate={(c) => c.isBefore(start, 'day')}
                />
                <Button type="primary" onClick={handleAddTask}>
                  Add pending task
                </Button>
              </div>
            </div>
          )}

          <div data-cy="deadlineplanningprototype-502" className="space-y-2">
            {roots.length === 0 ? (
              <p
                data-cy="deadlineplanningprototype-504"
                className="py-8 text-center text-sm text-[#94A3B8]"
              >
                No tasks for {durationFilterLabel(durationKind).toLowerCase()}.
              </p>
            ) : (
              roots.map((t) => renderPlanningRow(t))
            )}
          </div>
        </>
      ) : (
        <>
          <div data-cy="deadlineplanningprototype-514" className="space-y-2">
            {filtered.length === 0 ? (
              <p
                data-cy="deadlineplanningprototype-516"
                className="py-8 text-center text-sm text-[#94A3B8]"
              >
                Nothing to report for this window.
              </p>
            ) : (
              filtered
                .filter((t) => t.parentId == null)
                .map((t) => (
                  <div
                    data-cy="deadlineplanningprototype-523"
                    key={t.id}
                    className="space-y-2"
                  >
                    {renderReportRow(t)}
                    {childrenOf(activeTasks, t.id).map((c) =>
                      renderReportRow(c, true),
                    )}
                  </div>
                ))
            )}
          </div>
          {filtered.length > 0 ? (
            <Button type="primary" onClick={handleSubmitReport}>
              Submit report
            </Button>
          ) : null}

          {plan.reportHistory.length > 0 ? (
            <div
              data-cy="deadlineplanningprototype-539"
              className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4"
            >
              <p
                data-cy="deadlineplanningprototype-540"
                className="m-0 mb-2 text-sm font-semibold text-[#161A2C]"
              >
                Report history (archived from active plan)
              </p>
              <ul
                data-cy="deadlineplanningprototype-543"
                className="m-0 list-disc pl-5 text-sm text-[#64748B]"
              >
                {plan.reportHistory.map((r) => (
                  <li data-cy="deadlineplanningprototype-545" key={r.id}>
                    {new Date(r.submittedAt).toLocaleString()} —{' '}
                    {r.taskTitles.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
