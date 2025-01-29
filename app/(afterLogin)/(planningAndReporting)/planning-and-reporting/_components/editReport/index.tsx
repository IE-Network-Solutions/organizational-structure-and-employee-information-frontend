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

  // const planningPeriodId =
  //   planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const planningPeriodName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;

  const { data: allReportedPlanning } = useGetReportedPlanning(selectedPlanId);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
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
    groupUnReportedTasksByKeyResultAndMilestone(allReportedPlanning);

  useEffect(() => {
    // Ensure there is reportedData and valid reportTask array
    if (reportedData?.reportTask?.length > 0) {
      // Map reportedData to a formatted structure
      const formattedData = reportedData.reportTask.reduce(
        (acc: any, task: any) => {
          acc[task.planTaskId] = {
            status: task?.status ?? '', // Use existing status or empty string
            actualValue: Number(task?.actualValue ?? 0), // Default to 0 if null/undefined
            customReason: task?.customReason ?? '', // Default to empty string
          };
          return acc;
        },
        {},
      );

      // Dynamically set form values
      form.setFieldsValue(formattedData);

      // Update individual status for each task
      reportedData.reportTask.forEach((task: any) => {
        setStatus(task.planTaskId, {
          status: task?.status ?? '',
          actualValue: Number(task?.actualValue ?? 0),
          customReason: task?.customReason ?? '',
        });
      });
    }
  }, [reportedData, selectedReportId, form]); // Add dependencies that should trigger re-runs

  const totalWeight = formattedData?.reduce((sum: number, objective: any) => {
    return (
      sum +
      objective?.keyResults?.reduce((keyResultSum: number, keyResult: any) => {
        // Calculate the weight for keyResult.tasks array
        const taskWeight = keyResult?.tasks?.reduce(
          (taskSum: number, task: any) => {
            if (form.getFieldValue([task.taskId, 'status']) === 'Done') {
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
                if (form.getFieldValue([task.taskId, 'status']) === 'Done') {
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
  return (
    selectedReportId !== '' && (
      <CustomDrawerLayout
        open={selectedReportId !== ''}
        onClose={onClose}
        modalHeader={modalHeader}
        width="65%"
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
                            <Row className="flex justify-between text-xs">
                              <p>Key Result:</p>
                              <p>Weight</p>
                            </Row>
                            <Row className="flex justify-between">
                              <p className="flex items-center gap-2">
                                <Text className="rounded-lg border-gray-200 border bg-gray-200 w-6 h-6 text-[12px] flex items-center justify-center">
                                  {index + 1}.
                                </Text>
                                {keyresult?.title}
                              </p>
                              <Text className="rounded-lg px-1   border-gray-200 border bg-gray-200 min-w-6 min-h-6 text-[12px] flex items-center justify-center">
                                {
                                  // Calculate weight from keyResult.tasks
                                  keyresult?.tasks?.reduce(
                                    (taskWeight: number, task: any) => {
                                      return (
                                        taskWeight + Number(task?.weight || 0)
                                      );
                                    },
                                    0,
                                  ) +
                                    // Calculate weight from keyResult.milestones.tasks
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
                                    ) || 0
                                }
                                %
                              </Text>
                            </Row>
                            <Row className="flex mt-4 justify-between text-xs">
                              <p>{planningPeriodName + ' Tasks'}:</p>
                              <p>Point</p>
                            </Row>
                            {keyresult?.milestones?.map(
                              (milestone: any, milestoneIndex: number) =>
                                milestone?.tasks &&
                                milestone?.tasks?.length > 0 && (
                                  <div
                                    key={milestoneIndex}
                                    className="mb-4 ml-4"
                                  >
                                    <h4 className="font-semibold text-xs mb-1">
                                      {milestone?.title}
                                    </h4>
                                    {milestone?.tasks?.map(
                                      (task: any, taskIndex: number) => (
                                        <>
                                          <Form.Item
                                            key={task.taskId}
                                            name={[task.taskId, 'status']}
                                            className="mb-2"
                                            rules={[
                                              {
                                                required: true,
                                                message:
                                                  'Please select a status!',
                                              },
                                            ]} // Add validation rule
                                          >
                                            <div className="grid">
                                              <div className="flex items-center justify-between ml-1">
                                                {/* Radio Group for Status */}
                                                <div className="flex  items-center  space-x-2">
                                                  <Text className="rounded-lg border-gray-200 border bg-gray-200 min-w-6 min-h-6 text-[12px] flex items-center justify-center">
                                                    {index + 1}.{taskIndex + 1}.
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
                                                    // Bind value from Zustand
                                                  >
                                                    <Radio value="Done">
                                                      Done
                                                    </Radio>
                                                    <Radio value="Not">
                                                      Not
                                                    </Radio>
                                                  </Radio.Group>
                                                  <Tooltip
                                                    title={task.taskName}
                                                  >
                                                    <span className="font-medium text-xs truncate">
                                                      {task.taskName}
                                                    </span>
                                                  </Tooltip>
                                                </div>

                                                {/* Task Details */}
                                                <div className="flex items-center space-y-1">
                                                  {/* Task Name */}

                                                  {/* Priority and Value */}
                                                  <div className="flex items-center space-x-2">
                                                    <Tag
                                                      className="font-bold border-none w-16  text-center capitalize text-[10px]"
                                                      color={
                                                        task?.priority ===
                                                        'high'
                                                          ? 'red'
                                                          : task?.priority ===
                                                              'medium'
                                                            ? 'orange'
                                                            : 'green'
                                                      }
                                                    >
                                                      {task?.priority || 'None'}
                                                    </Tag>
                                                    <span className="rounded-lg border-gray-200 border bg-gray-200 mni-w-6 min-h-6 px-1 text-[12px] flex items-center justify-center">
                                                      {task.weight || 0}%
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              <Row>
                                                {keyresult?.metricType?.name ===
                                                  NAME.ACHIEVE && (
                                                  <div className="text-xs">
                                                    Target
                                                    <Tag className="uppercase mt-1 ml-1 test-xs">
                                                      {Number(
                                                        task?.targetValue,
                                                      )?.toLocaleString()}
                                                    </Tag>
                                                  </div>
                                                )}
                                              </Row>
                                            </div>
                                          </Form.Item>
                                          {/* Actual Value Form Item, with both conditions */}

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
                                                label="Actual value:" // Optional label
                                                rules={[
                                                  {
                                                    /* eslint-disable @typescript-eslint/naming-convention */
                                                    validator(_, value: any) {
                                                      /* eslint-enable @typescript-eslint/naming-convention */
                                                      // Check if keyResult is available
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

                                                      // Skip validation for specific metric types
                                                      if (
                                                        keyresult?.metricType
                                                          ?.name ===
                                                          NAME.ACHIEVE ||
                                                        keyresult?.metricType
                                                          ?.name ===
                                                          NAME.MILESTONE
                                                      ) {
                                                        return Promise.resolve(); // Skip validation
                                                      }

                                                      // Handle null or undefined value
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

                                                      // Ensure value is a valid number
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
                                                          return Promise.resolve(); // Validation passed
                                                        }
                                                      } else {
                                                        // Fallback check if targetValue does not exist
                                                        if (
                                                          numericValue <=
                                                          task?.targetValue
                                                        ) {
                                                          return Promise.resolve(); // Validation passed
                                                        }

                                                        // If neither condition is satisfied and the status is not 'Done', reject the promise
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
                                                  formatter={(value) =>
                                                    `${value}`.replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      ',',
                                                    )
                                                  }
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
                                          {/* Comment Form Item, only with the 'Not' status condition */}
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
                                              label="Reason:" // Optional label
                                              rules={[
                                                {
                                                  required: true,
                                                  message:
                                                    'Please provide a comment!',
                                                },
                                              ]}
                                            >
                                              <div
                                                style={{
                                                  position: 'relative',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <TextArea
                                                  rows={4}
                                                  style={{
                                                    paddingRight: '100px',
                                                    flex: 1,
                                                  }}
                                                />
                                                <div
                                                  style={{
                                                    position: 'absolute',
                                                    right: '100px',
                                                    top: '0',
                                                    bottom: '0',
                                                    width: '1px',
                                                    backgroundColor: '#ccc',
                                                  }}
                                                />
                                                <Text
                                                  className="text-black"
                                                  style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    padding: '8px 16px', // 2x (vertical) and 4x (horizontal) assuming x = 4px
                                                    borderRadius: '8px', // Rounded corners, adjust as needed
                                                    transform:
                                                      'translateY(-50%)',
                                                  }}
                                                >
                                                  Reason
                                                </Text>
                                              </div>
                                            </Form.Item>
                                          )}
                                        </>
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
                                    <div className="grid">
                                      <div className="flex items-center justify-between ml-1">
                                        {/* Status Selection */}
                                        <div className="flex items-center space-x-2">
                                          <Text className="rounded-lg border-gray-200 border bg-gray-200 min-w-6 min-h-6 text-[12px] flex items-center justify-center">
                                            {index + 1}.{tasksIndex + 1}
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
                                          <Tooltip title={task.taskName}>
                                            <span className="font-medium text-sm truncate flex items-center gap-1">
                                              {task.taskName?.length >= 40
                                                ? task.taskName?.slice(0, 40)
                                                : task.taskName}
                                              {task?.achieveMK && (
                                                <MdKey size={12} />
                                              )}
                                            </span>
                                          </Tooltip>
                                        </div>

                                        {/* Task Details */}
                                        <div className="flex items-center space-x-2">
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

                                      {/* Conditional Target Display */}
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

                                  {/* Actual Value Field (Only When Required) */}
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
                                          onChange={(value) =>
                                            form.setFieldsValue({
                                              [task.taskId]: {
                                                actualValue: value
                                                  ? Number(value)
                                                  : '',
                                              },
                                            })
                                          }
                                        />
                                      </Form.Item>
                                    )}

                                  {/* Reason Field (Only When Status is "Not") */}
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
                <div className="flex items-center mt-2 gap-2">
                  <span className="text-black">Total Point:</span>
                  <span
                    className={`${
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
                <Row className="flex justify-center space-x-4 mt-4">
                  <Button htmlType="button" onClick={() => onClose()}>
                    Cancel
                  </Button>
                  <Button
                    loading={editReportLoading}
                    htmlType="submit"
                    className="bg-primary text-white"
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
