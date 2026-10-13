'use client';
import React, { useEffect, useState } from 'react';
import { Input, InputNumber, Modal, Radio } from 'antd';
import { DeadlineTaskOutcome } from '@/store/server/features/deadlinePlan/interface';
import { useReportDeadlineTasks } from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import { resolveMetricKind } from './utils';

const LABEL_CLASS =
  'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400';

/** Report a task as done or not done, with the achieved value when it feeds a numeric key result. */
export default function ReportTaskModal() {
  const task = useDeadlinePlanStore((state) => state.reportingTask);
  const setReportingTask = useDeadlinePlanStore(
    (state) => state.setReportingTask,
  );
  const { mutate: reportTasks, isLoading } = useReportDeadlineTasks();

  const [outcome, setOutcome] = useState<DeadlineTaskOutcome>('done');
  const [actualValue, setActualValue] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!task) return;
    setOutcome(task.outcome ?? 'done');
    setActualValue(task.actualValue ?? task.targetValue ?? null);
    setReason(task.customReason ?? '');
  }, [task]);

  const metricKind = resolveMetricKind(task?.keyResult);
  const isNumeric = metricKind === 'numeric';
  const close = () => setReportingTask(null);

  const effect =
    !task?.keyResult || !task.achieveKR
      ? null
      : metricKind === 'milestone' && task.milestone
        ? `Reporting this as done completes the milestone "${task.milestone.title}".`
        : metricKind === 'achieve'
          ? 'Reporting this as done marks the key result as achieved.'
          : null;

  const submit = () => {
    if (!task) return;
    reportTasks(
      [
        {
          taskId: task.id,
          outcome,
          actualValue: isNumeric ? (actualValue ?? 0) : undefined,
          customReason: outcome === 'not_done' ? reason.trim() : undefined,
        },
      ],
      { onSuccess: close },
    );
  };

  return (
    <Modal
      open={!!task}
      title="Report task"
      okText="Submit report"
      onOk={submit}
      onCancel={close}
      confirmLoading={isLoading}
      destroyOnClose
      data-cy="deadline-report-modal"
    >
      {task ? (
        <div
          data-cy="deadline-report-form"
          className="flex flex-col gap-4 pt-2"
        >
          <div data-cy="deadline-report-task">
            <div
              data-cy="deadline-report-task-title"
              className="text-sm font-semibold text-slate-800"
            >
              {task.title}
            </div>
            {task.keyResult ? (
              <div
                data-cy="deadline-report-key-result"
                className="text-xs text-slate-500"
              >
                {task.keyResult.title}
              </div>
            ) : null}
          </div>

          <div data-cy="deadline-report-outcome-field">
            <span
              data-cy="deadline-report-outcome-label"
              className={LABEL_CLASS}
            >
              Outcome
            </span>
            <Radio.Group
              value={outcome}
              onChange={(event) => {
                setOutcome(event.target.value);
                if (event.target.value === 'not_done') setActualValue(0);
              }}
              options={[
                { label: 'Done', value: 'done' },
                { label: 'Not done', value: 'not_done' },
              ]}
              data-cy="deadline-report-outcome"
            />
          </div>

          {isNumeric ? (
            <div data-cy="deadline-report-actual-field">
              <span
                data-cy="deadline-report-actual-label"
                className={LABEL_CLASS}
              >
                Achieved value ({task.keyResult?.metricType?.name})
              </span>
              <InputNumber
                className="w-full"
                value={actualValue}
                onChange={(value) => setActualValue(value)}
                placeholder="How much was achieved"
                data-cy="deadline-report-actual"
              />
              <div
                data-cy="deadline-report-actual-hint"
                className="mt-1 text-xs text-slate-500"
              >
                {task.targetValue !== null
                  ? `Planned ${task.targetValue}. `
                  : ''}
                This is added to the key result&apos;s current value.
              </div>
            </div>
          ) : null}

          {outcome === 'not_done' ? (
            <div data-cy="deadline-report-reason-field">
              <span
                data-cy="deadline-report-reason-label"
                className={LABEL_CLASS}
              >
                Reason
              </span>
              <Input.TextArea
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="What got in the way?"
                data-cy="deadline-report-reason"
              />
            </div>
          ) : effect ? (
            <div
              data-cy="deadline-report-effect"
              className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600"
            >
              {effect}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
