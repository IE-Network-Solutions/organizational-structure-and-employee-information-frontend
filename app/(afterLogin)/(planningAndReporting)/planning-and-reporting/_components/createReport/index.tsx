import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  Button,
  Collapse,
  Form,
  Radio,
  Row,
  Tag,
  Tooltip,
  Typography,
  Input,
  InputNumber,
  Spin,
} from 'antd';

import {
  useDefaultPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { useCreateReportForUnReportedtasks } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { NAME } from '@/types/enumTypes';
import { FaStar } from 'react-icons/fa';
import { MdKey } from 'react-icons/md';
import { useEffect } from 'react';
const { Text } = Typography;

const { TextArea } = Input;
function CreateReport() {
  const {
    openReportModal,
    setOpenReportModal,
    activePlanPeriod,
    isEditing,
    resetWeights,
    setStatus,
    resetStatuses,
    activePlanPeriodId,
    selectedStatuses,
  } = PlanningAndReportingStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpenReportModal(false);
    form.resetFields();
    resetStatuses();
    resetWeights();
  };
  const { data: planningPeriods } = useDefaultPlanningPeriods();

  const { mutate: createReport, isLoading: createReportLoading } =
    useCreateReportForUnReportedtasks();

  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {};
  };
  const planningPeriodId =
    activePlanPeriodId ?? planningPeriods?.[activePlanPeriod - 1]?.id;
  const {
    data: allPlannedTaskForReport,
    isLoading: plannedTaskForReportLoading,
    refetch: refetchPlannedTasks,
  } = useGetPlannedTaskForReport(planningPeriodId);

  const planningPeriodName = getPlanningPeriodDetail(activePlanPeriodId)?.name;

  const modalHeader = (
    <div className="flex justify-center text-base sm:text-xl font-extrabold text-gray-800 p-4">
      Create {planningPeriodName} Report
    </div>
  );

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
            onClose();
          },
        },
      );
  };
  const formattedData =
    allPlannedTaskForReport &&
    groupUnReportedTasksByKeyResultAndMilestone(allPlannedTaskForReport);

  useEffect(() => {
    if (openReportModal) {
      refetchPlannedTasks();
    }
  }, [openReportModal, refetchPlannedTasks]);

  useEffect(() => {
    if (formattedData) {
      const newStatuses: Record<string, string> = {};
      let hasChanges = false;

      formattedData.forEach((objective: any) => {
        objective?.keyResults?.forEach((keyresult: any) => {
          keyresult?.milestones?.forEach((milestone: any) => {
            milestone?.tasks?.forEach((task: any) => {
              if (
                task?.status === 'pre-achieved' &&
                selectedStatuses[task.taskId] === undefined
              ) {
                newStatuses[task.taskId] = 'Done';
                hasChanges = true;
              }
            });
          });

          keyresult?.tasks?.forEach((task: any) => {
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

      if (hasChanges) {
        Object.entries(newStatuses).forEach(([taskId, status]) => {
          setStatus(taskId, status);
        });
      }
    }
  }, [formattedData, setStatus]);

  useEffect(() => {
    if (formattedData && Object.keys(selectedStatuses).length > 0) {
      const initialValues: Record<string, any> = {};

      formattedData.forEach((objective: any) => {
        objective?.keyResults?.forEach((keyresult: any) => {
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
        const taskWeight = keyResult?.tasks?.reduce(
          (taskSum: number, task: any) => {
            if (selectedStatuses[task.taskId] === 'Done') {
              return taskSum + Number(task.weight || 0);
            }
            return taskSum;
          },
          0,
        );

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

        return keyResultSum + taskWeight + milestoneWeight;
      }, 0)
    );
  }, 0);

  return (
    openReportModal && (
      <CustomDrawerLayout
        open={openReportModal === true && isEditing === false ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width="95%"
        className="sm:!w-[85%] md:!w-[75%] lg:!w-[65%]"
      >
        {formattedData?.length > 0 ? (
          <Spin spinning={plannedTaskForReportLoading} tip="Loading...">
            <Form
              layout="vertical"
              form={form}
              name="dynamic_form_item"
              onFinish={handleOnFinish}
            >
              {formattedData?.map((objective: any, resultIndex: number) => (
                <Collapse
                  defaultActiveKey={0}
                  key={resultIndex}
                  className="mb-4"
                >
                  <Collapse.Panel header={objective?.title} key={1}>
                    {objective?.keyResults?.map(
                      (keyresult: any, index: number) => (
                        <div key={index} className="mb-6">
                          <Row className="flex justify-between text-xs mb-1">
                            <p>Key Result:</p>
                            <p>Weight</p>
                          </Row>
                          <Row className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
                            <p className="flex items-center gap-2 flex-1 min-w-0">
                              <Text className="rounded-lg border-gray-200 border bg-gray-200 w-6 h-6 text-[12px] flex items-center justify-center flex-shrink-0">
                                {index + 1}.
                              </Text>
                              <span className="break-words">
                                {keyresult?.title}
                              </span>
                            </p>
                            <Text className="rounded-lg px-1 border-gray-200 border bg-gray-200 min-w-6 min-h-6 text-[12px] flex items-center justify-center flex-shrink-0 self-start sm:self-center">
                              {keyresult?.tasks?.reduce(
                                (taskWeight: number, task: any) => {
                                  return taskWeight + Number(task?.weight || 0);
                                },
                                0,
                              ) +
                                keyresult?.milestones?.reduce(
                                  (totalWeight: number, milestone: any) => {
                                    return (
                                      totalWeight +
                                      (milestone?.tasks?.reduce(
                                        (taskWeight: number, task: any) =>
                                          taskWeight +
                                          Number(task?.weight || 0),
                                        0,
                                      ) || 0)
                                    );
                                  },
                                  0,
                                ) || 0}
                              %
                            </Text>
                          </Row>
                          <Row className="flex mt-4 justify-between text-xs mb-2">
                            <p>{planningPeriodName + ' Tasks'}:</p>
                            <p>Point</p>
                          </Row>
                          {keyresult?.milestones?.map(
                            (milestone: any, milestoneIndex: number) =>
                              milestone?.tasks &&
                              milestone?.tasks?.length > 0 && (
                                <div
                                  key={milestoneIndex}
                                  className="mb-4 ml-2 sm:ml-4"
                                >
                                  <h4 className="font-semibold text-xs mb-2">
                                    {milestone?.title}
                                  </h4>
                                  {milestone?.tasks?.map(
                                    (task: any, milestoneTaskIndex: any) => (
                                      <div key={task.taskId} className="mb-4">
                                        <Form.Item
                                          name={[task.taskId, 'status']}
                                          className="mb-2"
                                          rules={[
                                            {
                                              required: true,
                                              message:
                                                'Please select a status!',
                                            },
                                          ]}
                                        >
                                          <div className="grid gap-2">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ml-1">
                                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-0 w-full">
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                  <Text className="rounded-lg border-gray-200 border bg-gray-200 min-w-6 min-h-6 text-[12px] flex items-center justify-center flex-shrink-0">
                                                    {index + 1}.
                                                    {milestoneTaskIndex + 1}
                                                  </Text>

                                                  <Radio.Group
                                                    className="text-xs"
                                                    onChange={(e) => {
                                                      setStatus(
                                                        task.taskId,
                                                        e.target.value,
                                                      );
                                                      if (
                                                        e.target.value ===
                                                        'Done'
                                                      ) {
                                                        form.setFieldsValue({
                                                          [task.taskId]: {
                                                            status:
                                                              e.target.value,
                                                            actualValue: Number(
                                                              task?.targetValue ??
                                                                0,
                                                            )?.toLocaleString(),
                                                          },
                                                        });
                                                      } else if (
                                                        e.target.value === 'Not'
                                                      ) {
                                                        form.setFieldsValue({
                                                          [task.taskId]: {
                                                            status:
                                                              e.target.value,
                                                            actualValue: 0,
                                                          },
                                                        });
                                                      }
                                                    }}
                                                    value={
                                                      selectedStatuses[
                                                        task.taskId
                                                      ]
                                                    }
                                                  >
                                                    <Radio value="Done">
                                                      Done
                                                    </Radio>
                                                    <Radio value="Not">
                                                      Not
                                                    </Radio>
                                                  </Radio.Group>
                                                </div>
                                                <Tooltip title={task.taskName}>
                                                  <span className="font-medium text-xs flex items-center gap-1 w-full sm:w-auto">
                                                    <span className="truncate block sm:inline">
                                                      {task.taskName?.length >=
                                                      50
                                                        ? task.taskName.slice(
                                                            0,
                                                            50,
                                                          ) + '...'
                                                        : task.taskName}
                                                    </span>
                                                    {task?.achieveMK && (
                                                      <FaStar
                                                        size={11}
                                                        className="flex-shrink-0"
                                                      />
                                                    )}
                                                  </span>
                                                </Tooltip>
                                              </div>

                                              <div className="flex items-center gap-2 self-end sm:self-center">
                                                <Tag
                                                  className="font-bold border-none w-16 text-center capitalize text-[10px]"
                                                  color={
                                                    task?.priority === 'high'
                                                      ? 'red'
                                                      : task?.priority ===
                                                          'medium'
                                                        ? 'orange'
                                                        : 'green'
                                                  }
                                                >
                                                  {task?.priority || 'None'}
                                                </Tag>
                                                <span className="rounded-lg border-gray-200 border bg-gray-200 min-w-6 min-h-6 px-1 text-[12px] flex items-center justify-center">
                                                  {task.weight}%
                                                </span>
                                              </div>
                                            </div>

                                            {keyresult?.metricType?.name !==
                                              NAME.ACHIEVE &&
                                              keyresult?.metricType?.name !==
                                                NAME.MILESTONE && (
                                                <Row className="flex flex-wrap gap-2">
                                                  <div className="text-xs">
                                                    Target
                                                    <Tag className="uppercase mt-1 ml-1 text-xs">
                                                      {Number(
                                                        task?.targetValue,
                                                      )?.toLocaleString()}
                                                    </Tag>
                                                  </div>
                                                  <div className="text-xs">
                                                    Actual
                                                    <Tag className="uppercase mt-1 ml-1 text-xs">
                                                      {Number(
                                                        task?.actualValue,
                                                      )?.toLocaleString()}
                                                    </Tag>
                                                  </div>
                                                </Row>
                                              )}
                                          </div>
                                        </Form.Item>
                                        {selectedStatuses[task.taskId] &&
                                          keyresult?.metricType?.name !==
                                            NAME.ACHIEVE &&
                                          keyresult?.metricType?.name !==
                                            NAME.MILESTONE && (
                                            <Form.Item
                                              key={`${task.taskId}-actualValue`}
                                              name={[
                                                task.taskId,
                                                'actualValue',
                                              ]}
                                              className="mb-2"
                                              label="Actual value:"
                                              rules={[
                                                {
                                                  validator(value: any) {
                                                    if (
                                                      !keyresult ||
                                                      !keyresult.targetValue ||
                                                      !keyresult.currentValue
                                                    ) {
                                                      return Promise.reject(
                                                        new Error(
                                                          'Key result data is incomplete.',
                                                        ),
                                                      );
                                                    }

                                                    if (
                                                      keyresult?.metricType
                                                        ?.name ===
                                                        NAME.ACHIEVE ||
                                                      keyresult?.metricType
                                                        ?.name ===
                                                        NAME.MILESTONE
                                                    ) {
                                                      return Promise.resolve();
                                                    }

                                                    if (
                                                      value === null ||
                                                      value === undefined
                                                    ) {
                                                      return Promise.reject(
                                                        new Error(
                                                          'Please enter a target value.',
                                                        ),
                                                      );
                                                    }

                                                    const numericValue =
                                                      Number(value);
                                                    if (isNaN(numericValue)) {
                                                      return Promise.reject(
                                                        new Error(
                                                          'Please enter a valid number.',
                                                        ),
                                                      );
                                                    }

                                                    if (
                                                      selectedStatuses[
                                                        task.taskId
                                                      ] === 'Done'
                                                    ) {
                                                      if (
                                                        numericValue >=
                                                        task?.targetValue
                                                      ) {
                                                        return Promise.resolve();
                                                      }
                                                    } else {
                                                      if (
                                                        numericValue <=
                                                        task?.targetValue
                                                      ) {
                                                        return Promise.resolve();
                                                      }

                                                      return Promise.reject(
                                                        new Error(
                                                          `Your actual value shouldn't exceed the allowed limits which is : ${Number(task?.targetValue)?.toLocaleString()}`,
                                                        ),
                                                      );
                                                    }
                                                  },
                                                },
                                              ]}
                                            >
                                              <InputNumber
                                                min={0}
                                                step={1}
                                                className="w-full"
                                                formatter={(value) => {
                                                  if (!value) return '';
                                                  const parts =
                                                    `${value}`.split('.');
                                                  parts[0] = parts[0].replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ',',
                                                  );
                                                  return parts.join('.');
                                                }}
                                                onChange={(e) => {
                                                  const value = e;
                                                  form.setFieldsValue({
                                                    [task.taskId]: {
                                                      actualValue: value
                                                        ? Number(value)
                                                        : '',
                                                    },
                                                  });
                                                }}
                                              />
                                            </Form.Item>
                                          )}
                                        {selectedStatuses[task.taskId] ===
                                          'Not' && (
                                          <Form.Item
                                            key={`${task.taskId}-comment`}
                                            name={[task.taskId, 'customReason']}
                                            className="mb-2"
                                            label="Reason:"
                                            rules={[
                                              {
                                                required: true,
                                                message:
                                                  'Please provide a comment!',
                                              },
                                            ]}
                                          >
                                            <div className="relative flex items-center">
                                              <TextArea
                                                rows={4}
                                                className="pr-4 sm:pr-24"
                                                placeholder="Enter reason here..."
                                              />
                                              <div className="hidden sm:block absolute right-20 top-0 bottom-0 w-px bg-gray-300" />
                                              <Text className="hidden sm:block text-black absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-xs">
                                                Reason
                                              </Text>
                                            </div>
                                          </Form.Item>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              ),
                          )}
                          {keyresult?.tasks?.map(
                            (task: any, tasksIndex: number) => (
                              <div key={task.id} className="mb-4 ml-2">
                                <Form.Item
                                  key={task.taskId}
                                  name={[task.taskId, 'status']}
                                  className="mb-2"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please select a status!',
                                    },
                                  ]}
                                >
                                  <div className="grid gap-2">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ml-1">
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-0 w-full">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                          <Text className="rounded-lg border-gray-200 border bg-gray-200 min-w-6 min-h-6 text-[12px] flex items-center justify-center flex-shrink-0">
                                            {index + 1}.{tasksIndex + 1}
                                          </Text>

                                          <Radio.Group
                                            className="text-xs"
                                            onChange={(e) => {
                                              setStatus(
                                                task.taskId,
                                                e.target.value,
                                              );
                                              if (e.target.value === 'Done') {
                                                form.setFieldsValue({
                                                  [task.taskId]: {
                                                    status: e.target.value,
                                                    actualValue: Number(
                                                      task?.targetValue ?? 0,
                                                    )?.toLocaleString(),
                                                  },
                                                });
                                              } else if (
                                                e.target.value === 'Not'
                                              ) {
                                                form.setFieldsValue({
                                                  [task.taskId]: {
                                                    status: e.target.value,
                                                    actualValue: 0,
                                                  },
                                                });
                                              }
                                            }}
                                            value={
                                              selectedStatuses[task.taskId]
                                            }
                                          >
                                            <Radio value="Done">Done</Radio>
                                            <Radio value="Not">Not</Radio>
                                          </Radio.Group>
                                        </div>
                                        <Tooltip title={task.taskName}>
                                          <span className="font-medium text-sm flex items-center gap-1 w-full sm:w-auto">
                                            <span className="truncate block sm:inline">
                                              {task.taskName}
                                            </span>
                                            {task?.achieveMK && (
                                              <MdKey
                                                size={12}
                                                className="flex-shrink-0"
                                              />
                                            )}
                                          </span>
                                        </Tooltip>
                                      </div>

                                      <div className="flex items-center gap-2 self-end sm:self-center">
                                        <Tag
                                          className="font-bold border-none w-16 text-center capitalize text-[10px]"
                                          color={
                                            task?.priority === 'high'
                                              ? 'red'
                                              : task?.priority === 'medium'
                                                ? 'orange'
                                                : 'green'
                                          }
                                        >
                                          {task?.priority || 'None'}
                                        </Tag>
                                        <span className="rounded-lg border-gray-200 border bg-gray-200 min-w-6 min-h-6 px-1 text-[12px] flex items-center justify-center">
                                          {task.weight}%
                                        </span>
                                      </div>
                                    </div>

                                    {keyresult?.metricType?.name !==
                                      NAME.ACHIEVE &&
                                      keyresult?.metricType?.name !==
                                        NAME.MILESTONE && (
                                        <Row>
                                          <div className="text-xs">
                                            Target
                                            <Tag className="uppercase mt-1 ml-1 text-xs">
                                              {Number(
                                                task?.targetValue,
                                              )?.toLocaleString()}
                                            </Tag>
                                          </div>
                                        </Row>
                                      )}
                                  </div>
                                </Form.Item>
                                {selectedStatuses[task.taskId] &&
                                  keyresult?.metricType?.name !==
                                    NAME.ACHIEVE &&
                                  keyresult?.metricType?.name !==
                                    NAME.MILESTONE && (
                                    <Form.Item
                                      key={`${task.taskId}-actualValue`}
                                      name={[task.taskId, 'actualValue']}
                                      className="mb-2"
                                      label="Actual value:"
                                      initialValue={
                                        Number(
                                          task?.actualValue,
                                        )?.toLocaleString() || 0
                                      }
                                      rules={[
                                        {
                                          validator(notused, value) {
                                            if (
                                              !keyresult ||
                                              !keyresult.targetValue
                                            ) {
                                              return Promise.reject(
                                                new Error(
                                                  'Key result data is incomplete.',
                                                ),
                                              );
                                            }

                                            if (
                                              value === null ||
                                              value === undefined
                                            ) {
                                              return Promise.reject(
                                                new Error(
                                                  'Please enter a target value.',
                                                ),
                                              );
                                            }

                                            const numericValue = Number(value);
                                            if (isNaN(numericValue)) {
                                              return Promise.reject(
                                                new Error(
                                                  'Please enter a valid number.',
                                                ),
                                              );
                                            }

                                            const statusValue =
                                              form.getFieldValue([
                                                task.taskId,
                                                'status',
                                              ]);
                                            if (
                                              statusValue === 'Done' &&
                                              numericValue < task?.targetValue
                                            ) {
                                              return Promise.reject(
                                                new Error(
                                                  `Value should be at least ${Number(task?.targetValue)?.toLocaleString()}`,
                                                ),
                                              );
                                            }

                                            if (
                                              statusValue === 'Not' &&
                                              numericValue > task?.targetValue
                                            ) {
                                              return Promise.reject(
                                                new Error(
                                                  `Actual value shouldn't exceed ${Number(task?.targetValue)?.toLocaleString()}`,
                                                ),
                                              );
                                            }

                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <InputNumber
                                        min={0}
                                        step={1}
                                        className="w-full"
                                        formatter={(value) =>
                                          `${value}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ',',
                                          )
                                        }
                                        onChange={(value) => {
                                          const statusValue =
                                            form.getFieldValue([
                                              task.taskId,
                                              'status',
                                            ]);
                                          if (statusValue === 'Done') {
                                            form.setFieldsValue({
                                              [task.taskId]: {
                                                actualValue: value
                                                  ? Number(value)
                                                  : task?.targetValue,
                                              },
                                            });
                                          } else if (statusValue === 'Not') {
                                            form.setFieldsValue({
                                              [task.taskId]: {
                                                actualValue: value
                                                  ? Number(value)
                                                  : 0,
                                              },
                                            });
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  )}
                                {selectedStatuses[task.taskId] === 'Not' && (
                                  <Form.Item
                                    key={`${task.taskId}-comment`}
                                    name={[task.taskId, 'customReason']}
                                    className="mb-2"
                                    label="Reason:"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please provide a comment!',
                                      },
                                    ]}
                                  >
                                    <TextArea rows={4} className="w-full" />
                                  </Form.Item>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      ),
                    )}
                  </Collapse.Panel>
                </Collapse>
              ))}
              <div className="flex items-center mt-2 gap-2 text-sm sm:text-base">
                <span className="text-black">Total Point:</span>
                <span
                  className={`font-semibold ${
                    totalWeight > 84
                      ? 'text-green-500'
                      : totalWeight >= 64
                        ? 'text-orange'
                        : 'text-red-500'
                  }`}
                >
                  {totalWeight}%
                </span>
              </div>
              <Row className="flex justify-center gap-3 mt-4">
                <Button
                  htmlType="button"
                  onClick={() => onClose()}
                  className="flex-1 sm:flex-none min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  loading={createReportLoading}
                  htmlType="submit"
                  className="bg-primary text-white flex-1 sm:flex-none min-w-[100px]"
                >
                  Create Report
                </Button>
              </Row>
            </Form>
          </Spin>
        ) : (
          <div className="flex justify-center items-center">
            <CustomizeRenderEmpty />
          </div>
        )}
      </CustomDrawerLayout>
    )
  );
}

export default CreateReport;
