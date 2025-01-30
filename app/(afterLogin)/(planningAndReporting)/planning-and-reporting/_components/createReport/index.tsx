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
  AllPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { useCreateReportForUnReportedtasks } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { NAME } from '@/types/enumTypes';
import { FaStar } from 'react-icons/fa';
import { MdKey } from 'react-icons/md';
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
    selectedStatuses,
  } = PlanningAndReportingStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpenReportModal(false);
    form.resetFields();
    resetWeights();
  };
  const { data: planningPeriods } = AllPlanningPeriods();
  const { mutate: createReport, isLoading: createReportLoading } =
    useCreateReportForUnReportedtasks();

  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const planningPeriodName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;

  // const { data: allUnReportedPlanningTask } =
  //   useGetUnReportedPlanning(planningPeriodId,activeTab);

  const {
    data: allPlannedTaskForReport,
    isLoading: plannedTaskForReportLoading,
  } = useGetPlannedTaskForReport(planningPeriodId);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
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
  return (
    openReportModal && (
      <CustomDrawerLayout
        open={openReportModal === true && isEditing === false ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width="65%"
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
                                <div key={milestoneIndex} className="mb-4 ml-4">
                                  <h4 className="font-semibold text-xs mb-1">
                                    {milestone?.title}
                                  </h4>
                                  {milestone?.tasks?.map(
                                    (task: any, milestoneTaskIndex: any) => (
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
                                                  {index + 1}.
                                                  {milestoneTaskIndex + 1}
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
                                                    selectedStatuses[
                                                      task.taskId
                                                    ]
                                                  } // Bind value from Zustand
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
                                                    {task.taskName?.length >=
                                                    100
                                                      ? task.taskName?.slice(
                                                          0,
                                                          100,
                                                        ) + '...'
                                                      : task.taskName}
                                                    {task?.achieveMK ? (
                                                      <FaStar size={11} />
                                                    ) : (
                                                      ''
                                                    )}
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
                                                  <span className="rounded-lg border-gray-200 border bg-gray-200 mni-w-6 min-h-6 px-1 text-[12px] flex items-center justify-center">
                                                    {task.weight}%
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            <Row>
                                              {keyresult?.metricType?.name !==
                                                NAME.ACHIEVE &&
                                                keyresult?.metricType?.name !==
                                                  NAME.MILESTONE && (
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
                                          onChange={(e) => {
                                            setStatus(
                                              task.taskId,
                                              e.target.value,
                                            );
                                            if (e.target.value === 'Done') {
                                              form.setFieldsValue({
                                                [task.taskId]: {
                                                  actualValue:
                                                    task?.targetValue,
                                                },
                                              });
                                            } else if (
                                              e.target.value === 'Not'
                                            ) {
                                              form.setFieldsValue({
                                                [task.taskId]: {
                                                  actualValue: 0,
                                                },
                                              });
                                            }
                                          }}
                                          value={selectedStatuses[task.taskId]}
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

                                {/* Reason Field (Only When Status is "Not") */}
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
                  loading={createReportLoading}
                  htmlType="submit"
                  className="bg-primary text-white"
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
