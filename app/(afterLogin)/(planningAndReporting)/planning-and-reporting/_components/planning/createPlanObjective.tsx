import React from 'react';
import { Collapse, Button, Divider, Tooltip, Dropdown } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { BsKey } from 'react-icons/bs';
import DefaultCardForm from '../planForms/defaultForm';
import BoardCardForm from '../planForms/boardFormView';
import { NAME } from '@/types/enumTypes';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';
import { DownOutlined } from '@ant-design/icons';

interface Milestone {
  id: number;
  title: string;
  status: string;
}

interface KeyResult {
  id: string;
  title: string;
  metricType: {
    name: string;
  };
  progress?: string;
  milestones?: Milestone[];
}

interface Objective {
  items: {
    title: string;
    keyResults: KeyResult[];
  }[];
}

interface CollapseComponentProps {
  objective: Objective;
  form: any;
  planningPeriodId: string;
  userId: string;
  planningUserId: string;
  mkAsATask: boolean | null;
  setMKAsATask: (value: any) => void;
  handleAddBoard: (
    id: string,
    keyResultId?: string,
    milestoneId?: string | null,
    parentTaskId?: string | null,
  ) => void;
  handleAddName: (arg1: Record<string, string>, arg2: string) => void;
  handleRemoveBoard: (arg1: number, arg2: string) => void;
  weights: Record<string, number>;
  failedTasksByKeyResult?: Record<
    string,
    Record<string | 'noMilestone', any[]>
  >;
}

