import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Collapse, Divider, Form } from 'antd';
import React from 'react';
import { BiPlus } from 'react-icons/bi';
import BoardCardForm from './boardFormView';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import DefaultCardForm from './defaultForm';

function CreatePlan({}) {
  const { open, setOpen, weights } = PlanningAndReportingStore();

  const onClose = () => setOpen(false);
  const [form] = Form.useForm();
  const { mutate: createTask } = useCreatePlanTasks();
  const { data: objective } = useFetchObjectives(
    '53d2c779-ddb9-4b02-a2a8-4ca9f0171ca3',
  );
  //TODO: Replace the hardcoded user value
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create New plan
    </div>
  );

  const handleAddName = (
    currentBoardValues: Record<string, string>,
    kId: string,
  ) => {
    console.log(currentBoardValues);
    const namesKey = `names-${kId}`;
    const names = form.getFieldValue(namesKey) || [];
    form.setFieldsValue({ [namesKey]: [...names, currentBoardValues] });
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

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={onClose}
        modalHeader={modalHeader}
        width="40%"
      >
        <Form
          layout="vertical"
          form={form}
          name="dynamic_form_item"
          style={{ maxWidth: 600 }}
          onFinish={(values) => {
            console.log(values);

            createTask(values.names, {
              onSuccess: () => {
                form.resetFields();
              },
            });
          }}
        >
          <Collapse defaultActiveKey={1}>
            {objective?.items?.map(
              (e: Record<string, any>, panelIndex: number) => {
                return (
                  <Collapse.Panel header={e.title} key={panelIndex}>
                    {e?.keyResults?.map(
                      (kr: Record<string, any>, resultIndex: number) => {
                        let hasMilestone =
                          kr?.milestones && kr?.milestones?.length > 0
                            ? true
                            : false;
                        let hasTargetValue =
                          kr?.metricType?.name === 'Achieve' ||
                          kr?.metricType?.name === 'Milestone'
                            ? true
                            : false;
                        return (
                          <>
                            {' '}
                            <div
                              className="flex justify-between"
                              key={resultIndex}
                            >
                              <h4>{kr?.title}</h4>
                            </div>
                            {hasMilestone ? (
                              <>
                                {kr?.milestones?.map(
                                  (ml: Record<string, any>) => {
                                    return (
                                      <>
                                        <div className="flex gap-3">
                                          <span>{ml?.title}</span>{' '}
                                          <Button
                                            onClick={() =>
                                              handleAddBoard(kr?.id + ml?.id)
                                            }
                                            type="link"
                                            icon={<BiPlus />}
                                            iconPosition="start"
                                          >
                                            Add Plan Task
                                          </Button>{' '}
                                          <div>
                                            Total Weight:
                                            {weights[
                                              `names-${kr?.id + ml?.id}`
                                            ] || 0}
                                          </div>
                                        </div>
                                      </>
                                    );
                                  },
                                )}
                              </>
                            ) : (
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleAddBoard(kr?.id)}
                                  type="link"
                                  icon={<BiPlus />}
                                  iconPosition="start"
                                >
                                  Add Plan Task
                                </Button>
                                <div>
                                  Total Weight:
                                  {weights[`names-${kr?.id}`] || 0}
                                </div>
                              </div>
                            )}
                            {hasMilestone ? (
                              <>
                                {kr?.milestones?.map(
                                  (ml: Record<string, any>) => {
                                    return (
                                      <>
                                        <Divider className="my-2" />
                                        <DefaultCardForm
                                          kId={kr?.id}
                                          hasTargetValue={hasTargetValue}
                                          hasMilestone={hasMilestone}
                                          milestoneId={null}
                                          name={`names-${kr?.id + ml?.id}`}
                                          form={form}
                                        />
                                        <BoardCardForm
                                          form={form}
                                          handleAddName={handleAddName}
                                          handleRemoveBoard={handleRemoveBoard}
                                          kId={kr?.id}
                                          hideTargetValue={hasTargetValue}
                                          name={kr?.id + ml?.id}
                                        />
                                      </>
                                    );
                                  },
                                )}
                              </>
                            ) : (
                              <>
                                <Divider className="my-2" />
                                <DefaultCardForm
                                  kId={kr?.id}
                                  hasTargetValue={hasTargetValue}
                                  hasMilestone={hasMilestone}
                                  milestoneId={null}
                                  name={`names-${kr?.id}`}
                                  form={form}
                                />
                                <BoardCardForm
                                  form={form}
                                  handleAddName={handleAddName}
                                  handleRemoveBoard={handleRemoveBoard}
                                  kId={kr?.id}
                                  hideTargetValue={hasTargetValue}
                                  name={kr?.id}
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
          </Collapse>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
}

export default CreatePlan;
