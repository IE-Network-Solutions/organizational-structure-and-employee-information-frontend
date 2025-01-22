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
} from 'antd';

import {
  AllPlanningPeriods,
  useGetReportingById,
  useGetUnReportedPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { getPriorityColor } from '@/utils/showValidationErrors';
import {
  useCreateReportForUnReportedtasks,
  useEditReportByReportId,
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { NAME } from '@/types/enumTypes';
import { useEffect, useState } from 'react';
const { Text } = Typography;

const { TextArea } = Input;
function EditReport() {
  const {
    openReportModal,
    setOpenReportModal,
    activePlanPeriod,
    selectedReportId,
    setSelectedReportId,
    resetWeights,
    setStatus,
    selectedStatuses,
  } = PlanningAndReportingStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpenReportModal(false);
    setSelectedReportId('');
    form.resetFields();
    resetWeights();
  };

  const { data: planningPeriods } = AllPlanningPeriods();

  const { data: reportedData, isLoading: reportedDataLoading } =
    useGetReportingById(selectedReportId);
  const { mutate: editReport, isLoading: editReportLoading } =
    useEditReportByReportId();

  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const planningPeriodName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;

  const { data: allUnReportedPlanningTask } = useGetUnReportedPlanning(
    planningPeriodId,
    false,
  );

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {planningPeriodName}
    </div>
  );

  console.log(reportedData, 'allUnReportedPlanningTask');

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
    allUnReportedPlanningTask &&
    groupUnReportedTasksByKeyResultAndMilestone(allUnReportedPlanningTask);

  const totalWeight = formattedData?.reduce((sum: number, objective: any) => {
    return (
      sum +
      objective?.keyResults?.reduce((keyResultSum: number, keyResult: any) => {
        // Calculate the weight for keyResult.tasks array
        const taskWeight = keyResult?.tasks?.reduce(
          (taskSum: number, task: any) => {
            if (selectedStatuses[task.taskId] !== 'Not') {
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
                if (selectedStatuses[task.taskId] !== 'Not') {
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

  useEffect(() => {
    if (reportedData?.reportTask && reportedData?.reportTask?.length > 0) {
      reportedData?.reportTask?.map((task: any) => {
        setStatus(task.planTaskId, task?.status);
      });
      const data = reportedData.reportTask.reduce((acc: any, task: any) => {
        acc[task.id] = {
          status: task?.status ?? '', // Use existing status or empty string
          actualValue: Number(task?.actualValue ?? 0), // Default to 0 if null/undefined
          customReason: task?.customReason ?? '', // Default to empty string
        };
        return acc;
      }, {});

      form.setFieldsValue(data); // Dynamically set form values
    }
  }, [reportedData, form]);

  return (
    selectedReportId !== '' && (
      <CustomDrawerLayout
        open={selectedReportId !== ''}
        onClose={onClose}
        modalHeader={modalHeader}
        width="65%"
      >
        {formattedData?.length > 0 ? (
          <Spin
            spinning={editReportLoading || reportedDataLoading}
            tip="Reporting..."
          >
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
                                  {milestone?.tasks?.map((task: any) => (
                                    <>
                                      <Form.Item
                                        key={task.taskId}
                                        // name={[task.taskId, 'status']}
                                        className="mb-2"
                                        rules={[
                                          {
                                            required: true,
                                            message: 'Please select a status!',
                                          },
                                        ]} // Add validation rule
                                      >
                                        <div className="grid">
                                          <div className="flex items-center justify-between ml-1">
                                            {/* Radio Group for Status */}
                                            <div className="flex  items-center  space-x-2">
                                              <Text className="rounded-lg border-gray-200 border bg-gray-200 min-w-6 min-h-6 text-[12px] flex items-center justify-center">
                                                {index + 1}.{milestoneIndex + 1}
                                                .
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
                                                  selectedStatuses[task.taskId]
                                                } // Bind value from Zustand
                                              >
                                                <Radio value="Done">Done</Radio>
                                                <Radio value="Not">Not</Radio>
                                              </Radio.Group>
                                              <Tooltip title={task.taskName}>
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
                                            {keyresult?.metricType?.name ===
                                              NAME.ACHIEVE && (
                                              <div className="text-xs">
                                                Target
                                                <Tag className="uppercase mt-1 ml-1 test-xs">
                                                  {task?.targetValue}
                                                </Tag>
                                              </div>
                                            )}
                                          </Row>
                                        </div>
                                      </Form.Item>
                                      {/* Actual Value Form Item, with both conditions */}
                                      {selectedStatuses[task.taskId] ===
                                        'Not' &&
                                        keyresult?.metricType?.name !==
                                          NAME.ACHIEVE &&
                                        keyresult?.metricType?.name !==
                                          NAME.MILESTONE && (
                                          <Form.Item
                                            key={`${task.taskId}-actualValue`}
                                            name={[task.taskId, 'actualValue']}
                                            className="mb-1"
                                            label="Actual value:" // Optional label
                                            rules={[
                                              {
                                                required: true,
                                                message:
                                                  'Please enter an actual value!',
                                              },
                                              {
                                                validator: (rule, value) => {
                                                  if (!value) {
                                                    return Promise.reject(
                                                      new Error(
                                                        'Please enter an actual value!',
                                                      ),
                                                    );
                                                  }
                                                  if (isNaN(value)) {
                                                    return Promise.reject(
                                                      new Error(
                                                        'The input is not a valid number!',
                                                      ),
                                                    );
                                                  }
                                                  return Promise.resolve();
                                                },
                                              },
                                            ]}
                                          >
                                            <Input
                                              width="50%"
                                              type="number"
                                              min={0}
                                              step={1}
                                              onChange={(e) => {
                                                const value = e.target.value;
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
                                      {selectedStatuses[task.taskId] ===
                                        'Not' && (
                                        <Form.Item
                                          key={`${task.taskId}-comment`}
                                          name={[task.taskId, 'customReason']}
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
                                              className="text-white bg-primary"
                                              style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                padding: '8px 16px', // 2x (vertical) and 4x (horizontal) assuming x = 4px
                                                borderRadius: '8px', // Rounded corners, adjust as needed
                                                transform: 'translateY(-50%)',
                                              }}
                                            >
                                              Reason
                                            </Text>
                                          </div>
                                        </Form.Item>
                                      )}
                                    </>
                                  ))}
                                </div>
                              ),
                          )}
                          {keyresult?.tasks?.map(
                            (task: any, tasksIndex: number) => (
                              <div key={task.id} className="mb-4 ml-2">
                                <Form.Item
                                  key={task.taskId}
                                  // name={[task.taskId, 'status']}
                                  className="mb-2"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please select a status!',
                                    },
                                  ]} // Add validation rule
                                >
                                  <div className="grid">
                                    <div className="flex items-center justify-between ml-1">
                                      {/* Radio Group for Status */}
                                      <div className="flex  items-center  space-x-2">
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
                                          value={selectedStatuses[task.taskId]} // Bind value from Zustand
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
                                          <span className="font-medium text-xs truncate">
                                            {task.taskName?.length >= 40
                                              ? task.taskName?.slice(0, 40)
                                              : task.taskName}
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
                                                : task?.priority === 'medium'
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
                                      {keyresult?.metricType?.name ===
                                        NAME.ACHIEVE && (
                                        <div className="text-xs">
                                          Target
                                          <Tag className="uppercase mt-1 ml-1 test-xs">
                                            {task?.targetValue}
                                          </Tag>
                                        </div>
                                      )}
                                    </Row>
                                  </div>
                                </Form.Item>
                                {/* Actual Value Form Item, with both conditions */}
                                {selectedStatuses[task.taskId] === 'Not' &&
                                  keyresult?.metricType?.name !==
                                    NAME.ACHIEVE &&
                                  keyresult?.metricType?.name !==
                                    NAME.MILESTONE && (
                                    <Form.Item
                                      key={`${task.taskId}-actualValue`}
                                      name={[task.taskId, 'actualValue']}
                                      className="mb-2"
                                      label="Actual value:" // Optional label
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Please enter an actual value!', // Show if the field is empty
                                        },
                                        {
                                          validator: (
                                            _, // eslint-disable-line @typescript-eslint/naming-convention
                                            value, // eslint-disable-line @typescript-eslint/naming-convention
                                          ) => {
                                            // eslint-disable-next-line no-underscore-dangle
                                            if (value && isNaN(value)) {
                                              return Promise.reject(
                                                new Error(
                                                  'The input is not a valid number!',
                                                ), // Show if the value is not a number
                                              );
                                            }
                                            return Promise.resolve(); // Proceed to next rule if the value is valid
                                          },
                                        },
                                      ]}
                                    >
                                      <Input
                                        width="50%"
                                        type="number"
                                        min={0}
                                        step={1}
                                        onChange={(e) => {
                                          const value = e.target.value;
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
                                {selectedStatuses[task.taskId] === 'Not' && (
                                  <Form.Item
                                    key={`${task.taskId}-comment`}
                                    name={[task.taskId, 'customReason']}
                                    className="mb-2"
                                    label="Reason:" // Optional label
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please provide a comment!',
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
                                        className="text-white bg-primary"
                                        style={{
                                          position: 'absolute',
                                          right: '10px',
                                          top: '50%',
                                          padding: '8px 16px', // 2x (vertical) and 4x (horizontal) assuming x = 4px
                                          borderRadius: '8px', // Rounded corners, adjust as needed
                                          transform: 'translateY(-50%)',
                                        }}
                                      >
                                        Reason
                                      </Text>
                                    </div>
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

export default EditReport;