const PlanningObjectiveComponent: React.FC<CollapseComponentProps> = ({
  objective,
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
  const { statuses, setClickStatus } = useClickStatus();


  return (
    <Collapse
      expandIconPosition="end"
      bordered={false}
      className="[&_.ant-collapse-item]:mb-4 [&_.ant-collapse-item]:rounded-lg [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-gray-200 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-header]:border-b-0 [&_.ant-collapse-content]:border-t-0 [&_.ant-collapse-content]:bg-transparent"
      defaultActiveKey={0}
    >
      {objective?.items?.map((e, panelIndex) => (
        <Collapse.Panel
          forceRender={true}
          header={
            <div className="p-2">
              <strong>OBJECTIVE:</strong> {e.title}
            </div>
          }
          key={panelIndex}
        >
          {e?.keyResults?.map((kr, resultIndex) => {
            const hasMilestone = (kr?.milestones?.length ?? 0) > 0;
            const hasTargetValue =
              kr?.metricType?.name === NAME.ACHIEVE ||
              kr?.metricType?.name === NAME.MILESTONE;

            return (
              <div key={resultIndex} className="border-2 border-gray-200 rounded-lg p-2 mb-4">
                <div className="flex items-start gap-3 mt-2 justify-between flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <BsKey size={24} className="text-[#574CFF] flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-normal truncate max-w-[260px] md:max-w-[420px]">
                      {kr?.title}
                    </span>
                  </div>

                  {/* Plan Task and Weight Handling for key results without milestones */}
                  {!hasMilestone && (
                    <div className="flex items-center gap-3 justify-end flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                          weight
                        </span>
                        <div className="rounded-lg border-gray-100 border bg-indigo-200 text-indigo-600 font-bold w-14 h-7 text-xs flex items-center justify-center">
                          {weights[`names-${kr?.id}`] || 0}%
                        </div>
                      </div>
                      <Button
                        id={`plan-as-task_${kr?.id ?? ''}`}
                        onClick={() =>
                          handleAddBoard(kr?.id, String(kr?.id || ''), null)
                        }
                        type="primary"
                        disabled={
                          Number(kr?.progress) == 100 ||
                          form?.getFieldValue(`names-${kr?.id}`)?.[resultIndex]
                            ?.achieveMK
                        }
                      >
                        Add plan Task
                      </Button>

                      {/* Add Achieve MK as a Task */}
                      {kr?.metricType?.name === NAME.ACHIEVE && (
                        <Tooltip title="Plan keyResult as a Task ">
                          <Button
                            id="plan-key-result-as-task"
                            size="small"
                            className="text-[10px] text-primary"
                            icon={<FaPlus />}
                            disabled={
                              Number(kr?.progress) == 100 ||
                              form?.getFieldValue(`names-${kr?.id}`)?.[0]
                                ?.achieveMK
                            }
                            onClick={() => {
                              setMKAsATask({ title: kr?.title, mid: kr?.id });
                              handleAddBoard(kr?.id);
                            }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  )}
                </div>

                {/* Milestone handling */}
                {hasMilestone && (
                  <>
                    {kr?.milestones?.map((ml) => (
                      <div key={ml?.id}>
                        <div className="ml-4 mt-2">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                            <div className="flex items-center">
                              <span className="font-bold">Milestone:</span>
                              <span className="text-xs ml-2">{ml?.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                                  weight
                                </span>
                                <div className="rounded-lg border-gray-100 border bg-indigo-200 text-indigo-600 font-bold w-14 h-7 text-xs flex items-center justify-center">
                                  {weights[`names-${kr?.id + ml?.id}`] || 0}%
                                </div>
                              </div>
                              <span id={`plan-as-task_${kr?.id ?? ''}${ml?.id ?? ''}`}>
                                <Dropdown.Button
                                  type="primary"
                                  icon={<DownOutlined />}
                                  disabled={ml?.status === 'Completed'}
                                  menu={{
                                    items: [
                                      {
                                        key: 'plan-milestone-as-task',
                                        label: 'Plan Milestone as a Task',
                                        disabled:
                                          statuses[ml?.id] ||
                                          ml?.status === 'Completed' ||
                                          form?.getFieldValue(
                                            `names-${kr?.id + ml?.id}`,
                                          )?.[0]?.achieveMK,
                                        onClick: () => {
                                          if (!statuses[ml?.id]) {
                                            setMKAsATask({
                                              title: ml?.title,
                                              mid: ml?.id,
                                            });
                                            handleAddBoard(kr?.id + ml?.id);
                                            setClickStatus(ml?.id + '', true); // Store click status in Zustand
                                          }
                                        },
                                      },
                                    ],
                                  }}
                                  onClick={() => {
                                    setMKAsATask(null);
                                    handleAddBoard(
                                      kr?.id + ml?.id,
                                      String(kr?.id || ''),
                                      ml?.id ? String(ml.id) : null,
                                    );
                                  }}
                                >
                                  Add plan Task
                                </Dropdown.Button>
                              </span>
                            </div>
                          </div>
                        </div>

                        <Divider className="my-2" />

                        {/* Forms for Key Result and Milestone */}
                        {planningPeriodId && planningUserId && (
                          <>
                            <DefaultCardForm
                              kId={kr?.id}
                              hasTargetValue={hasTargetValue}
                              hasMilestone={hasMilestone}
                              milestoneId={ml?.id?.toString() || null}
                              name={`names-${kr?.id + ml?.id}`}
                              form={form}
                              planningPeriodId={planningPeriodId}
                              userId={userId}
                              planningUserId={planningUserId}
                              isMKAsTask={!!mkAsATask}
                              keyResult={kr}
                            />

                            <BoardCardForm
                              form={form}
                              handleAddName={handleAddName}
                              milestoneId={ml?.id}
                              handleRemoveBoard={handleRemoveBoard}
                              kId={kr?.id}
                              hideTargetValue={hasTargetValue}
                              name={kr?.id + ml.id}
                              isMKAsTask={!!mkAsATask}
                              keyResult={kr}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Form for Key Result without Milestones */}
                {!hasMilestone && (
                  <>
                    <Divider className="my-2" />
                    {planningPeriodId && planningUserId && (
                      <DefaultCardForm
                        kId={kr?.id}
                        hasTargetValue={hasTargetValue}
                        hasMilestone={hasMilestone}
                        milestoneId={null}
                        name={`names-${kr?.id}`}
                        form={form}
                        planningPeriodId={planningPeriodId}
                        userId={userId}
                        planningUserId={planningUserId}
                        isMKAsTask={!!mkAsATask}
                        keyResult={kr}
                      />
                    )}
                    <BoardCardForm
                      form={form}
                      handleAddName={handleAddName}
                      handleRemoveBoard={handleRemoveBoard}
                      kId={kr?.id}
                      hideTargetValue={hasTargetValue}
                      name={kr?.id}
                      isMKAsTask={!!mkAsATask}
                      keyResult={kr}
                    />
                  </>
                )}
              </div>
            );
          })}
        </Collapse.Panel>
      ))}
    </Collapse>
  );
};

export default PlanningObjectiveComponent;
