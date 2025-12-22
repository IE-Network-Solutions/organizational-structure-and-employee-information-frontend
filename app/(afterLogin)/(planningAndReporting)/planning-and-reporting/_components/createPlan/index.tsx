import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Form, Spin, Tooltip } from 'antd';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  AllPlanningPeriods,
  useGetPlanningPeriodsHierarchy,
  useGetReporting,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import PlanningHierarchyComponent from '../planning/createPlanHierarchy';
import PlanningObjectiveComponent from '../planning/createPlanObjective';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';
import AISuggestionsModal from '@/components/ai/AISuggestionsModal';
import { useMemo, useEffect, useRef } from 'react';

type FailedTasksByKeyResult = Record<
  string,
  Record<string | 'noMilestone', any[]>
>;

function CreatePlan() {
  const {
    open,
    setOpen,
    weights,
    totalWeight,
    isEditing,
    setWeight,
    mkAsATask,
    setMKAsATask,
    activePlanPeriodId,
    resetWeights,
  } = PlanningAndReportingStore();
  const { userId } = useAuthenticationStore();
  const [form] = Form.useForm();
  const { resetToInitial } = useClickStatus();
  const hasAutoPopulated = useRef(false);

  const onClose = () => {
    setOpen(false);
    resetToInitial();
    form.resetFields();
    resetWeights();
    hasAutoPopulated.current = false;
  };
  const { mutate: createTask, isLoading } = useCreatePlanTasks();
  const { data: objective } = useFetchObjectives(userId);
  const { data: planningPeriods } = AllPlanningPeriods();
  const planningPeriodId = activePlanPeriodId;

  const {
    data: planningPeriodHierarchy,
    isLoading: loadingPlanningPeriodHierarchy,
  } = useGetPlanningPeriodsHierarchy(
    userId,
    planningPeriodId || '', // Provide a default string value if undefined
  );

  // Fetch the last report to get failed tasks
  const { data: lastReportData } = useGetReporting({
    userId: [userId],
    planPeriodId: planningPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 1, // Get only the first (most recent) report
    sessionId: [],
  });

  // Extract and group failed tasks from the last report
  const failedTasksByKeyResult: FailedTasksByKeyResult = useMemo(() => {
    if (!lastReportData?.items?.[0]?.reportTask) return {};

    const lastReport = lastReportData.items[0];
    const failedTasks = lastReport.reportTask.filter(
      (task: any) => task.isAchieved === false || task?.status === 'Not',
    );

    // Group failed tasks by keyResultId and milestoneId
    const grouped: Record<string, Record<string | 'noMilestone', any[]>> = {};

    failedTasks.forEach((task: any) => {
      const keyResultId = String(
        task?.planTask?.keyResult?.id || task?.planTask?.keyResultId || '',
      );
      const milestoneId = task?.planTask?.milestone?.id
        ? String(task.planTask.milestone.id)
        : 'noMilestone';

      if (!grouped[keyResultId]) {
        grouped[keyResultId] = {};
      }
      if (!grouped[keyResultId][milestoneId]) {
        grouped[keyResultId][milestoneId] = [];
      }

      grouped[keyResultId][milestoneId].push({
        task: task.planTask?.task || '',
        priority: task.planTask?.priority || 'medium',
        weight: task.planTask?.weight || 0,
        targetValue: task.planTask?.targetValue || null,
        milestoneId: task.planTask?.milestone?.id || null,
        keyResultId: keyResultId,
        planTaskId: task.planTask?.id || null, // Include planTaskId to identify the specific task
        parentTaskId:
          task.planTask?.parentTaskId || task.planTask?.parentTask?.id || null, // Include parentTaskId to match to parent tasks
      });
    });

    return grouped;
  }, [lastReportData]);

  // Ensure planningPeriods is always an array before using find
  const safePlanningPeriods = Array.isArray(planningPeriods)
    ? planningPeriods
    : [];

  // Use find safely
  const planningUserId = safePlanningPeriods.find(
    (item: any) => item.planningPeriod?.id == planningPeriodId,
  )?.id;

  // Auto-populate failed tasks when drawer opens
  useEffect(() => {
    if (
      !open ||
      !planningPeriodHierarchy ||
      loadingPlanningPeriodHierarchy ||
      Object.keys(failedTasksByKeyResult).length === 0 ||
      hasAutoPopulated.current
    ) {
      return;
    }

    // Auto-populate failed tasks
    const populateFailedTasks = () => {
      const formUpdates: Record<string, any[]> = {};

      Object.keys(failedTasksByKeyResult).forEach((keyResultId) => {
        const keyResultFailedTasks = failedTasksByKeyResult[keyResultId];
        if (!keyResultFailedTasks) return;

        // Handle tasks with milestones and without milestones
        Object.keys(keyResultFailedTasks).forEach((milestoneKey) => {
          const failedTasks = keyResultFailedTasks[milestoneKey];
          if (!failedTasks || failedTasks.length === 0) return;

          // For hierarchy component (daily plans)
          if (planningPeriodHierarchy?.parentPlan) {
            const tasks =
              planningPeriodHierarchy?.parentPlan?.plans?.find(
                (i: any) => i.isReported === false,
              )?.tasks || [];

            // Find matching tasks in the current plan structure
            tasks.forEach((task: any) => {
              const taskKeyResultId = String(task?.keyResult?.id || '');
              const taskMilestoneId = task?.milestone?.id
                ? String(task.milestone.id)
                : null;

              // Check if this task matches the key result and milestone
              if (taskKeyResultId === keyResultId) {
                const milestoneMatch =
                  (milestoneKey === 'noMilestone' && !taskMilestoneId) ||
                  (milestoneKey !== 'noMilestone' &&
                    taskMilestoneId === milestoneKey);

                if (milestoneMatch) {
                  // Build composite key
                  const buildKey = (
                    krId?: string | number,
                    msId?: string | number | null,
                    tId?: string | number | null,
                  ) =>
                    `${String(krId ?? '')}${String(msId ?? '')}${String(tId ?? '')}`;

                  const taskId = String(task?.id || '');
                  const matchingFailedTasks = failedTasks.filter(
                    (failedTask: any) => {
                      if (failedTask.parentTaskId) {
                        return String(failedTask.parentTaskId) === taskId;
                      }
                      if (failedTask.planTaskId) {
                        return String(failedTask.planTaskId) === taskId;
                      }
                      return failedTask.task === task.task;
                    },
                  );

                  if (matchingFailedTasks.length > 0) {
                    const compositeKey = buildKey(
                      task?.keyResult?.id,
                      task?.milestone?.id,
                      task?.id,
                    );

                    const boardsKey = `board-${compositeKey}`;
                    const existingBoard = form.getFieldValue(boardsKey) || [];

                    if (existingBoard.length === 0) {
                      formUpdates[boardsKey] = matchingFailedTasks.map(
                        (failedTask: any) => ({
                          task: failedTask.task,
                          priority: failedTask.priority,
                          weight: failedTask.weight,
                          targetValue: failedTask.targetValue,
                        }),
                      );
                    }
                  }
                }
              }
            });
          } else {
            // For objective component (weekly plans)
            if (!objective?.items) return;

            objective.items.forEach((obj: any) => {
              obj.keyResults?.forEach((kr: any) => {
                const krId = String(kr?.id || '');
                if (krId !== keyResultId) return;

                // Handle milestones
                if (milestoneKey !== 'noMilestone' && kr?.milestones) {
                  kr.milestones.forEach((ml: any) => {
                    const mlId = String(ml?.id || '');
                    if (mlId === milestoneKey) {
                      const buildKey = (
                        krId?: string | number,
                        msId?: string | number | null,
                        tId?: string | number | null,
                      ) =>
                        `${String(krId ?? '')}${String(msId ?? '')}${String(tId ?? '')}`;
                      ml.tasks?.forEach((task: any) => {
                        const taskId = String(task?.id || '');
                        const matchingFailedTasks = failedTasks.filter(
                          (failedTask: any) => {
                            if (failedTask.parentTaskId) {
                              return String(failedTask.parentTaskId) === taskId;
                            }
                            if (failedTask.planTaskId) {
                              return String(failedTask.planTaskId) === taskId;
                            }
                            return failedTask.task === task.task;
                          },
                        );

                        if (matchingFailedTasks.length > 0) {
                          const compositeKey = buildKey(krId, mlId, taskId);
                          const boardsKey = `board-${compositeKey}`;
                          const existingBoard =
                            form.getFieldValue(boardsKey) || [];

                          if (existingBoard.length === 0) {
                            formUpdates[boardsKey] = matchingFailedTasks.map(
                              (failedTask: any) => ({
                                task: failedTask.task,
                                priority: failedTask.priority,
                                weight: failedTask.weight,
                                targetValue: failedTask.targetValue,
                              }),
                            );
                          }
                        }
                      });
                    }
                  });
                } else if (milestoneKey === 'noMilestone' && !kr?.milestones) {
                  // Handle key results without milestones
                  const boardsKey = `board-${krId}`;
                  const existingBoard = form.getFieldValue(boardsKey) || [];

                  if (existingBoard.length === 0) {
                    formUpdates[boardsKey] = failedTasks.map(
                      (failedTask: any) => ({
                        task: failedTask.task,
                        priority: failedTask.priority,
                        weight: failedTask.weight,
                        targetValue: failedTask.targetValue,
                      }),
                    );
                  }
                }
              });
            });
          }
        });
      });

      // Apply all form updates at once
      if (Object.keys(formUpdates).length > 0) {
        form.setFieldsValue(formUpdates);
      }

      hasAutoPopulated.current = true;
    };

    // Small delay to ensure form is ready
    const timer = setTimeout(() => {
      populateFailedTasks();
    }, 100);

    return () => clearTimeout(timer);
  }, [
    open,
    planningPeriodHierarchy,
    loadingPlanningPeriodHierarchy,
    failedTasksByKeyResult,
    objective,
    form,
  ]);

  // Reset auto-populate flag and clear form when drawer closes
  useEffect(() => {
    if (!open) {
      hasAutoPopulated.current = false;
      form.resetFields();
      resetWeights();
    }
  }, [open, form, resetWeights]);
  const handleAddName = (
    currentBoardValues: Record<string, string>,
    kId: string,
  ) => {
    const namesKey = `names-${kId}`;
    const names = form.getFieldValue(namesKey) || [];
    form.setFieldsValue({ [namesKey]: [...names, currentBoardValues] });
    const fieldValue = form.getFieldValue(namesKey);
    const totalWeight = fieldValue.reduce((sum: number, field: any) => {
      return Number(sum) + Number(field?.weight || 0);
    }, 0);
    setWeight(namesKey, totalWeight);
  };
  const handleAddBoard = (kId: string) => {
    const boardsKey = `board-${kId}`;
    const currentBoard = form.getFieldValue(boardsKey) || [];

    // Always grab the latest mkAsATask value to avoid stale reads
    const latestMkAsATask = PlanningAndReportingStore.getState().mkAsATask;
    const taskTitle = latestMkAsATask?.title || '';
    const achieveMK = !!latestMkAsATask;

    // Create a task object - if mkAsATask exists, use its title
    const newTask = {
      task: taskTitle,
      priority: undefined,
      weight: undefined,
      targetValue: undefined,
      achieveMK: achieveMK,
    };

    form.setFieldsValue({ [boardsKey]: [...currentBoard, newTask] });
  };
  const handleRemoveBoard = (index: number, kId: string) => {
    const boardsKey = `board-${kId}`;

    const boards = form.getFieldValue(boardsKey) || [];
    if (index > -1 && index < boards.length) {
      boards.splice(index, 1);
      form.setFieldsValue({ [boardsKey]: boards });
    }
  };

  const modalHeader = (
    <div className="relative flex items-center justify-center text-xl font-extrabold text-gray-800 p-4">
      <div>
        Create {planningPeriodHierarchy ? planningPeriodHierarchy.name : 'New'}{' '}
        Plan
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {/* AI Suggestions button + modal */}
        <AISuggestionsModal
          getKeyResults={() => {
            const out: any[] = [];

            if (!planningPeriodHierarchy?.parentPlan) {
              // Weekly Plan: Get Key Results from Objectives
              objective?.items?.forEach((obj: any) => {
                obj?.keyResults?.forEach((kr: any) => {
                  if (kr?.id && kr?.title) {
                    out.push({
                      id: String(kr.id),
                      title: kr.title,
                      metricType: kr.metricType,
                      milestones: kr.milestones,
                      progress: kr.progress,
                    });
                  }
                });
              });
            } else {
              // Daily Plan: Use same logic as hierarchy component
              const tasks =
                planningPeriodHierarchy?.parentPlan?.plans?.find(
                  (i: any) => i?.isReported === false,
                )?.tasks || [];

              // Group by keyResult to match the planning structure
              const seen = new Set<string>();
              tasks.forEach((t: any) => {
                const krId = String(t?.keyResult?.id || '');
                const krTitle = t?.keyResult?.title;
                if (krId && krTitle && !seen.has(krId)) {
                  seen.add(krId);
                  out.push({
                    id: krId,
                    title: krTitle,
                    metricType: t?.keyResult?.metricType,
                    milestones: t?.keyResult?.milestones,
                    progress: t?.keyResult?.progress,
                  });
                }
              });
            }

            return out;
          }}
          getWeeklyPlanTasks={() => {
            // Only for daily plans - get all weekly plan tasks
            if (!planningPeriodHierarchy?.parentPlan) return [];

            const tasks =
              planningPeriodHierarchy?.parentPlan?.plans?.find(
                (i: any) => i?.isReported === false,
              )?.tasks || [];

            return tasks.map((t: any) => ({
              id: String(t?.id || ''),
              task: t?.task || '',
              krId: String(t?.keyResult?.id || ''),
              milestoneId: t?.milestone?.id ? String(t.milestone.id) : null,
            }));
          }}
          form={form}
          handleAddBoard={handleAddBoard}
          handleAddName={handleAddName}
          planTypeName={planningPeriodHierarchy?.name || 'Weekly'}
          hasParentPlan={!!planningPeriodHierarchy?.parentPlan}
          resolveListNameForKR={(krId: string) => `names-${krId}`}
          resolveBoardKeyForKR={(krId: string) => krId}
        />
      </div>
    </div>
  );
  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1"></div>
      <div className="flex justify-center gap-4 flex-1">
        <Tooltip
          title={
            totalWeight !== 100
              ? "Summation of all task's weights must be equal to 100!"
              : 'Submit'
          }
        >
          <Button
            id="submit-plan-button-for-planning-and-reporting"
            className="py-6 px-10"
            type="primary"
            onClick={() => form.submit()}
            loading={isLoading}
            disabled={totalWeight !== 100}
          >
            Submit
          </Button>
        </Tooltip>

        <Button
          id="cancel-plan-button-for-planning-and-reporting"
          className="py-6 px-10"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
      <div className="flex-1 flex justify-end">
        <div className="my-2 font-bold mx-6">
          <span className="hidden sm:inline">Total Weights: </span>
          <span className="sm:hidden">W: </span>
          {Math.round(Number(totalWeight) || 0)} / 100
        </div>
      </div>
    </div>
  );

  const handleOnFinish = (values: Record<string, any>) => {
    const mergeValues = (obj: any) => {
      return Object.entries(obj)
        .filter(([key]) => key.startsWith('names-'))
        .map(([, value]) => value)
        .filter((value) => Array.isArray(value))
        .flat();
    };
    const finalValues = mergeValues(values);

    createTask(
      { tasks: finalValues },
      {
        onSuccess: () => {
          resetToInitial();
          form.resetFields();
          resetWeights();
          hasAutoPopulated.current = false;
          onClose();
        },
      },
    );
  };
  return (
    open && (
      <CustomDrawerLayout
        open={open === true && isEditing === false ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width={'60%'}
        paddingBottom={10}
        footer={footer}
      >
        {loadingPlanningPeriodHierarchy ? (
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
              <PlanningObjectiveComponent
                objective={objective}
                form={form}
                planningPeriodId={planningPeriodId || ''}
                userId={userId}
                planningUserId={planningUserId || ''}
                mkAsATask={!!mkAsATask}
                setMKAsATask={setMKAsATask}
                handleAddBoard={handleAddBoard}
                handleAddName={handleAddName}
                handleRemoveBoard={handleRemoveBoard}
                weights={weights}
                failedTasksByKeyResult={failedTasksByKeyResult}
              />
            ) : (
              <PlanningHierarchyComponent
                planningPeriodHierarchy={planningPeriodHierarchy}
                form={form}
                planningPeriodId={planningPeriodId || ''}
                userId={userId}
                planningUserId={planningUserId || ''}
                mkAsATask={!!mkAsATask}
                setMKAsATask={setMKAsATask}
                handleAddBoard={handleAddBoard}
                handleAddName={handleAddName}
                handleRemoveBoard={handleRemoveBoard}
                weights={weights}
                failedTasksByKeyResult={failedTasksByKeyResult}
              />
            )}
          </Form>
        )}
      </CustomDrawerLayout>
    )
  );
}

export default CreatePlan;
