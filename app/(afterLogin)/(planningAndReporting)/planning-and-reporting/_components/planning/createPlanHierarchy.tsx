import React from 'react';
import { Button } from 'antd';
import DefaultCardForm from '../planForms/defaultForm';
import { groupParentTasks } from '../dataTransformer/plan';
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
    weight?: number;
    metricType?: {
      name: string;
    };
    progress?: string | number;
    milestones?: Array<{
      id: string | number;
      title: string;
      status?: string;
    }>;
  };
  milestone?: {
    id: string;
    title: string;
    status?: string;
  };
  targetValue?: any;
  progress?: string | number;
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
  handleAddBoard: (id: string, metadata?: any) => void;
  handleAddName: (values: Record<string, any>, key: string) => void;
  weights: Record<string, number>;
  failedTasksByKeyResult?: Record<
    string,
    Record<string | 'noMilestone', any[]>
  >;
  planTypeNameForAi?: string;
  hasParentPlanForAi?: boolean;
  getWeeklyPlanTasksForAi?: () => Array<{
    id: string;
    task: string;
    krId?: string;
    milestoneId?: string | null;
  }>;
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
  planTypeNameForAi,
  hasParentPlanForAi,
  getWeeklyPlanTasksForAi,
}) => {
  const formattedData = groupParentTasks(
    planningPeriodHierarchy?.parentPlan?.plans?.find(
      (i: any) => i.isReported === false,
    )?.tasks || [],
  );

  const parentParentId = planningPeriodHierarchy?.parentPlan?.plans?.find(
    (i: any) => i.isReported === false,
  )?.id;

  const { statuses } = useClickStatus();

  const buildKey = (
    keyResultId?: string | number,
    milestoneId?: string | number | null,
    taskId?: string | number | null,
  ) =>
    `${String(keyResultId ?? '')}${String(milestoneId ?? '')}${String(taskId ?? '')}`;

  return (
    <div
      data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-div-90"
      className="flex flex-col gap-6 p-2"
    >
      {formattedData.map((objective) => (
        <div
          data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-div-92"
          key={objective.id}
          className="flex flex-col gap-6"
        >
          {objective.keyResults.map((keyResult) => (
            <React.Fragment key={keyResult.id}>
              {/* Render tasks within milestones as cards */}
              {keyResult.milestones.map((milestone) => (
                <React.Fragment key={milestone.id}>
                  {milestone.tasks.map((task) => {
                    const compositeKey = buildKey(
                      keyResult.id,
                      milestone.id,
                      task.id,
                    );
                    return (
                      <div
                        key={task.id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                        data-cy="planningandreporting-planning-and-reporting-components-planning-createplanhierarchy-tsx-div-112"
                      >
                        <div
                          data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-div-109"
                          className="py-3 px-4 flex justify-between items-center gap-3"
                        >
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-div-110"
                            className="text-sm flex items-center min-w-0 flex-1 pr-2"
                          >
                            <span
                              className="text-gray-700 truncate flex-1 min-w-0"
                              title={task.task}
                              data-cy="planningandreporting-planning-and-reporting-components-planning-createplanhierarchy-tsx-span-132"
                            >
                              {task.task}
                            </span>
                          </div>
                          <div
                            data-cy="planning-create-planhierarchy-milestone-task-actions"
                            className="flex flex-shrink-0 items-center gap-2"
                          >
                            <Button
                              type="default"
                              className="h-8 flex-shrink-0 rounded-lg border border-[#E5E7EB] bg-white px-4 font-semibold text-[#2D5BFF] hover:bg-[#F5F6FA]"
                              onClick={() => {
                                setMKAsATask(null);
                                handleAddBoard(compositeKey, {
                                  keyResultId: keyResult.id,
                                  milestoneId: milestone.id,
                                  parentTaskId: task.id,
                                  planningPeriodId,
                                  planningUserId,
                                  userId,
                                  parentPlanId: parentParentId,
                                  targetValue: task.targetValue,
                                });
                              }}
                              disabled={
                                statuses[milestone.id] ||
                                milestone.status === 'Completed' ||
                                Number(keyResult.progress) === 100
                              }
                            >
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-span-145"
                                className="sm:hidden"
                              >
                                Add Plan
                              </span>
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-span-146"
                                className="hidden sm:inline"
                              >
                                Add Plan
                              </span>
                            </Button>
                          </div>
                        </div>

                        <DefaultCardForm
                          kId={keyResult.id}
                          milestoneId={milestone.id}
                          name={`names-${compositeKey}`}
                          form={form}
                          planningPeriodId={planningPeriodId || ''}
                          userId={userId}
                          parentPlanId={parentParentId || ''}
                          planningUserId={planningUserId || ''}
                          planTaskId={task.id || ''}
                          isMKAsTask={!!mkAsATask}
                          keyResult={keyResult}
                          targetValue={task.targetValue}
                        />
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

              {/* Render tasks without milestones as cards */}
              {keyResult.tasks.map((task) => {
                const compositeKey = buildKey(keyResult.id, null, task.id);
                return (
                  <div
                    key={task.id}
                    data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-div-207"
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-div-182"
                      className="py-3 px-4 flex justify-between items-center gap-3"
                    >
                      <div
                        data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-div-183"
                        className="text-sm flex items-center min-w-0 flex-1 pr-2"
                      >
                        <span
                          className="text-gray-700 truncate flex-1 min-w-0"
                          title={task.task}
                          data-cy="planningandreporting-planning-and-reporting-components-planning-createplanhierarchy-tsx-span-225"
                        >
                          {task.task}
                        </span>
                      </div>
                      <div
                        data-cy="planning-create-planhierarchy-kr-task-actions"
                        className="flex flex-shrink-0 items-center gap-2"
                      >
                        <Button
                          type="default"
                          className="h-8 flex-shrink-0 rounded-lg border border-[#E5E7EB] bg-white px-4 font-semibold text-[#2D5BFF] hover:bg-[#F5F6FA]"
                          onClick={() => {
                            setMKAsATask(null);
                            handleAddBoard(compositeKey, {
                              keyResultId: keyResult.id,
                              milestoneId: null,
                              parentTaskId: task.id,
                              planningPeriodId,
                              planningUserId,
                              userId,
                              parentPlanId: parentParentId,
                              targetValue: task.targetValue,
                            });
                          }}
                          disabled={
                            statuses[keyResult.id] ||
                            Number(keyResult.progress) === 100
                          }
                        >
                          <span
                            data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-span-217"
                            className="sm:hidden"
                          >
                            Add Plan
                          </span>
                          <span
                            data-cy="planning-and-reporting-components-planning-createplanhierarchy-tsx-createplanhierarchy-span-218"
                            className="hidden sm:inline"
                          >
                            Add Plan
                          </span>
                        </Button>
                      </div>
                    </div>

                    <DefaultCardForm
                      kId={keyResult.id}
                      milestoneId={null}
                      name={`names-${compositeKey}`}
                      form={form}
                      planningPeriodId={planningPeriodId || ''}
                      userId={userId}
                      parentPlanId={parentParentId || ''}
                      planningUserId={planningUserId || ''}
                      planTaskId={task.id || ''}
                      isMKAsTask={!!mkAsATask}
                      keyResult={keyResult}
                      targetValue={task.targetValue}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PlanningHierarchyComponent;
