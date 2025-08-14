import React from 'react';
import { Collapse, Button, Divider, Tooltip } from 'antd';
import { BiPlus } from 'react-icons/bi';
import BoardCardForm from '../planForms/boardFormView';
import DefaultCardForm from '../planForms/defaultForm';
import { groupParentTasks } from '../dataTransformer/plan';
import { FaPlus } from 'react-icons/fa';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';

interface Plan {
  id: string;
  name: string;
  tasks: Task[];
}

interface Task {
  id: string;
  task: string;
  keyResult: {
    id: string;
    title: string;
    objective: {
      id: string;
      title: string;
    };
  };
  milestone?: {
    id: string;
    title: string;
  };
  targetValue?: any;
}

interface CollapseComponentProps {
  planningPeriodHierarchy: {
    parentPlan: {
      id: string;
      name: string;
      plans: Plan[];
    };
  };
  form: any;
  planningPeriodId: string;
  userId: string;
  planningUserId: string;
  mkAsATask?: boolean;
  setMKAsATask: (value: any) => void;
  handleAddBoard: (id: string) => void;
  handleAddName: (arg1: Record<string, string>, arg2: string) => void;
  handleRemoveBoard: (arg1: number, arg2: string) => void;
  weights: Record<string, number>;
}

const PlanningHierarchyComponent: React.FC<CollapseComponentProps> = ({
  planningPeriodHierarchy,
  form,
  planningPeriodId,
  userId,
  planningUserId,
  mkAsATask,
  setMKAsATask,
  handleAddBoard,
  handleAddName,
  handleRemoveBoard,
  weights,
}) => {
  const formattedData = groupParentTasks(
    planningPeriodHierarchy?.parentPlan?.plans?.find(
      (i: any) => i.isReported === false,
    )?.tasks || [],
  );
  // const parentName = planningPeriodHierarchy?.parentPlan?.name;
  // const parentParentId = planningPeriodHierarchy?.parentPlan?.plans[0]?.id;
  const parentParentId = planningPeriodHierarchy?.parentPlan?.plans?.find(
    (i: any) => i.isReported === false,
  )?.id;
  const { statuses, setClickStatus } = useClickStatus();

  const buildKey = (
    keyResultId?: string | number,
    milestoneId?: string | number | null,
    taskId?: string | number | null,
  ) => `${String(keyResultId ?? '')}${String(milestoneId ?? '')}${String(taskId ?? '')}`;

  return (
    <Collapse>
      {formattedData.map((objective) => (
        <Collapse.Panel
          forceRender={true}
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
                      <span className="text-xs ml-2">{milestone.title}</span>
                    </div>
                    {/* <div className="flex items-center">
                    <span className="font-normal  ml-3 mt-2">{parentName} Tasks:</span>
                    
                  </div> */}
                    {milestone.tasks.map((task, taskIndex) => {
                      const compositeKey = buildKey(task?.keyResult?.id, milestone?.id, task?.id);
                      return (
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
                                id={`plan-as-task_${keyResult?.id ?? ''}${milestone?.id ?? ''}${task?.id ?? ''}`}
                                disabled={
                                  statuses[milestone?.id] ||
                                      milestone?.status === 'Completed' ||
                                      Number(keyResult?.progress) === 100 ||
                                      ((form?.getFieldValue(`names-${compositeKey}`)?.length ?? 0) > 0) ||
                                      form?.getFieldValue(`names-${compositeKey}`)?.some((i: any) => i?.achieveMK)
                                    
                                }
                                onClick={() => {
                                  setMKAsATask(null);
                                  handleAddBoard(compositeKey);
                                }}
                                type="link"
                                icon={<BiPlus size={12} />}
                                className="text-[10px]"
                              >
                                Add Plan Task
                              </Button>
                              {task?.achieveMK && (
                                <Tooltip title="Plan Milestone as a Task">
                                  <Button
                                    id="plan-milestone-as-task"
                                    disabled={
                                      statuses[milestone?.id] ||
                                      milestone?.status === 'Completed' ||
                                      Number(keyResult?.progress) === 100 ||
                                      ((form?.getFieldValue(`names-${compositeKey}`)?.length ?? 0) > 0) ||
                                      form?.getFieldValue(`names-${compositeKey}`)?.some((i: any) => i?.achieveMK)
                                    }
                                    onClick={() => {
                                      if (!statuses[milestone?.id]) {
                                        setMKAsATask({
                                          title: milestone?.title,
                                          mid: milestone?.id,
                                        });
                                        handleAddBoard(compositeKey);
                                        setClickStatus(milestone?.id + '', true); // Store click status in Zustand
                                      }
                                    }}
                                    size="small"
                                    className="text-[10px] text-primary"
                                    icon={<FaPlus />}
                                  />
                                </Tooltip>
                              )}
                              <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                                {weights[
                                  `names-${compositeKey}`
                                ] || 0}
                                %
                              </div>
                            </div>
                          </div>
                          <Divider className="my-2" />

                          <DefaultCardForm
                            kId={task?.keyResult?.id}
                            milestoneId={milestone?.id ?? null}
                            name={`names-${compositeKey}`}
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
                            name={compositeKey}
                            isMKAsTask={!!mkAsATask}
                            keyResult={task?.keyResult}
                            targetValue={task?.targetValue}
                            parentPlanId={parentParentId}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* <div className="flex items-center">
                    <span className="font-normal  ml-3 mt-2">{parentName} Tasks:</span>
                    
                  </div> */}

                {keyResult.tasks.map((task, taskIndex) => {
                  const compositeKey = buildKey(task?.keyResult?.id, undefined, task?.id);
                  return (
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
                          id={`plan-as-task_${keyResult?.id ?? ''}`}
                          onClick={() => handleAddBoard(compositeKey)}

                          type="link"
                          icon={<BiPlus />}
                          className="text-[10px]"
                          disabled={

                            statuses[keyResult?.id] ||
                            Number(keyResult?.progress) === 100 ||
                            ((form?.getFieldValue(`names-${compositeKey}`)?.length ?? 0) > 0) ||
                            form?.getFieldValue(`names-${compositeKey}`)?.some((i: any) => i?.achieveMK)
                          

                          }
                        >
                          Add Plan Task
                        </Button>

                          {task?.achieveMK && (
                            <Tooltip title="Plan key result as a Task">
                              <Button

                              id="plan-key-result-as-task"
                              size="small"
                              className="text-[10px] text-primary"
                              icon={<FaPlus />}
                              disabled={

                                statuses[keyResult?.id] ||
                                Number(keyResult?.progress) === 100 ||
                                ((form?.getFieldValue(`names-${compositeKey}`)?.length ?? 0) > 0) ||
                                form?.getFieldValue(`names-${compositeKey}`)?.some((i: any) => i?.achieveMK)

                              }
                              onClick={() => {
                                setMKAsATask({
                                  title: keyResult?.title,
                                  mid: keyResult?.id,
                                });

                                setClickStatus(keyResult?.id + '', true);
                                handleAddBoard(compositeKey);
                              }}
                            />
                            </Tooltip>
                          )}
                          <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                            {weights[`names-${compositeKey}`] || 0}%
                          </div>

                        </div>
                      </div>
                      <Divider className="my-2" />

                      <DefaultCardForm
                        kId={task?.keyResult?.id}
                        milestoneId={task?.milestone?.id ?? null}
                        name={`names-${compositeKey}`}
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
                        handleAddName={(arg1, arg2) => handleAddName(arg1, arg2)}
                        handleRemoveBoard={handleRemoveBoard}
                        kId={task?.keyResult?.id}
                        name={compositeKey}
                        isMKAsTask={!!mkAsATask}
                        keyResult={task?.keyResult}
                        targetValue={task?.targetValue}
                        parentPlanId={parentParentId}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Collapse.Panel>
      ))}
    </Collapse>
  );
};

export default PlanningHierarchyComponent;
