import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Form, Spin, Tooltip } from 'antd';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  AllPlanningPeriods,
  useGetPlanningPeriodsHierarchy,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import PlanningHierarchyComponent from '../planning/createPlanHierarchy';
import PlanningObjectiveComponent from '../planning/createPlanObjective';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';
import AISuggestionsModal from '@/components/ai/AISuggestionsModal';

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

  const onClose = () => {
    setOpen(false);
    resetToInitial();
    form.resetFields();
    resetWeights();
  };
  const { mutate: createTask, isLoading } = useCreatePlanTasks();
  const { data: objective } = useFetchObjectives(userId);
  const { data: planningPeriods } = AllPlanningPeriods();
  // const planningPeriodId =
  //   planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.id;
  const planningPeriodId = activePlanPeriodId;

  const {
    data: planningPeriodHierarchy,
    isLoading: loadingPlanningPeriodHierarchy,
  } = useGetPlanningPeriodsHierarchy(
    userId,
    planningPeriodId || '', // Provide a default string value if undefined
  );

  // Ensure planningPeriods is always an array before using find
  const safePlanningPeriods = Array.isArray(planningPeriods)
    ? planningPeriods
    : [];

  // Use find safely
  const planningUserId = safePlanningPeriods.find(
    (item: any) => item.planningPeriod?.id == planningPeriodId,
  )?.id;

  // const modalHeader = (
  //   <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
  //     Create {planningPeriodHierarchy ? planningPeriodHierarchy.name : 'New'}{' '}
  //     Plan
  //   </div>
  // );
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

  const modalHeader = (
    <div className="flex items-center justify-between text-xl font-extrabold text-gray-800 p-4">
      <div>
        Create {planningPeriodHierarchy ? planningPeriodHierarchy.name : 'New'}{' '}
        Plan
      </div>
      <div className="text-right">
        {/* AI Suggestions button + modal */}
        <AISuggestionsModal
          getKeyResults={() => {
            const out: { id: string; title: string }[] = [];

            if (!planningPeriodHierarchy?.parentPlan) {
              // Weekly Plan: Get Key Results from Objectives
              objective?.items?.forEach((obj: any) => {
                obj?.keyResults?.forEach((kr: any) => {
                  if (kr?.id && kr?.title) {
                    out.push({ id: String(kr.id), title: kr.title });
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
  const handleOnFinish = (values: Record<string, any>) => {
    const mergeValues = (obj: any) => {
      return Object.entries(obj)
        .filter(([key]) => key.startsWith('names-'))
        .map(([, value]) => value)
        .filter((value) => Array.isArray(value))
        .flat();
    };
    const finalValues = mergeValues(values);

    // return;
    createTask(
      { tasks: finalValues },
      {
        onSuccess: () => {
          resetToInitial();
          form.resetFields();
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
                  id="submit-plan-button-for-planning-and-reporting"
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
                id="cancel-plan-button-for-planning-and-reporting"
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

export default CreatePlan;
