import React from 'react';
import { Collapse, Button, Divider, Tooltip, Dropdown } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { BsKey } from 'react-icons/bs';
import DefaultCardForm from '../planForms/defaultForm';
import { NAME } from '@/types/enumTypes';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

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
  weight?: number;
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
    keyResultId?: string | null,
    milestoneId?: string | null,
  ) => void;
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
  weights,
}) => {
  const { statuses, setClickStatus } = useClickStatus();


  return (
    <Collapse
      expandIconPosition="end"
      bordered={false}
      className="[&_.ant-collapse-item]:mb-4 [&_.ant-collapse-item]:rounded-lg [&_.ant-collapse-item]:!border-t [&_.ant-collapse-item]:!border-b [&_.ant-collapse-item]:!border-l [&_.ant-collapse-item]:!border-r [&_.ant-collapse-item]:!border-gray-200 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-header]:border-b-0 [&_.ant-collapse-content]:border-t-0 [&_.ant-collapse-content]:bg-transparent"
      defaultActiveKey={0}
      expandIcon={({ isActive }) => <UpOutlined rotate={isActive ? 180 : 0} />}
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
                <div className="flex items-start gap-3 mt-2 mb-3 justify-between flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 ml-4">
                    <BsKey size={24} className="text-[#574CFF] flex-shrink-0" />
                    <span className="text-sm font-normal truncate max-w-[260px] md:max-w-[420px]">
                      {kr?.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 justify-end flex-wrap">
                    {kr?.weight !== undefined && (
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs flex items-center gap-1.5 text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"></span>
                          Weight
                        </span>
                        <div className="rounded-lg bg-[#E8E7FF] text-[#574CFF] font-bold px-3 py-1 text-xs flex items-center justify-center min-w-[45px]">
                          {kr.weight}%
                        </div>
                      </div>
                    )}

                    {!hasMilestone && (
                      <div className="flex items-center gap-3">
                        {kr?.metricType?.name === NAME.ACHIEVE ? (
                          <Dropdown.Button
                            type="primary"
                            icon={<DownOutlined />}
                            disabled={Number(kr?.progress) == 100}
                            menu={{
                              items: [
                                {
                                  key: 'plan-keyresult-as-task',
                                  label: 'Plan Key Result as a Task',
                                  disabled:
                                    Number(kr?.progress) == 100 ||
                                    form?.getFieldValue(`names-${kr?.id}`)?.some((i: any) => i?.achieveMK),
                                  onClick: () => {
                                    setMKAsATask({ title: kr?.title, mid: kr?.id });
                                    handleAddBoard(kr?.id);
                                  },
                                },
                              ],
                            }}
                            onClick={() => {
                              setMKAsATask(null);
                              handleAddBoard(kr?.id, String(kr?.id || ''), null);
                            }}
                          >
                            Add plan Task
                          </Dropdown.Button>
                        ) : (
                          <Button
                            id={`plan-as-task_${kr?.id ?? ''}`}
                            onClick={() =>
                              handleAddBoard(kr?.id, String(kr?.id || ''), null)
                            }
                            type="primary"
                            disabled={Number(kr?.progress) == 100}
                          >
                            Add plan Task
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Divider className="my-2 h-px" />

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

                        <div className="ml-4">
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
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Form for Key Result without Milestones */}
                {!hasMilestone && (
                  <div className="ml-4 mt-2">
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
                  </div>
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
