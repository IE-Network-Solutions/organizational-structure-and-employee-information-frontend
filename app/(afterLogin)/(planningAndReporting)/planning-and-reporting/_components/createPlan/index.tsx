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

  const onClose = () => {
    setOpen(false);
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

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create {planningPeriodHierarchy ? planningPeriodHierarchy.name : 'New'}{' '}
      Plan
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
