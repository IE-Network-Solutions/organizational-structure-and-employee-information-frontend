'use client';

import classNames from 'classnames';
import { useMemo } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber } from 'antd';
import { NAME } from '@/types/enumTypes';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  getMetricValueInputMax,
  getMetricValueInputMin,
  validateMetricValueAgainstInitial,
} from '@/utils/okrMetricValueBounds';
import { metricAddonSymbol } from './reportFormUtils';

const { TextArea } = Input;

/** Matches PlanCard planning meta labels */
const fieldLabel =
  'text-[9px] font-medium uppercase leading-none tracking-wide text-[#B0B3C0] sm:text-[10px] sm:tracking-wider';

function formatTarget(n: unknown): string {
  if (n == null || n === '') return '—';
  const num = typeof n === 'number' ? n : Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString();
}

type PlanCardInlineReportFieldsProps = {
  formattedData: any[] | null | undefined | false;
};

function flattenReportTasks(
  formattedData: any[],
): { task: any; keyresult: any }[] {
  const rows: { task: any; keyresult: any }[] = [];
  formattedData.forEach((objective: any) => {
    objective?.keyResults?.forEach((keyresult: any) => {
      keyresult?.milestones?.forEach((milestone: any) => {
        milestone?.tasks?.forEach((task: any) => {
          rows.push({ task, keyresult });
        });
      });
      keyresult?.tasks?.forEach((task: any) => {
        rows.push({ task, keyresult });
      });
    });
  });
  return rows;
}

