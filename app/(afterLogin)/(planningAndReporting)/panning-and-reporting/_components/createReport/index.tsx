import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  Button,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tooltip,
} from 'antd';
import { BiPlus } from 'react-icons/bi';
import BoardCardForm from '../planForms/boardFormView';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import DefaultCardForm from '../planForms/defaultForm';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  AllPlanningPeriods,
  useGetPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useEffect } from 'react';

function CreateReport() {
  const {
    openReportModal,
    setOpenReportModal,
    weights,
    totalWeight,
    activePlanPeriod,
    isEditing,
    selectedUser,
    setWeight,
    resetWeights,
  } = PlanningAndReportingStore();
  const { userId } = useAuthenticationStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpenReportModal(false);
    form.resetFields();
    resetWeights();
  };
  const { mutate: createTask, isLoading } = useCreatePlanTasks();
  const { data: objective } = useFetchObjectives(userId);
  const { data: planningPeriods } = AllPlanningPeriods();
  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const planningUserId = planningPeriods?.find(
    (item: any) => item.planningPeriod?.id == planningPeriodId,
  )?.id;
  const { data: allPlans } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId,
  });

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create New plan
    </div>
  );

  const handleAddName = (
    currentBoardValues: Record<string, string>,
    kId: string,
  ) => {
    const namesKey = `names-${kId}`;
    const names = form.getFieldValue(namesKey) || [];
    form.setFieldsValue({ [namesKey]: [...names, currentBoardValues] });
    const fieldValue = form.getFieldValue(namesKey);
    const totalWeight = fieldValue.reduce((sum: number, field: any) => {
      return sum + (field.weight || 0);
    }, 0);
    setWeight(namesKey, totalWeight);
  };
  const handleAddBoard = (kId: string) => {
    const boardsKey = `board-${kId}`;
    const board = form.getFieldValue(boardsKey) || [];
    form.setFieldsValue({ [boardsKey]: [...board, {}] });
  };
  const handleRemoveBoard = (index: number, kId: string) => {
    const boardsKey = `board-${kId}`;

    const boards = form.getFieldValue(boardsKey) || [];
    if (index > -1 && index < boards.length) {
      boards.splice(index, 1);
      form.setFieldsValue({ [boardsKey]: boards });
    }
  };
  const handleOnFinish = (values: Record<string, any>) => {};
  console.log(allPlans, 'pp');

  useEffect(() => {
    console.log(allPlans, 'ppssssssssss');
    let planGroupData = allPlans?.find((e: any) => {
      return e.isReported === false;
    });
    if (planGroupData) {
      console.log(planGroupData, 'ppp');

      const planningUserId = planGroupData?.planningUser?.id;
      const userId = planGroupData?.planningUser?.userId;
      const planningPeriodId = planGroupData?.planningUser?.planningPeriod?.id;

      planGroupData.tasks?.forEach((e: any) => {
        const hasMilestone = e?.milestone !== null ? true : false;
        // const name = hasMilestone
        //   ? `${e?.keyResult?.id + e?.milestone?.id}`
        //   : `${e?.keyResult?.id}`;

        const name = `${e?.keyResult?.id}`;

        handleAddName(
          {
            id: e?.id,
            milestoneId: e?.milestone?.id || null,
            keyResultId: e?.keyResult?.id || null,
            planningPeriodId: planningPeriodId || null,
            planningUserId: planningUserId || null,
            userId: userId || null,
            task: e?.task || '',
            priority: e?.priority || '',
            weight: e?.weight || 0,
            targetValue: e?.targetValue || 0,
            planId: planGroupData?.id,
          },
          name,
        );
      });
    }
  }, [allPlans]);
  return (
    openReportModal && (
      <CustomDrawerLayout
        open={openReportModal === true && isEditing === false ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width="40%"
        paddingBottom={5}
      >
        <Form
          layout="vertical"
          form={form}
          name="dynamic_form_item"
          onFinish={handleOnFinish}
        >
          <Collapse defaultActiveKey={0}>
            {objective?.items?.map(
              (e: Record<string, any>, panelIndex: number) => {
                return (
                  <Collapse.Panel header={e.title} key={panelIndex}>
                    {e?.keyResults?.map(
                      (kr: Record<string, any>, resultIndex: number) => {
                        const hasMilestone =
                          kr?.milestones && kr?.milestones?.length > 0
                            ? true
                            : false;
                        const hasTargetValue =
                          kr?.metricType?.name === 'Achieve' ||
                          kr?.metricType?.name === 'Milestone'
                            ? true
                            : false;
                        return (
                          <>
                            {' '}
                            <div
                              className="flex justify-between"
                              key={resultIndex}
                            >
                              <h4>{kr?.title}</h4>
                            </div>
                            <>
                              {' '}
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleAddBoard(kr?.id)}
                                  type="link"
                                  icon={<BiPlus />}
                                  iconPosition="start"
                                >
                                  Add Plan Task
                                </Button>
                                <div>
                                  Total Weight:
                                  {weights[`names-${kr?.id}`] || 0}
                                </div>
                              </div>
                              <Divider className="my-2" />
                              <Form.List name={`names-${kr?.id}`}>
                                {(fields, { remove }, { errors }) => (
                                  <>
                                    {fields.map((field) => (
                                      <Form.Item
                                        required={false}
                                        key={field.key}
                                      >
                                        <Form.Item
                                          {...field}
                                          name={[
                                            field.name,
                                            'planningPeriodId',
                                          ]}
                                          initialValue={planningPeriodId}
                                          noStyle
                                          key={`${field.key}-planningPeriodId`} // Unique key for planningPeriodId
                                        >
                                          <Input
                                            type="hidden"
                                            value={planningPeriodId}
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          {...field}
                                          name={[field.name, 'planningUserId']}
                                          initialValue={planningUserId}
                                          noStyle
                                          key={`${field.key}-planningUserId`} // Unique key for planningUserId
                                        >
                                          <Input
                                            type="hidden"
                                            value={planningUserId}
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          {...field}
                                          name={[field.name, 'userId']}
                                          initialValue={userId}
                                          noStyle
                                          key={`${field.key}-userId`} // Unique key for userId
                                        >
                                          <Input type="hidden" value={userId} />
                                        </Form.Item>

                                        <Row gutter={8}>
                                          <Col lg={12} sm={24}>
                                            <Form.Item
                                              {...field}
                                              name={[field.name, 'task']}
                                              validateTrigger={[
                                                'onChange',
                                                'onBlur',
                                              ]}
                                              rules={[
                                                {
                                                  required: true,
                                                  whitespace: true,
                                                  message:
                                                    'Please input a task name or delete this field.',
                                                },
                                              ]}
                                              label={'Task'}
                                              key={`${field.key}-task`} // Unique key for task
                                            >
                                              <Input
                                                placeholder="Task name"
                                                style={{
                                                  border: 'none',
                                                  backgroundColor:
                                                    'transparent',
                                                }}
                                              />
                                            </Form.Item>
                                          </Col>
                                          <Col lg={12} sm={24}>
                                            <Space>
                                              <Form.Item
                                                {...field}
                                                name={[field.name, 'priority']}
                                                label={'Priority'}
                                                validateTrigger={[
                                                  'onChange',
                                                  'onBlur',
                                                ]}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message:
                                                      'Please select a priority',
                                                  },
                                                ]}
                                                key={`${field.key}-priority`} // Unique key for priority
                                              >
                                               
                                              </Form.Item>

                                              <Form.Item
                                                {...field}
                                                label={'Weight'}
                                                name={[field.name, 'weight']}
                                                validateTrigger={[
                                                  'onChange',
                                                  'onBlur',
                                                ]}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message:
                                                      'Please input a number',
                                                  },
                                                ]}
                                                key={`${field.key}-weight`} // Unique key for weight
                                              >
                                                {/* <InputNumber
                                                  placeholder="0"
                                                  onChange={() => {
                                                    const fieldValue =
                                                      form.getFieldValue(
                                                        name,
                                                      ) || [];
                                                    const totalWeight =
                                                      fieldValue.reduce(
                                                        (
                                                          sum: number,
                                                          field: any,
                                                        ) =>
                                                          sum +
                                                          (field.weight || 0),
                                                        0,
                                                      );
                                                    setWeight(
                                                      name,
                                                      totalWeight,
                                                    );
                                                  }}
                                                  min={0}
                                                  max={100}
                                                /> */}
                                              </Form.Item>
                                            </Space>
                                          </Col>
                                        </Row>

                                        <Form.Item
                                          className="my-4"
                                          label={'Target Amount'}
                                          {...field}
                                          name={[field.name, 'targetValue']}
                                          hidden={hasTargetValue}
                                          key={`${field.key}-targetValue`} // Unique key for targetValue
                                        >
                                          <InputNumber
                                            min={0}
                                            formatter={(value) =>
                                              `${value}`.replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ',',
                                              )
                                            }
                                          />
                                        </Form.Item>
                                      </Form.Item>
                                    ))}

                                    <Form.Item>
                                      <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                  </>
                                )}
                              </Form.List>
                            </>
                          </>
                        );
                      },
                    )}
                  </Collapse.Panel>
                );
              },
            )}
          </Collapse>

          <Form.Item className="mt-10">
            <div className="my-2">Total Weights:{totalWeight} / 100</div>

            <Tooltip
              title={
                totalWeight !== 100
                  ? "Summation of all task's weights must be equal to 100!"
                  : 'Submit'
              }
            >
              <Button
                className="mr-5 py-6 px-10"
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={totalWeight !== 100}
              >
                Submit
              </Button>
            </Tooltip>

            <Button
              className="py-6 px-10"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
}

export default CreateReport;
