import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Collapse, Divider, Form, Spin, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { BiPlus } from 'react-icons/bi';
import BoardCardForm from '../planForms/boardFormView';
import { useUpdatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import DefaultCardForm from '../planForms/defaultForm';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  AllPlanningPeriods,
  useGetPlanningById,
  useGetPlanningPeriodsHierarchy,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { FaPlus } from 'react-icons/fa';
import { NAME } from '@/types/enumTypes';
import { groupParentTasks } from '../dataTransformer/plan';

function EditPlan() {
  const {
    open,
    setOpen,
    weights,
    activePlanPeriod,
    isEditing,
    setEditing,
    selectedPlanId,
    setSelectedPlanId,
    setWeight,
    resetWeights,
    totalWeight,
    mkAsATask,
    setMKAsATask,
  } = PlanningAndReportingStore();
  const { userId } = useAuthenticationStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpen(false);
    setEditing(false);
    setSelectedPlanId('');
    resetWeights();

    form.resetFields();
  };
  const { mutate: updateTask, isLoading } = useUpdatePlanTasks();

  const { data: objective } = useFetchObjectives(userId);
  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: planGroupData, isLoading: loadingPlanGroupData } =
    useGetPlanningById(selectedPlanId);

  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const planningUserId = Array.isArray(planningPeriods)
    ? planningPeriods.find(
        (item: any) => item.planningPeriod?.id === planningPeriodId,
      )?.id
    : undefined;
  const {
    data: planningPeriodHierarchy,
    isLoading: loadingPlanningPeriodHierarchy,
  } = useGetPlanningPeriodsHierarchy(
    userId,
    planningPeriodId || '', // Provide a default string value if undefined
  );
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Edit {planningPeriodHierarchy ? planningPeriodHierarchy.name : ''} Plan
    </div>
  );

  const handleAddName = (
    currentBoardValues: Record<string, string | number>,
    kId: string,
  ) => {
    const namesKey = `names-${kId}`;
    const names = form.getFieldValue(namesKey) || [];
    currentBoardValues = { ...currentBoardValues, planId: planGroupData?.id };
    form.setFieldsValue({ [namesKey]: [...names, currentBoardValues] });
    const fieldValue = form.getFieldValue(namesKey);
    const totalWeight = fieldValue.reduce(
      (sum: number, field: { weight?: number }) => {
        return Number(sum) + Number(field?.weight ?? 0);
      },
      0,
    );

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

  const handleOnFinish = (values: Record<string, any>) => {
    const mergeValues = (obj: any) => {
      return Object.entries(obj)
        .filter(([key]) => key.startsWith('names-'))
        .map(([, value]) => value)
        .filter((value) => Array.isArray(value))
        .flat();
    };
    const finalValues = mergeValues(values);
    updateTask(
      { tasks: finalValues },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
  };
  const selectParentId = planningPeriodHierarchy?.planData?.find(
    (i: any) => i.id === selectedPlanId,
  )?.parentPlan?.id;
  useEffect(() => {
    const processTasks = (
      tasks: any[],
      planningUserId: string,
      userId: string,
      planningPeriodId: string,
      planId: string,
    ) => {
      if (!tasks) return;

      const uniqueTaskIds = new Set();

      tasks.forEach((e: any) => {
        const hasMilestone = e?.milestone !== null;

        const name = hasMilestone
          ? `${e?.keyResult?.id + e?.milestone?.id + (e?.parentTaskId || '')}`
          : `${e?.keyResult?.id + (e?.parentTaskId || '')}`;

        // Avoid duplicate tasks
        if (!uniqueTaskIds.has(e?.id)) {
          uniqueTaskIds.add(e?.id);

          handleAddName(
            {
              id: e?.id,
              milestoneId: e?.milestone?.id,
              keyResultId: e?.keyResult?.id,
              planningPeriodId,
              planningUserId,
              userId: userId || '',
              task: e?.task || '',
              priority: e?.priority || '',
              weight: parseInt(e?.weight, 10) || 0,
              targetValue: e?.targetValue || 0,
              achieveMK: e?.achieveMK,
              planId,
            },
            name,
          );
        }
      });
    };

    if (!planGroupData) return;

    const planningUserId = planGroupData?.planningUser?.id;
    const userId = planGroupData?.planningUser?.userId;
    const planningPeriodId = planGroupData?.planningUser?.planningPeriod?.id;

    let tasks: any[] = [];

    if (planningPeriodHierarchy?.parentPlan) {
      tasks =
        planningPeriodHierarchy?.planData?.find(
          (i: any) => i.id === selectedPlanId,
        )?.tasks || [];
    } else {
      tasks = planGroupData.tasks || [];
    }

    processTasks(
      tasks,
      planningUserId,
      userId,
      planningPeriodId,
      planGroupData?.id,
    );
  }, [
    planningPeriodHierarchy?.parentPlan,
    selectedPlanId,
    planGroupData,
    selectParentId,
  ]);

  const formattedData = groupParentTasks(
    planningPeriodHierarchy?.parentPlan?.plans?.find(
      (i: any) => i.id === selectParentId,
    )?.tasks || [],
  );
  const parentParentId = planningPeriodHierarchy?.parentPlan?.plans?.find(
    (i: any) => i.id === selectParentId,
  )?.id;

  return (
    open && (
      <CustomDrawerLayout
        open={open === true && isEditing === true ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width="70%"
        paddingBottom={5}
      >
        {loadingPlanningPeriodHierarchy || loadingPlanGroupData ? (
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" tip="Loading...." />
          </div>
        ) : (
          <Form
            layout="vertical"
            form={form}
            name="dynamic_form_item"
            onFinish={handleOnFinish}
          >
            {planningPeriodHierarchy?.parentPlan == null ? (
              <Collapse defaultActiveKey={0}>
                {objective?.items?.map(
                  (e: Record<string, any>, panelIndex: number) => {
                    return (
                      <Collapse.Panel
                        header={
                          <div>
                            <strong>Objective:</strong> {e.title}
                          </div>
                        }
                        key={panelIndex}
                      >
                        {e?.keyResults?.map(
                          (kr: Record<string, any>, resultIndex: number) => {
                            const hasMilestone =
                              kr?.milestones && kr?.milestones?.length > 0
                                ? true
                                : false;
                            const hasTargetValue =
                              kr?.metricType?.name === NAME.ACHIEVE ||
                              kr?.metricType?.name === NAME.MILESTONE
                                ? true
                                : false;
                            return (
                              <>
                                <div
                                  className="flex flex-col justify-between"
                                  key={resultIndex}
                                >
                                  <div className="flex justify-between">
                                    <span className="font-bold">
                                      Key Result:{' '}
                                    </span>
                                    <span className="font-bold">Weight </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                                        {resultIndex + 1}{' '}
                                      </span>
                                      <span className="text-[12px] font-semibold">
                                        {kr?.title}
                                      </span>
                                    </div>

                                    {hasMilestone ? (
                                      <></>
                                    ) : (
                                      <>
                                        <div className="flex gap-3 items-center">
                                          <Button
                                            onClick={() =>
                                              handleAddBoard(kr?.id)
                                            }
                                            type="link"
                                            icon={<BiPlus />}
                                            iconPosition="start"
                                            className="text-[10px]"
                                          >
                                            Add Plan Task
                                          </Button>
                                          {kr?.metricType?.name ===
                                            NAME.ACHIEVE && (
                                            <Tooltip
                                              className=" ml-5"
                                              title="Plan keyResult as a Task"
                                            >
                                              <Button
                                                disabled={
                                                  kr?.progress == '100' ||
                                                  (form?.getFieldValue(
                                                    `names-${kr?.id}`,
                                                  ) == undefined
                                                    ? false
                                                    : form?.getFieldValue(
                                                        `names-${kr?.id}`,
                                                      )[resultIndex]?.achieveMK)
                                                }
                                                size="small"
                                                className="text-[10px] text-primary"
                                                icon={<FaPlus />}
                                                onClick={() => {
                                                  setMKAsATask({
                                                    title: kr?.title,
                                                    mid: kr?.id,
                                                  });
                                                  handleAddBoard(kr?.id);
                                                }}
                                              />
                                            </Tooltip>
                                          )}
                                          <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                                            {Number(
                                              weights[`names-${kr?.id}`] || 0,
                                            )}
                                            %
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {hasMilestone ? (
                                  <>
                                    {kr?.milestones?.map(
                                      (ml: Record<string, any>) => {
                                        return (
                                          <>
                                            <div className="flex  items-center justify-between">
                                              <span className="text-xs">
                                                {ml?.title}
                                              </span>
                                              <div className="flex gap-2 items-center">
                                                <Button
                                                  onClick={() => {
                                                    setMKAsATask(null);
                                                    handleAddBoard(
                                                      kr?.id + ml?.id,
                                                    );
                                                  }}
                                                  type="link"
                                                  disabled={
                                                    ml?.status === 'Completed'
                                                  }
                                                  icon={<BiPlus size={14} />}
                                                  iconPosition="start"
                                                  className="text-[10px]"
                                                >
                                                  Add Plan Task
                                                </Button>

                                                {kr?.metricType?.name ===
                                                  NAME.MILESTONE && (
                                                  <Tooltip title="Plan Milestone as a Task">
                                                    <Button
                                                      disabled={
                                                        ml?.status ===
                                                          'Completed' ||
                                                        (form?.getFieldValue(
                                                          `names-${kr?.id + ml?.id}`,
                                                        ) == undefined
                                                          ? false
                                                          : form?.getFieldValue(
                                                              `names-${kr?.id + ml?.id}`,
                                                            )[resultIndex]
                                                              ?.achieveMK)
                                                      }
                                                      size="small"
                                                      className="text-[10px] text-primary"
                                                      icon={<FaPlus />}
                                                      onClick={() => {
                                                        setMKAsATask({
                                                          title: ml?.title,
                                                          mid: kr?.id,
                                                        });
                                                        handleAddBoard(
                                                          kr?.id + ml?.id,
                                                        );
                                                      }}
                                                    />
                                                  </Tooltip>
                                                )}

                                                <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                                                  {Number(
                                                    weights[
                                                      `names-${kr?.id + ml?.id}`
                                                    ] || 0,
                                                  )}
                                                  %
                                                </div>
                                              </div>
                                            </div>
                                            <>
                                              <Divider className="my-2" />
                                              {planningPeriodId &&
                                                planningUserId && (
                                                  <DefaultCardForm
                                                    kId={kr?.id}
                                                    hasTargetValue={
                                                      hasTargetValue
                                                    }
                                                    hasMilestone={hasMilestone}
                                                    milestoneId={ml?.id}
                                                    name={`names-${kr?.id + ml?.id}`}
                                                    form={form}
                                                    planningPeriodId={
                                                      planningPeriodId
                                                    }
                                                    userId={userId}
                                                    planningUserId={
                                                      planningUserId
                                                    }
                                                    isMKAsTask={
                                                      mkAsATask ? true : false
                                                    }
                                                    keyResult={kr}
                                                  />
                                                )}
                                              <BoardCardForm
                                                form={form}
                                                handleAddName={handleAddName}
                                                handleRemoveBoard={
                                                  handleRemoveBoard
                                                }
                                                kId={kr?.id}
                                                hideTargetValue={hasTargetValue}
                                                name={kr?.id + ml?.id}
                                                isMKAsTask={
                                                  mkAsATask ? true : false
                                                }
                                                keyResult={kr}
                                              />
                                            </>
                                          </>
                                        );
                                      },
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <Divider className="my-2" />
                                    {planningPeriodId && planningUserId && (
                                      <DefaultCardForm
                                        kId={kr?.id}
                                        hasTargetValue={hasTargetValue}
                                        hasMilestone={hasMilestone}
                                        milestoneId={null}
                                        name={`names-${kr?.id}`}
                                        form={form}
                                        planningPeriodId={planningPeriodId}
                                        userId={userId}
                                        planningUserId={planningUserId}
                                        isMKAsTask={mkAsATask ? true : false}
                                        keyResult={kr}
                                      />
                                    )}
                                    <BoardCardForm
                                      form={form}
                                      handleAddName={handleAddName}
                                      handleRemoveBoard={handleRemoveBoard}
                                      kId={kr?.id}
                                      hideTargetValue={hasTargetValue}
                                      name={kr?.id}
                                      isMKAsTask={mkAsATask ? true : false}
                                      keyResult={kr}
                                    />
                                  </>
                                )}
                              </>
                            );
                          },
                        )}
                      </Collapse.Panel>
                    );
                  },
                )}
              </Collapse>
            ) : (
              <Collapse defaultActiveKey={0}>
                {formattedData.map((objective) => (
                  <Collapse.Panel
                    header={
                      <div>
                        <strong>Objective:</strong> {objective.title}
                      </div>
                    }
                    key={objective.id}
                  >
                    <div className="flex flex-col justify-between">
                      {objective.keyResults.map((keyResult) => (
                        <div key={keyResult.id}>
                          <div className="flex items-center mt-2">
                            <span className="font-bold">Key Result:</span>
                            <span className="text-sm font-normal ml-2">
                              {keyResult.title}
                            </span>
                          </div>

                          {keyResult.milestones.map((milestone) => (
                            <div key={milestone.id} className="ml-4 mt-2">
                              <div className="flex items-center">
                                <span className="font-bold">Milestone:</span>
                                <span className="text-xs ml-2">
                                  {milestone.title}
                                </span>
                              </div>
                              {/* <div className="flex items-center">
                            <span className="font-normal  ml-3 mt-2">{parentName} Tasks:</span>
                            
                          </div> */}
                              {milestone.tasks.map((task, taskIndex) => (
                                <div key={task.id} className="ml-4">
                                  <div className="flex items-center mb-2 justify-between">
                                    <div className="flex items-center gap-1">
                                      <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                                        {taskIndex + 1}.
                                      </span>
                                      <span className="text-[12px] font-normal">
                                        {task.task}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Button
                                        onClick={() => {
                                          setMKAsATask(null);
                                          handleAddBoard(
                                            `${keyResult.id}${milestone.id}${task.id}`,
                                          );
                                        }}
                                        type="link"
                                        icon={<BiPlus size={14} />}
                                        className="text-[10px]"
                                      >
                                        Add Plan Task
                                      </Button>
                                      <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                                        {weights[
                                          `names-${keyResult.id}${milestone.id}${task.id}`
                                        ] || 0}
                                        %
                                      </div>
                                    </div>
                                  </div>
                                  <Divider className="my-2" />

                                  <DefaultCardForm
                                    kId={task?.keyResult?.id}
                                    milestoneId={task?.milestone?.id ?? null}
                                    name={`names-${task?.keyResult?.id + task?.milestone?.id + task?.id}`}
                                    form={form}
                                    planningPeriodId={planningPeriodId || ''}
                                    userId={userId}
                                    parentPlanId={parentParentId || ''}
                                    planningUserId={planningUserId || ''}
                                    planTaskId={task.id || ''}
                                    isMKAsTask={!!mkAsATask}
                                    keyResult={task?.keyResult}
                                    targetValue={task?.targetValue}
                                  />
                                  <BoardCardForm
                                    form={form}
                                    handleAddName={(arg1, arg2) =>
                                      handleAddName(arg1, arg2)
                                    }
                                    handleRemoveBoard={handleRemoveBoard}
                                    kId={task?.keyResult?.id}
                                    name={
                                      task?.keyResult?.id +
                                      (task?.milestone?.id || '') +
                                      task?.id
                                    }
                                    isMKAsTask={!!mkAsATask}
                                    keyResult={task?.keyResult}
                                    targetValue={task?.targetValue}
                                  />
                                </div>
                              ))}
                            </div>
                          ))}

                          {/* <div className="flex items-center">
                            <span className="font-normal  ml-3 mt-2">{parentName} Tasks:</span>
                            
                          </div> */}
                          {keyResult.tasks.map((task, taskIndex) => (
                            <div key={task.id} className="ml-4 mt-2">
                              <div className="flex items-center mb-2 justify-between">
                                <div className="flex items-center gap-1">
                                  <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                                    {taskIndex + 1}.
                                  </span>
                                  <span className="text-[12px] font-normal">
                                    {task.task}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    onClick={() => {
                                      setMKAsATask(null);
                                      handleAddBoard(
                                        `${keyResult.id}${task.id}`,
                                      );
                                    }}
                                    type="link"
                                    icon={<BiPlus size={14} />}
                                    className="text-[10px]"
                                  >
                                    Add Plan Task
                                  </Button>
                                  <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                                    {weights[
                                      `names-${keyResult.id}${task.id}`
                                    ] || 0}
                                    %
                                  </div>
                                </div>
                              </div>
                              <Divider className="my-2" />

                              <DefaultCardForm
                                kId={task?.keyResult?.id}
                                milestoneId={task?.milestone?.id ?? null}
                                name={`names-${task?.keyResult?.id + task?.id}`}
                                form={form}
                                planningPeriodId={planningPeriodId || ''}
                                userId={userId}
                                parentPlanId={parentParentId || ''}
                                planningUserId={planningUserId || ''}
                                planTaskId={task.id || ''}
                                isMKAsTask={!!mkAsATask}
                                keyResult={task?.keyResult}
                                targetValue={task?.targetValue}
                              />
                              <BoardCardForm
                                form={form}
                                handleAddName={(arg1, arg2) =>
                                  handleAddName(arg1, arg2)
                                }
                                handleRemoveBoard={handleRemoveBoard}
                                kId={task?.keyResult?.id}
                                name={
                                  task?.keyResult?.id +
                                  (task?.milestone?.id || '') +
                                  task?.id
                                }
                                isMKAsTask={!!mkAsATask}
                                keyResult={task?.keyResult}
                                targetValue={task?.targetValue}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </Collapse.Panel>
                ))}
              </Collapse>
            )}

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
        )}
      </CustomDrawerLayout>
    )
  );
}

export default EditPlan;