export function PlanCardInlineReportFields({
  formattedData,
}: PlanCardInlineReportFieldsProps) {
  const form = Form.useFormInstance();
  const selectedStatuses = PlanningAndReportingStore((s) => s.selectedStatuses);
  const setStatus = PlanningAndReportingStore((s) => s.setStatus);

  const taskRows = useMemo(
    () =>
      formattedData && Array.isArray(formattedData) && formattedData.length > 0
        ? flattenReportTasks(formattedData)
        : [],
    [formattedData],
  );

  if (taskRows.length === 0) {
    return null;
  }

  const actualValueRules = (task: any, keyresult: any, locked: boolean) => [
    {
      validator(rule: unknown, value: unknown) {
        void rule;
        if (locked) {
          return Promise.resolve();
        }
        if (!keyresult || keyresult.targetValue == null) {
          return Promise.reject(new Error('Key result data is incomplete.'));
        }
        if (value === null || value === undefined) {
          return Promise.reject(new Error('Please enter a value.'));
        }
        const numericValue = Number(value);
        if (isNaN(numericValue)) {
          return Promise.reject(new Error('Please enter a valid number.'));
        }
        const initialBoundError = validateMetricValueAgainstInitial(
          numericValue,
          keyresult,
        );
        if (initialBoundError) {
          return Promise.reject(new Error(initialBoundError));
        }
        if (
          selectedStatuses[task.taskId] === 'Done' &&
          numericValue < task?.targetValue
        ) {
          return Promise.reject(
            new Error(`Min ${Number(task?.targetValue)?.toLocaleString()}`),
          );
        }
        if (
          selectedStatuses[task.taskId] === 'Not' &&
          numericValue > task?.targetValue
        ) {
          return Promise.reject(
            new Error(`Max ${Number(task?.targetValue)?.toLocaleString()}`),
          );
        }
        return Promise.resolve();
      },
    },
  ];

  const renderTaskRow = (task: any, keyresult: any) => {
    const lockedFromChildren = Boolean(task?.lockedFromChildren);
    const isDone = selectedStatuses[task.taskId] === 'Done';
    const isNot = selectedStatuses[task.taskId] === 'Not';
    const hasChoice = isDone || isNot;
    const showActualValue =
      hasChoice &&
      keyresult?.metricType?.name !== NAME.ACHIEVE &&
      keyresult?.metricType?.name !== NAME.MILESTONE;
    const childHeldActual = Number(
      task?.rollupActualValue ?? task?.actualValue ?? 0,
    );

    return (
      <div
        key={task.taskId}
        data-cy={`inline-report-task-${task.taskId}`}
        className={classNames(
          // Align with planning rows: controls lead, then title (icons-only Done / Not)
          'group/row flex w-full min-w-0 flex-col rounded-lg px-2.5 py-2 transition-[background-color] duration-150',
          !hasChoice && 'hover:bg-[#FAFBFC]',
          isDone && 'bg-[#2563EB]/[0.03]',
          isNot && 'bg-[#FEF2F2]/40',
          lockedFromChildren && 'opacity-95',
        )}
      >
        {/* Single row when achieved fields show: task truncates (ellipsis) so controls stay inline */}
        <div
          data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-div-123"
          className={classNames(
            'flex w-full min-w-0 items-center overflow-hidden',
            showActualValue
              ? 'flex-nowrap gap-1.5'
              : 'flex-wrap gap-x-2 gap-y-2',
          )}
        >
          <Form.Item
            name={[task.taskId, 'status']}
            className="mb-0 flex shrink-0 items-center [&_.ant-form-item-row]:mb-0"
            rules={[{ required: true, message: '' }]}
          >
            <div
              data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-div-136"
              className="flex items-center gap-1"
              role="group"
              aria-label="Task outcome"
            >
              <button
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-button-141"
                type="button"
                id={`inline-report-done-${task.taskId}`}
                aria-label="Done"
                aria-pressed={isDone}
                disabled={lockedFromChildren}
                className={classNames(
                  'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-200',
                  lockedFromChildren && 'cursor-not-allowed',
                  isDone
                    ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_0_0_2px_rgba(37,99,235,0.10)]'
                    : 'border-[#D1D5DB] bg-white text-[#94A3B8] hover:border-[#2563EB]/45 hover:shadow-[0_0_0_2px_rgba(37,99,235,0.07)]',
                  lockedFromChildren &&
                    !isDone &&
                    'hover:border-[#D1D5DB] hover:shadow-none',
                )}
                onClick={() => {
                  if (lockedFromChildren) return;
                  setStatus(task.taskId, 'Done');
                  form.setFieldsValue({
                    [task.taskId]: {
                      status: 'Done',
                      actualValue: Number(task?.targetValue ?? 0),
                    },
                  });
                }}
              >
                <CheckOutlined className="text-[10px]" />
              </button>
              <button
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-button-164"
                type="button"
                id={`inline-report-not-${task.taskId}`}
                aria-label="Not completed"
                aria-pressed={isNot}
                disabled={lockedFromChildren}
                className={classNames(
                  'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-200',
                  lockedFromChildren && 'cursor-not-allowed',
                  isNot
                    ? 'border-[#DC2626] bg-[#DC2626] text-white shadow-[0_0_0_2px_rgba(220,38,38,0.12)]'
                    : 'border-[#D1D5DB] bg-white text-[#94A3B8] hover:border-[#F87171]/55 hover:shadow-[0_0_0_2px_rgba(248,113,113,0.08)]',
                  lockedFromChildren &&
                    !isNot &&
                    'hover:border-[#D1D5DB] hover:shadow-none',
                )}
                onClick={() => {
                  if (lockedFromChildren) return;
                  setStatus(task.taskId, 'Not');
                  form.setFieldsValue({
                    [task.taskId]: {
                      status: 'Not',
                      actualValue: 0,
                    },
                  });
                }}
              >
                <CloseOutlined className="text-[10px]" />
              </button>
            </div>
          </Form.Item>
          <p
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-p-189"
            className={classNames(
              'm-0 min-w-0 flex-1 transition-colors duration-200',
              showActualValue
                ? 'truncate text-[11px] leading-tight text-[#2D2F45]'
                : classNames(
                    'break-words text-[12.5px] leading-snug line-clamp-2',
                    hasChoice ? 'text-[#2D2F45]' : 'text-[#64748B]',
                  ),
            )}
            title={task.taskName}
          >
            {task.taskName}
          </p>
          {showActualValue ? (
            <div
              className="flex shrink-0 flex-nowrap items-center gap-1.5"
              data-cy={`inline-report-actual-row-${task.taskId}`}
            >
              <span
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-span-208"
                className={classNames(
                  fieldLabel,
                  'hidden min-[380px]:inline shrink-0 leading-none',
                )}
              >
                {lockedFromChildren ? 'From child' : 'Achieved'}
              </span>
              <Form.Item
                name={[task.taskId, 'actualValue']}
                className="mb-0 inline-flex shrink-0 items-center [&_.ant-form-item-row]:mb-0"
                initialValue={
                  lockedFromChildren
                    ? childHeldActual
                    : Number(task?.actualValue ?? 0)
                }
                rules={actualValueRules(task, keyresult, lockedFromChildren)}
              >
                <InputNumber
                  id={`inline-report-actual-${task.taskId}`}
                  min={getMetricValueInputMin(keyresult)}
                  max={getMetricValueInputMax(keyresult)}
                  placeholder="0"
                  aria-label={
                    lockedFromChildren
                      ? 'Achieved value from child plans'
                      : 'Achieved value'
                  }
                  disabled={lockedFromChildren}
                  title={
                    lockedFromChildren
                      ? 'Progress from child plans (read-only)'
                      : undefined
                  }
                  addonAfter={
                    <span
                      data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-span-228"
                      className="text-[10px] font-semibold tabular-nums leading-none text-[#64748B]"
                    >
                      {metricAddonSymbol(keyresult)}
                    </span>
                  }
                  className="w-[5.25rem] min-w-[5.25rem] max-w-[5.25rem] !shadow-sm [&_.ant-input-number-group]:!min-h-7 [&_.ant-input-number-group]:!items-stretch [&_.ant-input-number]:!h-7 [&_.ant-input-number]:!min-h-7 [&_.ant-input-number]:border-[#E5E7EB] [&_.ant-input-number]:bg-white [&_.ant-input-number-input-wrap]:!flex [&_.ant-input-number-input-wrap]:!h-7 [&_.ant-input-number-input-wrap]:!min-h-7 [&_.ant-input-number-input-wrap]:!items-center [&_.ant-input-number-input]:!h-full [&_.ant-input-number-input]:!min-h-0 [&_.ant-input-number-input]:!border-0 [&_.ant-input-number-input]:!px-2 [&_.ant-input-number-input]:!py-0 [&_.ant-input-number-input]:!text-[12px] [&_.ant-input-number-input]:!font-semibold [&_.ant-input-number-input]:tabular-nums [&_.ant-input-number-input]:!text-[#1E293B] [&_.ant-input-number-input]:!shadow-none [&_.ant-input-number-group-addon]:!min-h-7 [&_.ant-input-number-group-addon]:!h-auto [&_.ant-input-number-group-addon]:border-[#F1F2F6] [&_.ant-input-number-group-addon]:bg-[#FAFBFC] [&_.ant-input-number-group-addon]:!px-1.5 [&_.ant-input-number-group-addon]:!flex [&_.ant-input-number-group-addon]:!items-center"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  controls={false}
                />
              </Form.Item>
              <div
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-div-239"
                className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md bg-[#F1F5F9] px-1.5 sm:gap-1 sm:px-2"
              >
                <span
                  data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-span-246"
                  className={classNames(
                    fieldLabel,
                    '!text-[8px] !normal-case !tracking-normal text-[#94A3B8] sm:!text-[9px]',
                  )}
                >
                  Target
                </span>
                <span
                  data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-span-248"
                  className="max-w-[4rem] truncate text-[10px] font-semibold tabular-nums text-[#334155] sm:max-w-none sm:text-[11px]"
                >
                  {formatTarget(task?.targetValue)}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {lockedFromChildren && hasChoice ? (
          <p
            className="m-0 mt-1 text-[10px] leading-tight text-[#94A3B8]"
            data-cy={`inline-report-child-hint-${task.taskId}`}
          >
            From child reports (read-only)
          </p>
        ) : null}

        {/* Row 3: reason when Not */}
        <div
          data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-div-266"
          className={classNames(
            'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
            isNot ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
          aria-hidden={!isNot}
        >
          <div
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-div-264"
            className="min-h-0 overflow-hidden"
          >
            {isNot ? (
              <div
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportfields-tsx-plancardinlinereportfields-div-266"
                className="mt-1.5 border-t border-[#FECACA]/60 pt-1.5"
              >
                <Form.Item
                  name={[task.taskId, 'customReason']}
                  className="mb-0"
                  initialValue={
                    lockedFromChildren
                      ? task?.rollupCustomReason ||
                        'Failed based on child plan reports'
                      : undefined
                  }
                  rules={[
                    { required: true, message: 'Please provide a reason!' },
                  ]}
                >
                  <TextArea
                    id={`inline-report-reason-${task.taskId}`}
                    rows={2}
                    placeholder="What blocked completion?"
                    aria-label="Reason task was not completed"
                    disabled={lockedFromChildren}
                    className="!min-h-[3rem] rounded-md !border-[#E5E7EB] bg-white !px-2.5 !py-1.5 !text-[12px] !leading-snug !text-[#2D2F45] placeholder:!text-[#94A3B8] hover:!border-[#FECACA] focus:!border-[#F87171] focus:!shadow-[0_0_0_2px_rgba(248,113,113,0.12)] disabled:!bg-[#F8FAFC] disabled:!text-[#64748B]"
                    style={{ resize: 'none' }}
                  />
                </Form.Item>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-[2px]" data-cy="plan-card-inline-report-fields">
      {taskRows.map(({ task, keyresult }) => renderTaskRow(task, keyresult))}
    </div>
  );
}
