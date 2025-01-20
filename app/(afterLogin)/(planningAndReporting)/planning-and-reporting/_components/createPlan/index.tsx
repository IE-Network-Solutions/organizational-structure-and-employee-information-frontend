import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Collapse, Divider, Form, Tooltip } from 'antd';
import { BiPlus } from 'react-icons/bi';
import BoardCardForm from '../planForms/boardFormView';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import DefaultCardForm from '../planForms/defaultForm';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { AllPlanningPeriods, useGetPlanningPeriodsHierarchy } from '@/store/server/features/okrPlanningAndReporting/queries';
import { FaPlus } from 'react-icons/fa';
import { NAME } from '@/types/enumTypes';
import { Milestone } from 'lucide-react';

function CreatePlan() {
  const {
    open,
    setOpen,
    weights,
    totalWeight,
    activePlanPeriod,
    isEditing,
    setWeight,
    mkAsATask,
    setMKAsATask,
    resetWeights,
  } = PlanningAndReportingStore();
  const { userId } = useAuthenticationStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    resetWeights();
  };
  const { mutate: createTask, isLoading } = useCreatePlanTasks();
  const { data: objective } = useFetchObjectives(userId);
  const { data: planningPeriods } = AllPlanningPeriods();
  const planningPeriodId =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
    const { data: planningPeriodHierarchy } = useGetPlanningPeriodsHierarchy(
      userId,
      planningPeriodId || '' // Provide a default string value if undefined
    );
    

  // Ensure planningPeriods is always an array before using find
  const safePlanningPeriods = Array.isArray(planningPeriods)
    ? planningPeriods
    : [];

  // Use find safely
  const planningUserId = safePlanningPeriods.find(
    (item: any) => item.planningPeriod?.id == planningPeriodId,
  )?.id;

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
  const handleOnFinish = (values: Record<string, any>) => {
    const mergeValues = (obj: any) => {
      return Object.entries(obj)
        .filter(([key]) => key.startsWith('names-'))
        .map(([, value]) => value)
        .filter((value) => Array.isArray(value))
        .flat();
    };
    const finalValues = mergeValues(values);
    console.log(finalValues,"finalValues")
    createTask(
      { tasks: finalValues },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
  };
  console.log(userId,
    planningPeriodId,planningPeriodHierarchy,"planningPeriodHierarchy")
return (
    open && (
      <CustomDrawerLayout
        open={open === true && isEditing === false ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width={'60%'}
        paddingBottom={10}
      >
        <Form
          layout="vertical"
          form={form}
          name="dynamic_form_item"
          onFinish={handleOnFinish}
        >
          {planningPeriodHierarchy?.parentPlan==null?
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
                                <span className="font-bold">Key Result: </span>
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
                                        onClick={() => handleAddBoard(kr?.id)}
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
                                            size="small"
                                            className="text-[10px] text-primary"
                                            icon={<FaPlus />}
                                            onClick={() => {
                                              setMKAsATask(kr?.title);
                                              handleAddBoard(kr?.id);
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                      <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                                        {weights[`names-${kr?.id}`] || 0}%
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
                                                handleAddBoard(kr?.id + ml?.id);
                                              }}
                                              type="link"
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
                                                  size="small"
                                                  className="text-[10px] text-primary"
                                                  icon={<FaPlus />}
                                                  onClick={() => {
                                                    setMKAsATask(ml?.title);
                                                    handleAddBoard(
                                                      kr?.id + ml?.id,
                                                    );
                                                  }}
                                                />
                                              </Tooltip>
                                            )}

                                            <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                                              {weights[
                                                `names-${kr?.id + ml?.id}`
                                              ] || 0}
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
                                                hasTargetValue={hasTargetValue}
                                                hasMilestone={hasMilestone}
                                                milestoneId={ml?.id}
                                                name={`names-${kr?.id + ml?.id}`}
                                                form={form}
                                                planningPeriodId={
                                                  planningPeriodId
                                                }
                                                userId={userId}
                                                planningUserId={planningUserId}
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
          </Collapse>: 
         <Collapse defaultActiveKey={0}>
         {planningPeriodHierarchy?.parentPlan?.plans?.map(
           (plan: Record<string, any>, panelIndex: number) => (
             <Collapse.Panel
               header={
                 <div>
                   <strong>Plan Name:</strong> {plan.name}
                 </div>
               }
               key={panelIndex}
             >
               <div className="flex flex-col justify-between">
                 {/* Iterate over tasks within each plan */}
                 {plan?.tasks?.map((task: Record<string, any>, taskIndex: number) => (
                   <div key={taskIndex}>
                     <div className="flex items-center  ">
                       <span className="font-bold">Key Result:</span>
                       <span className={`text-sm font-normal ${task?.keyResult?.title}`}>
                         {task?.keyResult?.title}
                       </span>
                     </div>
                    
                     {task?.milestone && (
                       <div className="flex items-center justify-between ml-2">
                        <div>

                        <span className="font-bold">Milestone:</span>
                         <span className="text-xs">{task.milestone.title}</span>
                         </div>
                        
                       </div>
                     )}
                       <span className="font-bold">Task:</span>
                     <div className="flex  items-center mb-2 justify-between">
                      
                      <div className='flex items-center gap-1'> 
                    
                       <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                         {taskIndex + 1}.
                       </span>
                     
                       <span className="text-[12px] font-normal">{task.task}</span>
                      
                       </div>
                       <div className='flex items-center'>
                       <Button
                        onClick={() => {
                          setMKAsATask(null);
                          handleAddBoard(task?.keyResult?.id + task?.milestone?.id);
                          console.log(task?.keyResult?.id + task?.milestone?.id,"dink new")
                        }}
                        type="link"
                        icon={<BiPlus size={14} />}
                        iconPosition="start"
                        className="text-[10px]"
                      >
                        Add Plan Task
                      </Button>
                       <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                     
                       {weights[
                                                `names-${task?.keyResult?.id + task?.milestone?.id}`
                                              ] || 0}
                                              %
                        </div>
                        </div>
                     </div>
                     <Divider className="my-2" />
                     {/* Iterate over milestones within each task */}
                    
                     <DefaultCardForm
                                                kId={task?.keyResult?.id}
                                                // hasTargetValue={hasTargetValue}
                                                // hasMilestone={hasMilestone}
                                                milestoneId={task?.milestone?.id}
                                                name={`names-${task?.keyResult?.id + task?.milestone?.id}`}
                                                form={form}
                                                planningPeriodId={
                                                  planningPeriodId || ''
                                                }
                                                userId={userId}
                                                parentPlanId={
                                                  plan.id || ''
                                                  }

                                                planningUserId={planningUserId || ''}
                                                planTaskId={task.id || ''}
                                                isMKAsTask={
                                                  mkAsATask ? true : false
                                                }
                                                keyResult={task?.keyResult}
                                                targetValue={task?.targetValue}
                                              />
                  <BoardCardForm
                  form={form}
                  handleAddName={handleAddName}
                  handleRemoveBoard={
                    handleRemoveBoard
                  }
                  kId={task?.keyResult?.id}
                  // hideTargetValue={hasTargetValue}
                  name={task?.keyResult?.id + task?.milestone?.id}
                  isMKAsTask={
                    mkAsATask ? true : false
                  }
                  keyResult={task?.keyResult}
                  targetValue={task?.targetValue}
                />
                   </div>
                 ))}
               </div>
             </Collapse.Panel>
           )
         )}
       </Collapse>
       
        }

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

export default CreatePlan;
