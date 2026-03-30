'use client';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  Button,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Spin,
} from 'antd';

import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { useCreateReportForUnReportedtasks } from '@/store/server/features/okrPlanningAndReporting/mutations';
import {
  AllPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { NAME } from '@/types/enumTypes';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { useQueryClient } from 'react-query';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  PR_BORDER,
  PR_PRIMARY,
  PR_TEXT,
  PR_TEXT_MUTED,
} from '../planningUiTokens';

function isMonthlyCadenceName(name: string | undefined): boolean {
  return (name || '').toLowerCase().includes('month');
}

function formatPlanPeriodToggleLabel(label: string): string {
  const l = (label || '').trim();
  if (!l) return 'Plan';
  if (/\bplan\b/i.test(l)) return l;
  return `${l} Plan`;
}

const { TextArea } = Input;
function CreateReport() {
  const queryClient = useQueryClient();
  const { isMobile } = useIsMobile();
  const {
    openReportModal,
    setOpenReportModal,
    isEditing,
    resetWeights,
    setStatus,
    resetStatuses,
    activePlanPeriodId,
    selectedStatuses,
  } = PlanningAndReportingStore();
  const [form] = Form.useForm();

  // Set initial form values based on selectedStatuses

  const onClose = () => {
    setOpenReportModal(false);
    form.resetFields();
    resetStatuses();
    resetWeights();
  };
  const { data: assignedPeriods } = AllPlanningPeriods();

  const cadencePeriodOptions = useMemo(() => {
    const safe = Array.isArray(assignedPeriods) ? assignedPeriods : [];
    return safe
      .filter((item: any) => !isMonthlyCadenceName(item?.planningPeriod?.name))
      .map((item: any) => ({
        label: item.planningPeriod?.name || 'Plan',
        value: String(item.planningPeriod?.id || ''),
      }))
      .filter((o) => o.value);
  }, [assignedPeriods]);

  const orderedCadencePeriodOptions = useMemo(() => {
    const opts = [...cadencePeriodOptions];
    opts.sort((a, b) => {
      const rank = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('daily')) return 0;
        if (l.includes('week')) return 1;
        return 2;
      };
      return rank(a.label) - rank(b.label);
    });
    return opts;
  }, [cadencePeriodOptions]);

  const [modalPlanningPeriodId, setModalPlanningPeriodId] = useState('');
  const prevOpenForInitRef = useRef(false);

  useEffect(() => {
    if (openReportModal && !prevOpenForInitRef.current) {
      const daily = orderedCadencePeriodOptions.find((o) =>
        o.label.toLowerCase().includes('daily'),
      );
      const weekly = orderedCadencePeriodOptions.find((o) =>
        o.label.toLowerCase().includes('week'),
      );
      const next =
        daily?.value ||
        weekly?.value ||
        orderedCadencePeriodOptions[0]?.value ||
        activePlanPeriodId ||
        '';
      setModalPlanningPeriodId((cur) =>
        cur && orderedCadencePeriodOptions.some((o) => o.value === cur)
          ? cur
          : next,
      );
    }
    prevOpenForInitRef.current = openReportModal;
    if (!openReportModal) prevOpenForInitRef.current = false;
  }, [openReportModal, orderedCadencePeriodOptions, activePlanPeriodId]);

  useEffect(() => {
    if (!openReportModal || orderedCadencePeriodOptions.length === 0) return;
    setModalPlanningPeriodId((cur) => {
      if (cur && orderedCadencePeriodOptions.some((o) => o.value === cur))
        return cur;
      const daily = orderedCadencePeriodOptions.find((o) =>
        o.label.toLowerCase().includes('daily'),
      );
      const weekly = orderedCadencePeriodOptions.find((o) =>
        o.label.toLowerCase().includes('week'),
      );
      return (
        daily?.value ||
        weekly?.value ||
        orderedCadencePeriodOptions[0]?.value ||
        cur
      );
    });
  }, [openReportModal, orderedCadencePeriodOptions]);

  const { mutate: createReport, isLoading: createReportLoading } =
    useCreateReportForUnReportedtasks();

  const planningPeriodId = modalPlanningPeriodId || activePlanPeriodId || '';

  const {
    data: allPlannedTaskForReport,
    isLoading: plannedTaskForReportLoading,
    refetch: refetchPlannedTasks,
  } = useGetPlannedTaskForReport(planningPeriodId);

  const selectedPeriodMeta = useMemo(
    () =>
      orderedCadencePeriodOptions.find(
        (o) => o.value === modalPlanningPeriodId,
      ),
    [orderedCadencePeriodOptions, modalPlanningPeriodId],
  );

  const periodHint = useMemo(() => {
    const name = (selectedPeriodMeta?.label || '').toLowerCase();
    if (name.includes('daily')) {
      return 'Report your daily tasks that you have planned for today.';
    }
    return 'Report progress on your weekly planned tasks.';
  }, [selectedPeriodMeta]);

  const handleOnFinish = (values: Record<string, any>) => {
    Object.entries(values).length > 0 &&
      planningPeriodId &&
      createReport(
        {
          values: values,
          planningPeriodId: planningPeriodId,
          planId: allPlannedTaskForReport?.[0]?.plan?.id,
        },

        {
          onSuccess: () => {
            queryClient.invalidateQueries('okrReports');
            queryClient.invalidateQueries('okrPlans');
            queryClient.invalidateQueries('okrUserPlans');
            queryClient.invalidateQueries('okrPlannedData');
            queryClient.invalidateQueries('planningPeriodsHierarchy');
            onClose();
          },
        },
      );
  };
  const formattedData =
    allPlannedTaskForReport &&
    groupUnReportedTasksByKeyResultAndMilestone(allPlannedTaskForReport);

  useEffect(() => {
    if (openReportModal && planningPeriodId) {
      refetchPlannedTasks();
    }
  }, [openReportModal, planningPeriodId, refetchPlannedTasks]);

  const prevReportPeriodRef = useRef<string | null>(null);
  useEffect(() => {
    if (!openReportModal) {
      prevReportPeriodRef.current = null;
      return;
    }
    if (
      prevReportPeriodRef.current &&
      planningPeriodId &&
      prevReportPeriodRef.current !== planningPeriodId
    ) {
      form.resetFields();
      resetStatuses();
      resetWeights();
    }
    if (planningPeriodId) prevReportPeriodRef.current = planningPeriodId;
  }, [openReportModal, planningPeriodId, form, resetStatuses, resetWeights]);

  // Auto-set status for pre-achieved tasks - only run once when data is loaded
  useEffect(() => {
    if (formattedData) {
      const newStatuses: Record<string, string> = {};
      let hasChanges = false;

      // Only set initial statuses for pre-achieved tasks that haven't been manually set
      formattedData.forEach((objective: any) => {
        objective?.keyResults?.forEach((keyresult: any) => {
          // Handle milestone tasks
          keyresult?.milestones?.forEach((milestone: any) => {
            milestone?.tasks?.forEach((task: any) => {
              // Only auto-set if task is pre-achieved and user hasn't manually set a status
              if (
                task?.status === 'pre-achieved' &&
                selectedStatuses[task.taskId] === undefined
              ) {
                newStatuses[task.taskId] = 'Done';
                hasChanges = true;
              }
            });
          });

          // Handle regular tasks
          keyresult?.tasks?.forEach((task: any) => {
            // Only auto-set if task is pre-achieved and user hasn't manually set a status
            if (
              task?.status === 'pre-achieved' &&
              selectedStatuses[task.taskId] === undefined
            ) {
              newStatuses[task.taskId] = 'Done';
              hasChanges = true;
            }
          });
        });
      });

      // Update statuses only if there are new pre-achieved tasks to set
      if (hasChanges) {
        Object.entries(newStatuses).forEach(([taskId, status]) => {
          setStatus(taskId, status);
        });
      }
    }
  }, [formattedData, setStatus]); // Removed selectedStatuses and other dependencies to prevent interference

  useEffect(() => {
    if (formattedData && Object.keys(selectedStatuses).length > 0) {
      const initialValues: Record<string, any> = {};

      formattedData.forEach((objective: any) => {
        objective?.keyResults?.forEach((keyresult: any) => {
          // Handle milestone tasks
          keyresult?.milestones?.forEach((milestone: any) => {
            milestone?.tasks?.forEach((task: any) => {
              if (selectedStatuses[task.taskId]) {
                if (selectedStatuses[task.taskId] === 'Done') {
                  initialValues[task.taskId] = {
                    status: selectedStatuses[task.taskId],
                    actualValue: Number(
                      task?.targetValue ?? 0,
                    )?.toLocaleString(),
                  };
                } else if (selectedStatuses[task.taskId] === 'Not') {
                  initialValues[task.taskId] = {
                    status: selectedStatuses[task.taskId],
                    actualValue: Number(
                      task?.actualValue ?? 0,
                    )?.toLocaleString(),
                  };
                }
              }
            });
          });

          // Handle regular tasks
          keyresult?.tasks?.forEach((task: any) => {
            if (selectedStatuses[task.taskId]) {
              if (selectedStatuses[task.taskId] === 'Done') {
                initialValues[task.taskId] = {
                  status: selectedStatuses[task.taskId],
                  actualValue: Number(task?.targetValue ?? 0)?.toLocaleString(),
                };
              } else if (selectedStatuses[task.taskId] === 'Not') {
                initialValues[task.taskId] = {
                  status: selectedStatuses[task.taskId],
                  actualValue: 0,
                };
              }
            }
          });
        });
      });

      if (Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [formattedData, selectedStatuses, form]);

  const totalWeight = formattedData?.reduce((sum: number, objective: any) => {
    return (
      sum +
      objective?.keyResults?.reduce((keyResultSum: number, keyResult: any) => {
        // Calculate the weight for keyResult.tasks array
        const taskWeight = keyResult?.tasks?.reduce(
          (taskSum: number, task: any) => {
            if (selectedStatuses[task.taskId] === 'Done') {
              return taskSum + Number(task.weight || 0);
            }
            return taskSum;
          },
          0,
        );

        // Calculate the weight for milestones.tasks array
        const milestoneWeight = keyResult?.milestones?.reduce(
          (milestoneSum: number, milestone: any) => {
            return (
              milestoneSum +
              milestone?.tasks?.reduce((taskSum: number, task: any) => {
                if (selectedStatuses[task.taskId] === 'Done') {
                  return taskSum + Number(task.weight || 0);
                }
                return taskSum;
              }, 0)
            );
          },
          0,
        );

        // Sum up task weights and milestone weights
        return keyResultSum + taskWeight + milestoneWeight;
      }, 0)
    );
  }, 0);

  const renderTaskRow = (task: any, keyresult: any) => {
    const isDone = selectedStatuses[task.taskId] === 'Done';
    const isNot = selectedStatuses[task.taskId] === 'Not';
    const metricSymbol =
      keyresult?.metricType?.name === NAME.CURRENCY ? '$' : '#';
    const showActualValue =
      (isDone || isNot) &&
      keyresult?.metricType?.name !== NAME.ACHIEVE &&
      keyresult?.metricType?.name !== NAME.MILESTONE;

    return (
      <div
        data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-312"
        key={task.taskId}
        className="mb-5 last:mb-0"
      >
        <Row gutter={[16, 16]} align="middle">
          <Col
            xs={showActualValue ? 7 : 11}
            sm={showActualValue ? 8 : 14}
            md={showActualValue ? 10 : 16}
          >
            <p
              className="text-gray-800 text-sm font-medium leading-relaxed m-0 truncate"
              title={task.taskName}
              data-cy="planningandreporting-planning-and-reporting-components-createreport-index-tsx-p-364"
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
              data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-332"
              className="flex items-center justify-end gap-2 sm:gap-4 overflow-x-auto no-scrollbar"
            >
              {/* Actual Value Input */}
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
                    className="w-16 sm:w-28 rounded-md border-gray-300 h-9"
                    min={0}
                    placeholder="Value"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    addonAfter={
                      <span
                        data-cy="planning-and-reporting-components-createreport-index-tsx-index-span-390"
                        className="text-[10px]"
                      >
                        {metricSymbol}
                      </span>
                    }
                    controls={false}
                  />
                </Form.Item>
              )}

              {/* Status Toggle */}
              <Form.Item
                name={[task.taskId, 'status']}
                className="mb-0"
                rules={[{ required: true, message: '' }]}
              >
                <div
                  data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-403"
                  className="flex items-center gap-2 sm:gap-4 bg-transparent p-0 border-none"
                >
                  {/* Done Option */}
                  <div
                    id={`create-report-status-done-${task.taskId}`}
                    data-cy={`create-report-status-done-${task.taskId}`}
                    className="cursor-pointer flex items-center gap-1.5 px-0 py-0 transition opacity-100 hover:opacity-80"
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
                      className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${isDone ? 'bg-[#00C48C] border-[#00C48C]' : 'bg-white border-[#E5E7EB]'}`}
                      data-cy="planningandreporting-planning-and-reporting-components-createreport-index-tsx-div-475"
                    >
                      {isDone && (
                        <CheckOutlined className="text-white text-[10px]" />
                      )}
                    </div>
                    <span
                      data-cy="planning-and-reporting-components-createreport-index-tsx-index-span-426"
                      className={`text-[13px] text-[#161A2C]`}
                    >
                      Done
                    </span>
                  </div>

                  {/* Not Option */}
                  <div
                    id={`create-report-status-not-${task.taskId}`}
                    data-cy={`create-report-status-not-${task.taskId}`}
                    className="cursor-pointer flex items-center gap-1.5 px-0 py-0 transition opacity-100 hover:opacity-80"
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
                      data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-508"
                      className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${isNot ? 'bg-[#FF4D4F] border-[#FF4D4F]' : 'bg-white border-[#E5E7EB]'}`}
                    >
                      {isNot && (
                        <CloseOutlined className="text-white text-[10px]" />
                      )}
                    </div>
                    <span
                      data-cy="planning-and-reporting-components-createreport-index-tsx-index-span-451"
                      className={`text-[13px] text-[#161A2C]`}
                    >
                      Not
                    </span>
                  </div>
                </div>
              </Form.Item>
            </div>
          </Col>
        </Row>

        {/* Reason Box */}
        {isNot && (
          <div
            data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-461"
            className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <Form.Item
              name={[task.taskId, 'customReason']}
              className="mb-0"
              rules={[{ required: true, message: 'Please provide a reason!' }]}
            >
              <TextArea
                id={`create-report-comment-textarea-${task.taskId}`}
                data-cy={`create-report-comment-textarea-${task.taskId}`}
                rows={3}
                placeholder="Please describe why this task was not completed..."
                className="w-full rounded-lg border-gray-200 bg-white p-3 text-sm focus:bg-white transition"
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </div>
        )}
      </div>
    );
  };

  const modalVisible =
    openReportModal === true && isEditing === false ? true : false;

  return (
    <Modal
      open={modalVisible}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={isMobile ? 'calc(100vw - 16px)' : 920}
      maskClosable={!createReportLoading}
      destroyOnClose={false}
      classNames={{ wrapper: 'planning-create-report-modal-wrapper' }}
      maskStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${PR_BORDER}`,
        },
        body: { padding: 0 },
      }}
      data-cy="create-report-modal"
    >
      <div
        data-cy="create-report-modal-shell"
        className="flex max-h-[min(88vh,calc(100dvh-32px))] flex-col bg-white"
      >
        <header
          data-cy="create-report-modal-header"
          className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4 md:px-6"
          style={{ borderColor: PR_BORDER }}
        >
          <h2
            className="text-lg font-bold md:text-xl"
            style={{ color: PR_TEXT }}
            data-cy="create-report-modal-title"
          >
            Reporting
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={createReportLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F5F6FA] hover:text-[#161A2C] disabled:opacity-50"
            aria-label="Close reporting"
            data-cy="create-report-modal-close"
          >
            <CloseOutlined className="text-lg" />
          </button>
        </header>

        {orderedCadencePeriodOptions.length > 1 ? (
          <section
            data-cy="create-report-cadence-section"
            className="shrink-0 border-b px-5 py-4 text-center md:px-6"
            style={{ borderColor: PR_BORDER }}
          >
            <p
              className="mb-3 text-sm font-medium"
              style={{ color: PR_TEXT }}
              data-cy="create-report-select-period-label"
            >
              Select Planning Period
            </p>
            <div
              className="mx-auto flex max-w-md rounded-lg border p-0.5"
              style={{ borderColor: PR_BORDER }}
              data-cy="create-report-cadence-toggle"
              role="group"
              aria-label="Reporting period"
            >
              {orderedCadencePeriodOptions.map((o) => {
                const active = modalPlanningPeriodId === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    data-cy={`create-report-period-${o.value}`}
                    className="flex-1 rounded-md py-2.5 text-sm font-semibold transition"
                    style={{
                      backgroundColor: active ? PR_PRIMARY : 'transparent',
                      color: active ? '#FFFFFF' : PR_TEXT,
                    }}
                    onClick={() => setModalPlanningPeriodId(o.value)}
                  >
                    {formatPlanPeriodToggleLabel(o.label)}
                  </button>
                );
              })}
            </div>
            <p
              className="mt-3 px-2 text-xs leading-relaxed"
              style={{ color: PR_TEXT_MUTED }}
              data-cy="create-report-period-hint"
            >
              {periodHint}
            </p>
          </section>
        ) : (
          <section
            className="shrink-0 border-b px-5 py-3 text-center md:px-6"
            style={{ borderColor: PR_BORDER }}
            data-cy="create-report-period-hint-only"
          >
            <p
              className="text-xs leading-relaxed"
              style={{ color: PR_TEXT_MUTED }}
              data-cy="create-report-period-hint-single"
            >
              {periodHint}
            </p>
          </section>
        )}

        <div
          data-cy="create-report-modal-body"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6"
        >
          {formattedData?.length > 0 ? (
            <Spin spinning={plannedTaskForReportLoading} tip="Loading...">
              <Form
                layout="vertical"
                form={form}
                name="dynamic_form_item"
                onFinish={handleOnFinish}
                className="px-0"
              >
                <div
                  id="create-report-collapse"
                  data-cy="create-report-collapse"
                >
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
                      objective?.keyResults?.map(
                        (keyresult: any, index: number) => {
                          const direct = keyresult?.tasks?.length || 0;
                          const milestoneTasks =
                            keyresult?.milestones?.reduce(
                              (n: number, m: any) =>
                                n + (m?.tasks?.length || 0),
                              0,
                            ) || 0;
                          const plannedCount = direct + milestoneTasks;

                          return (
                            <Collapse.Panel
                              id={`create-report-panel-${objective.id || ''}-${index}`}
                              data-cy={`create-report-panel-${objective.id || ''}-${index}`}
                              header={
                                <div
                                  data-cy="create-report-panel-header"
                                  className="flex min-w-0 w-full flex-col items-start gap-0.5 text-left"
                                >
                                  <span
                                    className="w-full truncate text-base font-bold text-[#161A2C]"
                                    title={keyresult?.title}
                                    data-cy="create-report-panel-kr-title"
                                  >
                                    {keyresult?.title}
                                  </span>
                                  <span
                                    className="text-xs font-medium text-[#8F94A3]"
                                    data-cy="create-report-panel-task-count"
                                  >
                                    {plannedCount}{' '}
                                    {plannedCount === 1
                                      ? 'Task Planned'
                                      : 'Tasks Planned'}
                                  </span>
                                </div>
                              }
                              key={`kr-${objective.id || ''}-${index}`}
                              className="mb-4 rounded-xl overflow-hidden [&_.ant-collapse-header]:!bg-[#F9FAFB] [&_.ant-collapse-header]:px-6 [&_.ant-collapse-header]:py-4 [&_.ant-collapse-content]:bg-white"
                              style={{
                                border: '1px solid #e5e7eb',
                              }}
                            >
                              <div
                                data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-536"
                                className="py-2"
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
                          );
                        },
                      ),
                    )}
                  </Collapse>
                </div>
              </Form>
            </Spin>
          ) : (
            <div
              data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-558"
              className="flex h-64 items-center justify-center"
            >
              <CustomizeRenderEmpty />
            </div>
          )}
        </div>

        <footer
          data-cy="create-report-modal-footer"
          className="flex shrink-0 flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
          style={{ borderColor: PR_BORDER }}
        >
          <span
            data-cy="create-report-total-weight"
            className="inline-flex w-fit rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
            }}
          >
            Total Weight: {Math.round(Number(totalWeight) || 0)}%
          </span>
          <div
            className="flex justify-end gap-3"
            data-cy="create-report-footer-actions"
          >
            <Button
              id="cancel-report-button-for-planning-and-reporting"
              data-cy="cancel-report-button-for-planning-and-reporting"
              className="h-10 min-w-[100px] rounded-lg border bg-white font-semibold"
              style={{ borderColor: PR_BORDER, color: PR_TEXT }}
              onClick={onClose}
              disabled={createReportLoading}
            >
              Cancel
            </Button>
            <Button
              id="submit-report-button-for-planning-and-reporting"
              data-cy="submit-report-button-for-planning-and-reporting"
              type="primary"
              className="h-10 min-w-[100px] rounded-lg border-0 font-semibold !bg-[#2D5BFF] !text-white hover:!bg-[#2447D4]"
              loading={createReportLoading}
              onClick={() => form.submit()}
            >
              Create
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
}

export default CreateReport;
