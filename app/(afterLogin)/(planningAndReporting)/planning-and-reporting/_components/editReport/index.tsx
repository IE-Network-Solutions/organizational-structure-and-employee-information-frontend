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
  Spin,
  InputNumber,
} from 'antd';

import {
  AllPlanningPeriods,
  useGetReportedPlanning,
  useGetReportingById,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { useEditReportByReportId } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { NAME } from '@/types/enumTypes';
import { useEffect } from 'react';
import { MdKey } from 'react-icons/md';

const { Text } = Typography;
const { TextArea } = Input;

function EditReport() {
  const {
    setOpenReportModal,
    activePlanPeriod,
    selectedReportId,
    setSelectedReportId,
    setSelectedPlanId,
    selectedPlanId,
    resetWeights,
    setStatus,
    selectedStatuses,
  } = PlanningAndReportingStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpenReportModal(false);
    setSelectedReportId('');
    setSelectedPlanId('');
    form.resetFields();
    resetWeights();
  };

  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: reportedData, isLoading: reportedDataLoading } =
    useGetReportingById(selectedReportId);
  const { mutate: editReport, isLoading: editReportLoading } =
    useEditReportByReportId();

  const planningPeriodName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;

  const { data: allReportedPlanning } = useGetReportedPlanning(selectedPlanId);

  const modalHeader = (
    <div className="flex justify-center text-base sm:text-xl font-extrabold text-gray-800 p-4">
      Update {planningPeriodName} Report
    </div>
  );

  const handleOnFinish = (values: Record<string, any>) => {
    Object.entries(values).length > 0 &&
      editReport(
        { values: values, selectedReportId },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
  };

  const formattedData =
    allReportedPlanning &&
    groupUnReportedTasksByKeyResultAndMilestone(
      allReportedPlanning?.length == 0 ? [] : allReportedPlanning,
    );

  useEffect(() => {
    if (reportedData?.reportTask?.length > 0) {
      const formattedData = reportedData.reportTask.reduce(
        (acc: any, task: any) => {
          acc[task.planTaskId] = {
            status: task?.status ?? '',
            actualValue: Number(task?.actualValue ?? 0),
            customReason: task?.customReason ?? '',
          };
          return acc;
        },
        {},
      );

      form.setFieldsValue(formattedData);

      reportedData.reportTask.forEach((task: any) => {
        setStatus(task.planTaskId, {
          status: task?.status ?? '',
          actualValue: Number(task?.actualValue ?? 0),
          customReason: task?.customReason ?? '',
        });
      });
    }
  }, [reportedData, selectedReportId, form]);

  const totalWeight = formattedData?.reduce((sum: number, objective: any) => {
    return (
      sum +
      objective?.keyResults?.reduce((keyResultSum: number, keyResult: any) => {
        const taskWeight = keyResult?.tasks?.reduce(
          (taskSum: number, task: any) => {
            if (form.getFieldValue([task.taskId, 'status']) === 'Done') {
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
                if (form.getFieldValue([task.taskId, 'status']) === 'Done') {
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
    selectedReportId !== '' && (
      <CustomDrawerLayout
        open={selectedReportId !== ''}
        onClose={onClose}
        modalHeader={modalHeader}
        width="95%"
      >
        <Spin
          spinning={editReportLoading || reportedDataLoading}
          tip="Reporting..."
        >
          <>
            {formattedData?.length > 0 ? (
              <Form
                layout="vertical"
                form={form}
                name="dynamic_form_item"
                onFinish={handleOnFinish}
              >
                {formattedData?.map((objective: any, resultIndex: number) => (
                  <Collapse defaultActiveKey={0} key={resultIndex}>
                    <Collapse.Panel header={objective.title} key={1}>
                      {objective?.keyResults?.map(
                        (keyresult: any, index: number) => (
                          <>
                            <Row className="flex justify-between text-xs mb-1">
                              <p>Key Result:</p>
                              <p>Weight</p>
                            </Row>
                            <Row className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
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
                                    return (
                                      taskWeight + Number(task?.weight || 0)
                                    );
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
                                      (task: any, taskIndex: number) => (
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
                                                      {taskIndex + 1}.
                                                    </Text>
                                                    <Radio.Group
                                                      className="text-xs"
                                                      onChange={(e) =>
                                                        setStatus(
                                                          task.taskId,
                                                          e.target.value,
                                                        )
                                                      }
                                                      value={
                                                        form.getFieldValue([
                                                          task.taskId,
                                                          'status',
                                                        ]) || ''
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
                                                  <Tooltip
                                                    title={task.taskName}
                                                  >
                                                    <span className="font-medium text-xs truncate block w-full sm:w-auto">
                                                      {task.taskName}
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
                                                    {task.weight || 0}%
                                                  </span>
                                                </div>
                                              </div>

                                              {keyresult?.metricType?.name ===
                                                NAME.ACHIEVE && (
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

                                          {keyresult?.metricType?.name !==
                                            NAME.ACHIEVE &&
                                            keyresult?.metricType?.name !==
                                              NAME.MILESTONE && (
                                              <Form.Item
                                                key={`${task.taskId}-actualValue`}
                                                name={[
                                                  task.taskId,
                                                  'actualValue',
                                                ]}
                                                className="mb-1"
                                                label="Actual value:"
                                                rules={[
                                                  {
                                                    validator(
                                                      rule,
                                                      value: any,
                                                    ) {
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
                                                        form.getFieldValue([
                                                          task.taskId,
                                                          'status',
                                                        ]) === 'Done'
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
                                                  width="50%"
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
                                                  value={form.getFieldValue([
                                                    task.taskId,
                                                    'actualValue',
                                                  ])}
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

                                          {form.getFieldValue([
                                            task.taskId,
                                            'status',
                                          ]) === 'Not' && (
                                            <Form.Item
                                              key={`${task.taskId}-comment`}
                                              name={[
                                                task.taskId,
                                                'customReason',
                                              ]}
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
                                                      actualValue:
                                                        task?.targetValue,
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
                                                form.getFieldValue([
                                                  task.taskId,
                                                  'status',
                                                ]) || ''
                                              }
                                            >
                                              <Radio
                                                className="text-xs"
                                                value="Done"
                                              >
                                                Done
                                              </Radio>
                                              <Radio
                                                className="text-xs"
                                                value="Not"
                                              >
                                                Not
                                              </Radio>
                                            </Radio.Group>
                                          </div>
                                          <Tooltip title={task.taskName}>
                                            <span className="font-medium text-sm truncate flex items-center gap-1">
                                              <span className="truncate max-w-[200px] sm:max-w-none">
                                                {task.taskName?.length >= 40
                                                  ? task.taskName?.slice(0, 40)
                                                  : task.taskName}
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
                                        rules={[
                                          {
                                            validator(rule, value) {
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

                                              const numericValue =
                                                Number(value);
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

                                  {form.getFieldValue([task.id, 'status']) ===
                                    'Not' && (
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
                          </>
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
                    loading={editReportLoading}
                    htmlType="submit"
                    className="bg-primary text-white flex-1 sm:flex-none min-w-[100px]"
                  >
                    Edit Report
                  </Button>
                </Row>
              </Form>
            ) : (
              <div className="flex justify-center items-center">
                <CustomizeRenderEmpty />
              </div>
            )}
          </>
        </Spin>
      </CustomDrawerLayout>
    )
  );
}

export default EditReport;
