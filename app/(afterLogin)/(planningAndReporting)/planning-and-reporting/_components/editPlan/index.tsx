import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Form, Spin, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { useUpdatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  AllPlanningPeriods,
  useGetPlanningById,
  useGetPlanningPeriodsHierarchy,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import PlanningObjectiveComponent from '../planning/createPlanObjective';
import PlanningHierarchyComponent from '../planning/createPlanHierarchy';
import AISuggestionsModal from '@/components/ai/AISuggestionsModal';

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
    activePlanPeriodId,
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
    activePlanPeriodId ?? planningPeriods?.[activePlanPeriod - 1]?.id;

  const safePlanningPeriods = Array.isArray(planningPeriods)
    ? planningPeriods
    : [];

  const planningUserId = safePlanningPeriods.find(
    (item: any) => item.planningPeriod?.id == planningPeriodId,
  )?.id;

  const {
    data: planningPeriodHierarchy,
    isLoading: loadingPlanningPeriodHierarchy,
  } = useGetPlanningPeriodsHierarchy(
    userId,
    planningPeriodId || '', // Provide a default string value if undefined
  );


  const handleAddName = (
    currentBoardValues: Record<string, string | number>,
    kId: string,
  ) => {
    const namesKey = `names-${kId}`;
    const names = form.getFieldValue(namesKey) || [];
    currentBoardValues = { ...currentBoardValues, planId: planGroupData?.id };
    form.setFieldsValue({ [namesKey]: [currentBoardValues, ...names] });
    const fieldValue = form.getFieldValue(namesKey);

    const totalWeight = fieldValue.reduce(
      (sum: number, field: { weight?: number }) => {
        return Number(sum) + Number(field?.weight ?? 0);
      },
      0,
    );

    setWeight(namesKey, totalWeight);
  };

  const handleAddBoard = (kId: string, metadata?: any) => {
    const namesKey = `names-${kId}`;
    const names = form.getFieldValue(namesKey) || [];

    // Always grab the latest mkAsATask value to avoid stale reads
    const latestMkAsATask = PlanningAndReportingStore.getState().mkAsATask;
    const taskTitle = latestMkAsATask?.title || '';
    const achieveMK = !!latestMkAsATask;

    // Create a task object - include metadata to avoid missing fields
    const newTask = {
      task: taskTitle,
      priority: undefined,
      weight: undefined,
      targetValue: metadata?.targetValue ?? undefined,
      achieveMK: achieveMK,
      planId: planGroupData?.id,
      ...metadata,
    };

    form.setFieldsValue({ [namesKey]: [newTask, ...names] });
    setMKAsATask(null);
  };

  const modalHeader = (
    <div className="relative flex items-center justify-center text-xl font-extrabold text-gray-800 p-4">
      <div>
        Edit {planningPeriodHierarchy ? planningPeriodHierarchy.name : ''} Plan
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {/* AI Suggestions for all plan types */}
        <AISuggestionsModal
          getKeyResults={() => {
            const out: { id: string; title: string }[] = [];

            if (!planningPeriodHierarchy?.parentPlan) {
              // Weekly Plan: Get Key Results from objectives
              objective?.items?.forEach((obj: any) => {
                obj?.keyResults?.forEach((kr: any) => {
                  if (kr?.id && kr?.title)
                    out.push({ id: String(kr.id), title: kr.title });
                });
              });

              // Fallback to current plan KRs if none collected yet
              if (out.length === 0) {
                const seen = new Set<string>();
                (planGroupData?.tasks || []).forEach((t: any) => {
                  const id = String(t?.keyResult?.id || '');
                  const title = t?.keyResult?.title;
                  if (id && title && !seen.has(id)) {
                    seen.add(id);
                    out.push({ id, title });
                  }
                });
              }
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
                  out.push({ id: krId, title: krTitle });
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
          userId={userId}
          planningPeriodId={planningPeriodId}
          planningUserId={planningUserId}
        />
      </div>
    </div>
  );

  const handleOnFinish = (values: Record<string, any>) => {
    const mergeValues = (obj: any) => {
      return Object.entries(obj)
        .filter(([key]) => key.startsWith('names-'))
        .map(([key, value]: [string, any]) => {
          if (!Array.isArray(value)) return [];
          const extractedKRId = key.replace('names-', '');

          return value.map((task: any) => ({
            ...task,
            // Ensure all required fields are present and are strings
            userId: String(task.userId || userId || ''),
            planningPeriodId: String(
              task.planningPeriodId || planningPeriodId || '',
            ),
            planningUserId: String(
              task.planningUserId || planningUserId || '',
            ),
            // keyResultId is required.
            keyResultId: String(
              task.keyResultId ||
              (extractedKRId ? extractedKRId.substring(0, 36) : '') ||
              '',
            ),
            // milestoneId and parentTaskId can be null but should be strings if they exist
            milestoneId: task.milestoneId ? String(task.milestoneId) : null,
            parentTaskId: task.parentTaskId ? String(task.parentTaskId) : null,
          }));
        })
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
      if (!tasks || tasks.length === 0) {
        return;
      }

      const uniqueTaskIds = new Set();

      tasks.forEach((e: any) => {
        if (!e?.id) return; // Skip invalid tasks

        const hasMilestone = e?.milestone !== null;
        const name = hasMilestone
          ? `${e?.keyResult?.id + e?.milestone?.id + (e?.parentTaskId || '')}`
          : `${e?.keyResult?.id + (e?.parentTaskId || '')}`;

        // Ensure no duplicates
        if (!uniqueTaskIds.has(e?.id)) {
          uniqueTaskIds.add(e?.id);

          handleAddName(
            {
              id: e?.id,
              milestoneId: e?.milestone?.id || null,
              keyResultId: e?.keyResult?.id || null,
              planningPeriodId,
              planningUserId,
              userId: userId || '',
              task: e?.task || '',
              priority: e?.priority || '',
              weight: parseInt(e?.weight, 10) || 0,
              targetValue: e?.targetValue || 0,
              achieveMK: e?.achieveMK || null,
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
  }, [planningPeriodHierarchy, selectedPlanId, planGroupData, selectParentId]); // Ensure proper re-execution

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
            id="edit-plan-submit-button"
            data-cy="edit-plan-submit-button"
            className="py-3 px-6 sm:py-6 sm:px-10"
            type="primary"
            onClick={() => form.submit()}
            loading={isLoading}
            disabled={totalWeight !== 100}
          >
            Submit
          </Button>
        </Tooltip>

        <Button
          id="edit-plan-cancel-button"
          data-cy="edit-plan-cancel-button"
          className="py-3 px-6 sm:py-6 sm:px-10"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
      <div className="flex-1 flex justify-end pr-5">
        <div className="my-2 font-bold mx-0 whitespace-nowrap">
          <span className="hidden md:inline">Weight Point: </span>
          <span className="md:hidden">WP: </span>
          {Math.round(Number(totalWeight) || 0)}%
        </div>
      </div>
    </div>
  );

  return (
    open && (
      <CustomDrawerLayout
        open={open === true && isEditing === true ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width="70%"
        paddingBottom={5}
        footer={footer}
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
              />
            )}
          </Form>
        )}
      </CustomDrawerLayout>
    )
  );
}

export default EditPlan;
