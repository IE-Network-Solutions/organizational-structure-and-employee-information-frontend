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
              />
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
