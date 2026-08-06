'use client';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Col, Collapse, Form, Input, InputNumber, Row } from 'antd';
import { NAME } from '@/types/enumTypes';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  getMetricValueInputMax,
  getMetricValueInputMin,
  validateMetricValueAgainstInitial,
} from '@/utils/okrMetricValueBounds';
import { metricAddonSymbol } from './reportFormUtils';

const { TextArea } = Input;

type CreateReportFormCollapseProps = {
  formattedData: any[] | null | undefined | false;
  planningPeriodName?: string;
  /** Slightly tighter panels when embedded in a plan card */
  embedded?: boolean;
};

export function CreateReportFormCollapse({
  formattedData,
  planningPeriodName,
  embedded = false,
}: CreateReportFormCollapseProps) {
  const form = Form.useFormInstance();
  const selectedStatuses = PlanningAndReportingStore((s) => s.selectedStatuses);
  const setStatus = PlanningAndReportingStore((s) => s.setStatus);

  if (
    !formattedData ||
    !Array.isArray(formattedData) ||
    formattedData.length === 0
  ) {
    return null;
  }

  const renderTaskRow = (task: any, keyresult: any) => {
    const isDone = selectedStatuses[task.taskId] === 'Done';
    const isNot = selectedStatuses[task.taskId] === 'Not';
    const metricSymbol = metricAddonSymbol(keyresult);
    const showActualValue =
      (isDone || isNot) &&
      keyresult?.metricType?.name !== NAME.ACHIEVE &&
      keyresult?.metricType?.name !== NAME.MILESTONE;

    return (
      <div
        data-cy="planning-and-reporting-components-createreport-formcollapse-div-task"
        key={task.taskId}
        className={embedded ? 'mb-3 last:mb-0' : 'mb-5 last:mb-0'}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col
            xs={showActualValue ? 7 : 11}
            sm={showActualValue ? 8 : 14}
            md={showActualValue ? 10 : 16}
          >
            <p
              data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-p-56"
              className="m-0 truncate text-xs font-medium leading-relaxed text-gray-800 sm:text-sm"
              title={task.taskName}
            >
              {task.taskName}
            </p>
          </Col>

          <Col
            xs={showActualValue ? 17 : 13}
            sm={showActualValue ? 16 : 10}
            md={showActualValue ? 14 : 8}
          >
            <div
              data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-div-69"
              className="no-scrollbar flex items-center justify-end gap-2 overflow-x-auto sm:gap-4"
            >
              {showActualValue && (
                <Form.Item
                  name={[task.taskId, 'actualValue']}
                  className="mb-0"
                  initialValue={
                    Number(task?.actualValue)?.toLocaleString() || 0
                  }
                  rules={[
                    {
                      validator(unusedRule, value) {
                        if (!keyresult || !keyresult.targetValue) {
                          return Promise.reject(
                            new Error('Key result data is incomplete.'),
                          );
                        }
                        if (value === null || value === undefined) {
                          return Promise.reject(
                            new Error('Please enter a value.'),
                          );
                        }
                        const numericValue = Number(value);
                        if (isNaN(numericValue)) {
                          return Promise.reject(
                            new Error('Please enter a valid number.'),
                          );
                        }

                        const initialBoundError =
                          validateMetricValueAgainstInitial(
                            numericValue,
                            keyresult,
                          );
                        if (initialBoundError) {
                          return Promise.reject(new Error(initialBoundError));
                        }

                        if (isDone && numericValue < task?.targetValue) {
                          return Promise.reject(
                            new Error(
                              `Min ${Number(task?.targetValue)?.toLocaleString()}`,
                            ),
                          );
                        }
                        if (isNot && numericValue > task?.targetValue) {
                          return Promise.reject(
                            new Error(
                              `Max ${Number(task?.targetValue)?.toLocaleString()}`,
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    id={`create-report-actual-value-input-${task.taskId}`}
                    data-cy={`create-report-actual-value-input-${task.taskId}`}
                    className="h-8 w-14 rounded-md border-gray-300 sm:h-9 sm:w-28"
                    min={getMetricValueInputMin(keyresult)}
                    max={getMetricValueInputMax(keyresult)}
                    placeholder="Value"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) =>
                      value ? value.replace(/,/g, '') : ('' as unknown as number)
                    }
                    addonAfter={
                      <span
                        data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-span-126"
                        className="text-[10px]"
                      >
                        {metricSymbol}
                      </span>
                    }
                    controls={false}
                  />
                </Form.Item>
              )}

              <Form.Item
                name={[task.taskId, 'status']}
                className="mb-0"
                rules={[{ required: true, message: '' }]}
              >
                <div
                  data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-div-138"
                  className="flex items-center gap-2 border-none bg-transparent p-0 sm:gap-4"
                >
                  <div
                    id={`create-report-status-done-${task.taskId}`}
                    data-cy={`create-report-status-done-${task.taskId}`}
                    className="flex cursor-pointer items-center gap-1 px-0 py-0 opacity-100 transition hover:opacity-80"
                    onClick={() => {
                      setStatus(task.taskId, 'Done');
                      form.setFieldsValue({
                        [task.taskId]: {
                          status: 'Done',
                          actualValue: Number(task?.targetValue ?? 0),
                        },
                      });
                    }}
                  >
                    <div
                      data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-div-164"
                      className={`flex h-5 w-5 items-center justify-center rounded-[4px] border transition-all ${isDone ? 'border-[#00C48C] bg-[#00C48C]' : 'border-[#E5E7EB] bg-white'}`}
                    >
                      {isDone && (
                        <CheckOutlined className="text-[10px] text-white" />
                      )}
                    </div>
                    <span
                      data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-span-160"
                      className="text-[12px] text-[#161A2C] sm:text-[13px]"
                    >
                      Done
                    </span>
                  </div>

                  <div
                    id={`create-report-status-not-${task.taskId}`}
                    data-cy={`create-report-status-not-${task.taskId}`}
                    className="flex cursor-pointer items-center gap-1 px-0 py-0 opacity-100 transition hover:opacity-80"
                    onClick={() => {
                      setStatus(task.taskId, 'Not');
                      form.setFieldsValue({
                        [task.taskId]: {
                          status: 'Not',
                          actualValue: 0,
                        },
                      });
                    }}
                  >
                    <div
                      data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-div-193"
                      className={`flex h-5 w-5 items-center justify-center rounded-[4px] border transition-all ${isNot ? 'border-[#FF4D4F] bg-[#FF4D4F]' : 'border-[#E5E7EB] bg-white'}`}
                    >
                      {isNot && (
                        <CloseOutlined className="text-[10px] text-white" />
                      )}
                    </div>
                    <span
                      data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-span-186"
                      className="text-[12px] text-[#161A2C] sm:text-[13px]"
                    >
                      Not
                    </span>
                  </div>
                </div>
              </Form.Item>
            </div>
          </Col>
        </Row>

        {isNot && (
          <div
            data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-div-197"
            className="animate-in fade-in slide-in-from-top-2 mt-3 duration-200"
          >
            <Form.Item
              name={[task.taskId, 'customReason']}
              className="mb-0"
              rules={[{ required: true, message: 'Please provide a reason!' }]}
            >
              <TextArea
                id={`create-report-comment-textarea-${task.taskId}`}
                data-cy={`create-report-comment-textarea-${task.taskId}`}
                rows={embedded ? 2 : 3}
                placeholder="Please describe why this task was not completed..."
                className="w-full rounded-lg border-gray-200 bg-white p-2 text-sm transition focus:bg-white"
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </div>
        )}
      </div>
    );
  };

  const headerPad = embedded
    ? '[&_.ant-collapse-header]:!px-3 [&_.ant-collapse-header]:!py-2.5'
    : '[&_.ant-collapse-header]:!px-6 [&_.ant-collapse-header]:!py-4';

  return (
    <div id="create-report-collapse" data-cy="create-report-collapse">
      <Collapse
        defaultActiveKey={formattedData?.flatMap((obj: any) =>
          obj.keyResults?.map(
            (nonused: any, i: number) => `kr-${obj.id || ''}-${i}`,
          ),
        )}
        expandIconPosition="end"
        bordered={false}
        className="bg-transparent"
      >
        {formattedData?.map((objective: any) =>
          objective?.keyResults?.map((keyresult: any, index: number) => (
            <Collapse.Panel
              id={`create-report-panel-${objective.id || ''}-${index}`}
              data-cy={`create-report-panel-${objective.id || ''}-${index}`}
              header={
                <div
                  data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-div-240"
                  className="flex min-w-0 w-full items-center gap-2"
                >
                  <span
                    data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-span-241"
                    className="flex-shrink-0 whitespace-nowrap font-bold text-gray-900"
                  >
                    {planningPeriodName
                      ? `${planningPeriodName}-task :`
                      : 'Task :'}
                  </span>
                  <span
                    data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-span-272"
                    className="min-w-0 flex-1 truncate font-normal text-gray-700"
                    title={keyresult?.title}
                  >
                    {keyresult?.title}
                  </span>
                </div>
              }
              key={`kr-${objective.id || ''}-${index}`}
              className={`mb-3 overflow-hidden rounded-xl last:mb-0 [&_.ant-collapse-content]:bg-white [&_.ant-collapse-header]:!bg-[#F9FAFB] ${headerPad}`}
              style={{ border: '1px solid #e5e7eb' }}
            >
              <div
                data-cy="planning-and-reporting-components-createreport-createreportformcollapse-tsx-createreportformcollapse-div-258"
                className={embedded ? 'py-1.5' : 'py-2'}
              >
                {keyresult?.milestones?.map((milestone: any) =>
                  milestone?.tasks?.map((task: any) =>
                    renderTaskRow(task, keyresult),
                  ),
                )}
                {keyresult?.tasks?.map((task: any) =>
                  renderTaskRow(task, keyresult),
                )}
              </div>
            </Collapse.Panel>
          )),
        )}
      </Collapse>
    </div>
  );
}
