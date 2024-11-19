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
} from 'antd';

import {
  AllPlanningPeriods,
  useGetUnReportedPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { getPriorityColor } from '@/utils/showValidationErrors';
import { useCreateReportForUnReportedtasks } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { NAME } from '@/types/enumTypes';
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
  const { mutate: createReport ,isLoading:createReportLoading} = useCreateReportForUnReportedtasks();

  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const planningPeriodName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;

  const { data: allUnReportedPlanningTask } =
    useGetUnReportedPlanning(planningPeriodId);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {planningPeriodName}
    </div>
  );

  const handleOnFinish = (values: Record<string, any>) => {
    Object.entries(values).length > 0 &&
    planningPeriodId &&
      createReport(
        { values: values, planningPeriodId: planningPeriodId },
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

  return (
    openReportModal && (
      <CustomDrawerLayout
        open={openReportModal === true && isEditing === false ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width="50%"
      >
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
                          <p>
                            <Text className="mx-2 text-xs">{index ?? 0}.</Text>
                            {keyresult?.title}
                          </p>
                          <Text className="ml-2 text-xs">
                            {keyresult?.weight ?? 0}%
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
                                <h4 className="font-semibold text-xs mb-2">
                                  {milestone?.title}
                                </h4>
                                {milestone?.tasks?.map((task: any) => (
                                  <>
                                    <Form.Item
                                      key={task.taskId}
                                      name={[task.taskId, 'status']}
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
                                          <Row>
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
                                              <Radio value={'Done'}>Done</Radio>
                                              <Radio value={'Not'}>Not</Radio>
                                            </Radio.Group>
                                          </Row>
                                          <Tooltip title={task.taskName}>
                                            <span className="font-medium text-xs">
                                              {task.taskName.length > 20
                                                ? `${task.taskName.substring(0, 20)}...`
                                                : task.taskName}
                                            </span>
                                          </Tooltip>
                                          <Tag
                                            color={getPriorityColor(
                                              task.priority,
                                            )}
                                            className="uppercase"
                                          >
                                            {task.priority}
                                          </Tag>
                                          <span className="text-gray-600">
                                            {task.actualValue}
                                          </span>
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
                                        name={[task.taskId, 'comment']}
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
                                key={tasksIndex}
                                name={[task.taskId, 'status']}
                                className="mb-2"
                              >
                                <div className="grid">
                                  <div className="flex items-center justify-between ml-1">
                                    <Row>
                                      <Radio.Group
                                        className="text-xs"
                                        onChange={(e) =>
                                          setStatus(task.taskId, e.target.value)
                                        }
                                        value={selectedStatuses[task.taskId]}
                                      >
                                        <Radio value={'Done'}>Done</Radio>
                                        <Radio value={'Not'}>Not</Radio>
                                      </Radio.Group>
                                    </Row>
                                    <Tooltip title={task.taskName}>
                                      <span className="font-medium text-xs">
                                        {task.taskName.length > 20
                                          ? `${task.taskName.substring(0, 20)}...`
                                          : task.taskName}
                                      </span>
                                    </Tooltip>
                                    <Tag
                                      color={getPriorityColor(task.priority)}
                                      className="uppercase"
                                    >
                                      {task.priority}
                                    </Tag>
                                    <span className="text-gray-600">
                                      {task.actualValue}
                                    </span>
                                  </div>
                                  <div className="text-xs">
                                    Target
                                    <Tag className="uppercase mt-1 ml-1 test-xs">
                                      {task?.targetValue}
                                    </Tag>
                                  </div>
                                </div>
                              </Form.Item>
                              {/* Actual Value Form Item, with both conditions */}
                              {selectedStatuses[task.taskId] === 'Not' &&
                                keyresult?.metricType?.name !== NAME.ACHIEVE &&
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
                                        message: 'Please enter an actual value!', // Show if the field is empty
                                      },
                                      {
                                        validator: (_, value) => {
                                          if (value && isNaN(value)) {
                                            return Promise.reject(new Error('The input is not a valid number!')); // Show if the value is not a number
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
                                  name={[task.taskId, 'comment']}
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
                                      style={{ paddingRight: '100px', flex: 1 }}
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
            <Row className="flex justify-center space-x-4 mt-4">
              <Button htmlType="button" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button loading={createReportLoading} htmlType="submit" className="bg-primary text-white">
                Create Report
              </Button>
            </Row>
          </Form>
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
