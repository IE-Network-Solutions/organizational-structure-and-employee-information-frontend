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
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { normalizeUserKeyResultItems } from '../planning/mergeKRPanelGroups';

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
    selectedFiscalYearId,
    selectedSessionIds,
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
  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const keyResultFiscalYearId =
    selectedFiscalYearId ?? activeFiscalYear?.id ?? undefined;
  const keyResultSessionId =
    selectedSessionIds.length > 0 ? selectedSessionIds[0] : undefined;
  const { data: userKeyResultsRaw } = useGetUserKeyResult(
    userId,
    keyResultFiscalYearId,
    keyResultSessionId,
  );
  const userKeyResultItems = useMemo(
    () => normalizeUserKeyResultItems(userKeyResultsRaw),
    [userKeyResultsRaw],
  );
  const { data: planningPeriods } = AllPlanningPeriods();
  const planningPeriodId = activePlanPeriodId;

  const {
    data: planningPeriodHierarchy,
    isLoading: loadingPlanningPeriodHierarchy,
    refetch: refetchHierarchy,
  } = useGetPlanningPeriodsHierarchy(
    userId,
    planningPeriodId || '', // Provide a default string value if undefined
  );

  // Fetch the last report to get failed tasks
  const { data: lastReportData, refetch: refetchLastReport } = useGetReporting({
    userId: [userId],
    planPeriodId: planningPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 1, // Get only the first (most recent) report
    sessionId: [],
  });

  // Refetch data when drawer opens to ensure we have the latest failed tasks
  useEffect(() => {
    if (open && planningPeriodId) {
      refetchHierarchy();
      refetchLastReport();
    }
  }, [open, planningPeriodId, refetchHierarchy, refetchLastReport]);

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

                    const namesKey = `names-${compositeKey}`;
                    const existingBoard = form.getFieldValue(namesKey) || [];

                    if (existingBoard.length === 0) {
                      formUpdates[namesKey] = matchingFailedTasks.map(
                        (failedTask: any) => ({
                          task: failedTask.task,
                          priority: failedTask.priority,
                          weight: failedTask.weight,
                          targetValue: failedTask.targetValue,
                          userId: userId,
                          planningPeriodId: planningPeriodId,
                          planningUserId: planningUserId,
                          keyResultId: failedTask.keyResultId,
                          milestoneId: failedTask.milestoneId,
                          parentTaskId: failedTask.parentTaskId,
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
                          const namesKey = `names-${compositeKey}`;
                          const existingBoard =
                            form.getFieldValue(namesKey) || [];

                          if (existingBoard.length === 0) {
                            formUpdates[namesKey] = matchingFailedTasks.map(
                              (failedTask: any) => ({
                                task: failedTask.task,
                                priority: failedTask.priority,
                                weight: failedTask.weight,
                                targetValue: failedTask.targetValue,
                                userId: userId,
                                planningPeriodId: planningPeriodId,
                                planningUserId: planningUserId,
                                keyResultId: failedTask.keyResultId,
                                milestoneId: failedTask.milestoneId,
                                parentTaskId: failedTask.parentTaskId,
                              }),
                            );
                          }
                        }
                      });
                    }
                  });
                } else if (milestoneKey === 'noMilestone' && !kr?.milestones) {
                  // Handle key results without milestones
                  const namesKey = `names-${krId}`;
                  const existingBoard = form.getFieldValue(namesKey) || [];

                  if (existingBoard.length === 0) {
                    formUpdates[namesKey] = failedTasks.map(
                      (failedTask: any) => ({
                        task: failedTask.task,
                        priority: failedTask.priority,
                        weight: failedTask.weight,
                        targetValue: failedTask.targetValue,
                        userId: userId,
                        planningPeriodId: planningPeriodId,
                        planningUserId: planningUserId,
                        keyResultId: failedTask.keyResultId,
                        milestoneId: failedTask.milestoneId,
                        parentTaskId: failedTask.parentTaskId,
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

        // Update weights for each auto-populated key
        Object.entries(formUpdates).forEach(([key, tasks]: [string, any]) => {
          if (key.startsWith('names-')) {
            const calculatedWeight = tasks.reduce(
              (sum: number, task: any) => sum + Number(task.weight || 0),
              0,
            );
            setWeight(key, calculatedWeight);
          }
        });
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
  const handleAddBoard = (kId: string, metadata?: any) => {
    const namesKey = `names-${kId}`;
    const currentBoard = form.getFieldValue(namesKey) || [];

    // Always grab the latest mkAsATask value to avoid stale reads
    const latestMkAsATask = PlanningAndReportingStore.getState().mkAsATask;

    // VALIDATION: Only use mkAsATask if it belongs to this Key Result
    // Check if mkAsATask.mid matches the current kId (exact match or for milestones, kId ends with mid)
    const shouldUseMkAsATask =
      latestMkAsATask?.mid &&
      (kId === latestMkAsATask.mid || // Exact match (for Key Result without milestone)
        kId.endsWith(latestMkAsATask.mid)); // Ends with match (for milestone: "krId+mlId" where mid is "mlId")

    const taskTitle = shouldUseMkAsATask ? latestMkAsATask.title : '';
    const achieveMK = shouldUseMkAsATask;

    // Create a task object - include metadata to avoid missing fields
    const newTask = {
      task: taskTitle,
      priority: undefined,
      weight: undefined,
      targetValue: metadata?.targetValue ?? undefined,
      achieveMK: achieveMK,
      ...metadata,
    };

    setTimeout(() => {
      form.setFieldsValue({ [namesKey]: [newTask, ...currentBoard] });
    }, 0);
  };

  const modalHeader = (
    <div
      className="flex items-center justify-center text-2xl font-bold text-[#161A2C] p-4 relative"
      data-cy="create-plan-modal-header"
    >
      <div data-cy="create-plan-modal-header-title">
        {planningPeriodHierarchy ? planningPeriodHierarchy.name : 'Daily'} Plan
      </div>
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2"
        id="planning-ai-suggestions-wrapper-view-space"
        data-cy="planning-ai-suggestions-wrapper-view-space"
      >
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
    <div
      data-cy="planning-and-reporting-components-createplan-index-tsx-index-div-493"
      className="flex items-center justify-between w-full"
    >
      <div
        data-cy="planning-and-reporting-components-createplan-index-tsx-index-div-494"
        className="flex-1"
      ></div>
      <div
        data-cy="planning-and-reporting-components-createplan-index-tsx-index-div-495"
        className="flex justify-center gap-4 flex-1"
      >
        <Tooltip
          title={
            totalWeight !== 100
              ? "Summation of all task's weights must be equal to 100!"
              : 'Create Plan'
          }
        >
          <Button
            id="submit-plan-button-for-planning-and-reporting"
            data-cy="submit-plan-button-for-planning-and-reporting"
            className="py-3 px-6 sm:py-6 sm:px-10"
            type="primary"
            onClick={() => form.submit()}
            loading={isLoading}
            disabled={totalWeight !== 100}
          >
            <span
              data-cy="planning-and-reporting-components-createplan-index-tsx-index-span-512"
              className="md:hidden"
            >
              Plan
            </span>
            <span
              data-cy="planning-and-reporting-components-createplan-index-tsx-index-span-513"
              className="hidden md:inline"
            >
              Create Plan
            </span>
          </Button>
        </Tooltip>

        <Button
          id="cancel-plan-button-for-planning-and-reporting"
          data-cy="cancel-plan-button-for-planning-and-reporting"
          className="py-3 px-6 sm:py-6 sm:px-10"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
      <div
        data-cy="planning-and-reporting-components-createplan-index-tsx-index-div-527"
        className="flex-1 flex justify-end pr-5"
      >
        <span
          data-cy="planning-and-reporting-components-createplan-index-tsx-index-span-528"
          className="text-sm font-medium text-[#161A2C] whitespace-nowrap"
        >
          <span
            data-cy="planning-and-reporting-components-createplan-index-tsx-index-span-529"
            className="md:hidden"
          >
            WP:
          </span>{' '}
          <span
            data-cy="planning-and-reporting-components-createplan-index-tsx-index-span-530"
            className="hidden md:inline"
          >
            Weight Point:
          </span>{' '}
          {Math.round(Number(totalWeight) || 0)}%
        </span>
      </div>
    </div>
  );

  const handleOnFinish = (values: Record<string, any>) => {
    const mergeValues = (obj: any) => {
      return Object.entries(obj)
        .filter(([key]) => key.startsWith('names-'))
        .map(([key, value]) => {
          if (!Array.isArray(value)) return [];
          const extractedKRId = key.replace('names-', '');

          return value.map((task: any) => ({
            ...task,
            userId: String(task.userId || userId || ''),
            planningPeriodId: String(
              task.planningPeriodId || planningPeriodId || '',
            ),
            planningUserId: String(task.planningUserId || planningUserId || ''),
            keyResultId: String(
              task.keyResultId ||
                (extractedKRId ? extractedKRId.substring(0, 36) : '') ||
                '',
            ),
            milestoneId: task.milestoneId ? String(task.milestoneId) : null,
            parentTaskId: task.parentTaskId ? String(task.parentTaskId) : null,
          }));
        })
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
          <div
            data-cy="planning-and-reporting-components-createplan-index-tsx-index-div-589"
            className="flex items-center justify-center min-h-screen"
          >
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
                weights={weights}
                failedTasksByKeyResult={failedTasksByKeyResult}
                userKeyResultItems={userKeyResultItems}
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
                weights={weights}
                failedTasksByKeyResult={failedTasksByKeyResult}
                userKeyResultItems={userKeyResultItems}
              />
            )}
          </Form>
        )}
      </CustomDrawerLayout>
    )
  );
}

export default CreatePlan;
