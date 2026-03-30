import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Form, Modal, Spin, Tag, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
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
import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  PR_BORDER,
  PR_PRIMARY,
  PR_PRIMARY_MUTED,
  PR_TEXT,
  PR_TEXT_MUTED,
} from '../planningUiTokens';

function isMonthlyCadenceName(name: string | undefined): boolean {
  return (name || '').toLowerCase().includes('month');
}

function formatPlanPeriodToggleLabel(label: string): string {
  const l = (label || '').trim();
  if (!l) return 'Plan';
  if (/\bplan\b/i.test(l)) return l;
  return `${l} Plan`;
}

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
  const { isMobile } = useIsMobile();
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
  const safePlanningPeriods = useMemo(
    () => (Array.isArray(planningPeriods) ? planningPeriods : []),
    [planningPeriods],
  );

  const cadencePeriodOptions = useMemo(() => {
    return safePlanningPeriods
      .filter((item: any) => !isMonthlyCadenceName(item?.planningPeriod?.name))
      .map((item: any) => ({
        label: item.planningPeriod?.name || 'Plan',
        value: String(item.planningPeriod?.id || ''),
      }))
      .filter((o) => o.value);
  }, [safePlanningPeriods]);

  const [modalPlanningPeriodId, setModalPlanningPeriodId] = useState('');
  const prevOpenForInitRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenForInitRef.current) {
      const weekly = cadencePeriodOptions.find((o) =>
        o.label.toLowerCase().includes('week'),
      );
      const next =
        weekly?.value ||
        cadencePeriodOptions[0]?.value ||
        activePlanPeriodId ||
        '';
      setModalPlanningPeriodId((cur) =>
        cur && cadencePeriodOptions.some((o) => o.value === cur) ? cur : next,
      );
    }
    prevOpenForInitRef.current = open;
    if (!open) prevOpenForInitRef.current = false;
  }, [open, cadencePeriodOptions, activePlanPeriodId]);

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      setLastSavedAt(new Date());
    } else {
      setLastSavedAt(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || cadencePeriodOptions.length === 0) return;
    setModalPlanningPeriodId((cur) => {
      if (cur && cadencePeriodOptions.some((o) => o.value === cur)) return cur;
      const weekly = cadencePeriodOptions.find((o) =>
        o.label.toLowerCase().includes('week'),
      );
      return weekly?.value || cadencePeriodOptions[0]?.value || cur;
    });
  }, [open, cadencePeriodOptions]);

  const prevPeriodSwitchRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      prevPeriodSwitchRef.current = null;
      return;
    }
    if (
      prevPeriodSwitchRef.current &&
      modalPlanningPeriodId &&
      prevPeriodSwitchRef.current !== modalPlanningPeriodId
    ) {
      form.resetFields();
      resetWeights();
      hasAutoPopulated.current = false;
    }
    if (modalPlanningPeriodId) {
      prevPeriodSwitchRef.current = modalPlanningPeriodId;
    }
  }, [open, modalPlanningPeriodId, form, resetWeights]);

  const planningPeriodId = modalPlanningPeriodId || activePlanPeriodId || '';

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
    setLastSavedAt(new Date());
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
      setLastSavedAt(new Date());
    }, 0);
  };

  const selectedPeriodMeta = useMemo(
    () => cadencePeriodOptions.find((o) => o.value === modalPlanningPeriodId),
    [cadencePeriodOptions, modalPlanningPeriodId],
  );

  const periodHint = useMemo(() => {
    const name = (selectedPeriodMeta?.label || '').toLowerCase();
    if (name.includes('daily')) {
      return 'Plan your daily tasks according to your weekly tasks.';
    }
    return 'Plan your weekly tasks according to the key results you wish to work on this week.';
  }, [selectedPeriodMeta]);

  const planTypeNameForAi = planningPeriodHierarchy?.name || 'Weekly';
  const hasParentPlanForAi = !!planningPeriodHierarchy?.parentPlan;

  const getWeeklyPlanTasksForAi = useCallback(() => {
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
  }, [planningPeriodHierarchy]);

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
  const modalVisible = open === true && isEditing === false;

  return (
    <Modal
      open={modalVisible}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={isMobile ? 'calc(100vw - 16px)' : 920}
      maskClosable={!isLoading}
      destroyOnClose={false}
      classNames={{ wrapper: 'planning-create-plan-modal-wrapper' }}
      maskStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${PR_BORDER}`,
        },
        body: { padding: 0 },
      }}
      data-cy="planning-create-plan-modal"
    >
      <div
        data-cy="create-plan-modal-shell"
        className="pr-ant-tag-scope flex max-h-[min(88vh,calc(100dvh-32px))] flex-col bg-white"
      >
        <header
          data-cy="create-plan-modal-header"
          className="flex shrink-0 items-start justify-between"
          style={{
            height: 45,
            paddingTop: 13,
            paddingLeft: 24,
            paddingRight: 24,
            opacity: 1,
            columnGap: 10,
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{ color: PR_TEXT }}
            data-cy="create-plan-modal-header-title"
          >
            Planning
          </h2>
          <div
            className="flex items-center gap-2"
            id="planning-ai-suggestions-wrapper-view-space"
            data-cy="planning-ai-suggestions-wrapper-view-space"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F5F6FA] hover:text-[#161A2C] disabled:opacity-50"
              aria-label="Close planning"
              data-cy="create-plan-modal-close"
            >
              <CloseOutlined className="text-lg" />
            </button>
          </div>
        </header>

        {cadencePeriodOptions.length > 1 ? (
          <section
            data-cy="create-plan-cadence-section"
            className="shrink-0 px-5 py-4 text-center md:px-6"
          >
            <p
              className="mb-3 text-sm font-medium"
              style={{ color: PR_TEXT }}
              data-cy="create-plan-select-period-label"
            >
              Select Planning Period
            </p>
            <div
              className="mx-auto flex max-w-md rounded-lg border p-0.5"
              style={{ borderColor: PR_BORDER }}
              data-cy="create-plan-cadence-toggle"
              role="group"
              aria-label="Planning period"
            >
              {cadencePeriodOptions.map((o) => {
                const active = modalPlanningPeriodId === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    data-cy={`create-plan-period-${o.value}`}
                    className="flex-1 rounded-md py-2.5 text-sm font-semibold transition"
                    style={{
                      backgroundColor: active ? PR_PRIMARY : 'transparent',
                      color: active ? '#FFFFFF' : PR_TEXT,
                    }}
                    onClick={() => setModalPlanningPeriodId(o.value)}
                  >
                    {formatPlanPeriodToggleLabel(o.label)}
                  </button>
                );
              })}
            </div>
            <p
              className="mt-3 px-2 text-xs leading-relaxed"
              style={{ color: PR_TEXT_MUTED }}
              data-cy="create-plan-period-hint"
            >
              {periodHint}
            </p>
          </section>
        ) : (
          <section
            className="shrink-0 px-5 py-3 text-center md:px-6"
            data-cy="create-plan-period-hint-only"
          >
            <p
              className="text-xs leading-relaxed"
              style={{ color: PR_TEXT_MUTED }}
              data-cy="create-plan-period-hint-single"
            >
              {periodHint}
            </p>
          </section>
        )}

        <div
          data-cy="create-plan-modal-body"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6"
        >
          {loadingPlanningPeriodHierarchy ? (
            <div
              data-cy="planning-and-reporting-components-createplan-index-tsx-index-div-589"
              className="flex min-h-[240px] items-center justify-center py-16"
            >
              <Spin size="large" tip="Loading…" />
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
                  planTypeNameForAi={planTypeNameForAi}
                  hasParentPlanForAi={hasParentPlanForAi}
                  getWeeklyPlanTasksForAi={getWeeklyPlanTasksForAi}
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
                  planTypeNameForAi={planTypeNameForAi}
                  hasParentPlanForAi={hasParentPlanForAi}
                  getWeeklyPlanTasksForAi={getWeeklyPlanTasksForAi}
                />
              )}
            </Form>
          )}
        </div>

        <footer
          data-cy="planning-and-reporting-components-createplan-index-tsx-index-div-493"
          className="flex shrink-0 flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
        >
          <div
            className="flex items-center gap-3"
            data-cy="create-plan-footer-meta"
          >
            <Tag
              data-cy="create-plan-total-weight"
              className="!m-0"
              style={{
                backgroundColor: PR_PRIMARY_MUTED,
                color: PR_PRIMARY,
              }}
            >
              Total Weight: {Math.round(Number(totalWeight) || 0)}
            </Tag>
            {lastSavedAt && (
              <span
                className="text-xs"
                style={{ color: PR_TEXT_MUTED }}
                data-cy="create-plan-last-saved"
              >
                Last Saved{' '}
                {lastSavedAt.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            )}
          </div>
          <div
            className="flex justify-end gap-3"
            data-cy="create-plan-footer-actions"
          >
            <Button
              id="cancel-plan-button-for-planning-and-reporting"
              data-cy="cancel-plan-button-for-planning-and-reporting"
              className="h-10 min-w-[100px] rounded-lg border bg-white font-semibold"
              style={{ borderColor: PR_BORDER, color: PR_TEXT }}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Tooltip
              title={
                totalWeight !== 100
                  ? "Summation of all task's weights must be equal to 100!"
                  : 'Submit your plan'
              }
            >
              <Button
                id="submit-plan-button-for-planning-and-reporting"
                data-cy="submit-plan-button-for-planning-and-reporting"
                type="primary"
                className="h-10 min-w-[100px] rounded-lg border-0 font-semibold !bg-[#2D5BFF] !text-white hover:!bg-[#2447D4]"
                onClick={() => form.submit()}
                loading={isLoading}
                disabled={totalWeight !== 100}
              >
                Create
              </Button>
            </Tooltip>
          </div>
        </footer>
      </div>
    </Modal>
  );
}

export default CreatePlan;
