import React from 'react';
import { Collapse, Button, Dropdown } from 'antd';
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
  currentValue?: number;
  targetValue?: number;
  milestones?: Milestone[];
  weight?: number;
  deletedAt?: string | null;
}

interface Objective {
  items: {
    title: string;
    keyResults: KeyResult[];
    deletedAt?: string | null;
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
  handleAddBoard: (id: string, metadata?: any) => void;
  handleAddName: (values: Record<string, any>, key: string) => void;
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
}) => {
  const { statuses, setClickStatus } = useClickStatus();

  return (
    <div id="planning-objective-collapse" data-cy="planning-objective-collapse">
      <Collapse
        expandIconPosition="end"
        bordered={false}
        className=""
        defaultActiveKey={0}
        expandIcon={({ isActive }) => (
          <UpOutlined rotate={isActive ? 180 : 0} />
        )}
      >
        {objective?.items?.map((e, panelIndex) => (
          <Collapse.Panel
            id={`planning-objective-panel-${panelIndex}`}
            data-cy={`planning-objective-panel-${panelIndex}`}
            forceRender={true}
            header={
              <div className="p-2 flex items-center gap-2">
                <strong>OBJECTIVE:</strong> <span>{e.title}</span>
                {e.deletedAt !== null && e.deletedAt !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                    Deleted OKR
                  </span>
                )}
              </div>
            }
            key={panelIndex}
            className="mb-4 rounded-lg overflow-hidden [&_.ant-collapse-header]:border-b-0 [&_.ant-collapse-content]:border-t-0 [&_.ant-collapse-content]:bg-transparent"
            style={{
              border: '1px solid #e5e7eb',
            }}
          >
            {e?.keyResults?.map((kr, resultIndex) => {
              const hasMilestone = (kr?.milestones?.length ?? 0) > 0;
              const hasTargetValue =
                kr?.metricType?.name === NAME.ACHIEVE ||
                kr?.metricType?.name === NAME.MILESTONE;

              return (
                <div
                  key={resultIndex}
                  className="border-2 border-gray-200 rounded-lg p-2 mb-4"
                >
                  <div className="flex flex-col gap-2 mt-2 mb-3">
                    {/* Row 1: Key Icon + Title (+ Weight for Milestone) */}
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <div className="flex items-center gap-3 ml-4 min-w-0 flex-1">
                        <BsKey
                          size={24}
                          className="text-[#574CFF] flex-shrink-0"
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span
                            className="text-sm font-bold text-[#161A2C] truncate flex-1 min-w-0"
                            title={kr?.title}
                          >
                            {kr?.title}
                          </span>
                          {kr?.deletedAt !== null &&
                            kr?.deletedAt !== undefined && (
                              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                                Deleted KR
                              </span>
                            )}
                          {e?.deletedAt !== null &&
                            e?.deletedAt !== undefined && (
                              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                                Deleted OKR
                              </span>
                            )}
                        </div>
                      </div>

                      {kr?.metricType?.name === NAME.MILESTONE &&
                        kr?.weight !== undefined && (
                          <div className="flex items-center gap-2 mr-2">
                            <span className="text-xs flex items-center gap-1.5 text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"></span>
                              Weight
                            </span>
                            <div className="rounded-lg bg-[#E8E7FF] text-[#574CFF] font-bold px-3 py-1 text-xs flex items-center justify-center min-w-[45px]">
                              {kr.weight}%
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Row 2: Progress (Left) + Weight/Actions (Right) */}
                    <div className="flex items-center justify-between flex-wrap gap-4 ml-4">
                      <div className="flex items-center gap-6">
                        {/* Dynamic Progress Indicator */}
                        {(kr?.metricType?.name === NAME.NUMERIC ||
                          kr?.metricType?.name === NAME.CURRENCY ||
                          kr?.metricType?.name === NAME.PERCENTAGE ||
                          kr?.metricType?.name === NAME.KPI) && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs flex items-center gap-1.5 text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"></span>
                              Progress
                            </span>
                            <div className="rounded-lg bg-[#E8E7FF] px-3 py-1 text-xs flex items-center justify-center min-w-[45px]">
                              {kr?.metricType?.name === NAME.PERCENTAGE ? (
                                <span className="text-[#574CFF] font-bold">
                                  {kr?.progress}%
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-[#574CFF] font-bold">
                                    {kr?.metricType?.name === NAME.CURRENCY
                                      ? '$'
                                      : ''}
                                    {(kr?.currentValue ?? 0).toLocaleString()}
                                  </span>
                                  <span className="text-gray-500">from</span>
                                  <span className="text-[#574CFF] font-bold">
                                    {kr?.metricType?.name === NAME.CURRENCY
                                      ? '$'
                                      : ''}
                                    {(kr?.targetValue ?? 0).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 mr-2">
                        {kr?.weight !== undefined &&
                          kr?.metricType?.name !== NAME.MILESTONE && (
                            <div className="flex items-center gap-2">
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
                              <div
                                id={`plan-keyresult-dropdown-${kr?.id ?? ''}`}
                                data-cy={`plan-keyresult-dropdown-${kr?.id ?? ''}`}
                              >
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
                                          form
                                            ?.getFieldValue(`names-${kr?.id}`)
                                            ?.some((i: any) => i?.achieveMK),
                                        onClick: () => {
                                          setMKAsATask({
                                            title: kr?.title,
                                            mid: kr?.id,
                                          });
                                          handleAddBoard(kr?.id, {
                                            keyResultId: kr.id,
                                            milestoneId: null,
                                            planningPeriodId,
                                            planningUserId,
                                            userId,
                                          });
                                        },
                                      },
                                    ],
                                  }}
                                  onClick={() => {
                                    setMKAsATask(null);
                                    handleAddBoard(kr?.id, {
                                      keyResultId: kr.id,
                                      milestoneId: null,
                                      planningPeriodId,
                                      planningUserId,
                                      userId,
                                    });
                                  }}
                                >
                                  <span className="sm:hidden">Add Task</span>
                                  <span className="hidden sm:inline">
                                    Add plan Task
                                  </span>
                                </Dropdown.Button>
                              </div>
                            ) : (
                              <Button
                                id={`plan-as-task_${kr?.id ?? ''}`}
                                data-cy={`plan-as-task_${kr?.id ?? ''}`}
                                onClick={() =>
                                  handleAddBoard(kr?.id, {
                                    keyResultId: kr.id,
                                    milestoneId: null,
                                    planningPeriodId,
                                    planningUserId,
                                    userId,
                                  })
                                }
                                type="primary"
                                disabled={Number(kr?.progress) == 100}
                              >
                                <span className="sm:hidden">Add Task</span>
                                <span className="hidden sm:inline">
                                  Add plan Task
                                </span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {hasMilestone && (
                    <>
                      {kr?.milestones?.map((ml) => (
                        <div key={ml?.id}>
                          <div className="ml-4 mt-2">
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                              <div className="flex items-center min-w-0 flex-1 mr-2">
                                <span className="font-bold flex-shrink-0">
                                  Milestone:
                                </span>
                                <span
                                  className="text-xs ml-2 truncate min-w-0 flex-1"
                                  title={ml?.title}
                                >
                                  {ml?.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  id={`plan-as-task_${kr?.id ?? ''}${ml?.id ?? ''}`}
                                  data-cy={`plan-milestone-dropdown-${kr?.id ?? ''}-${ml?.id ?? ''}`}
                                >
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
                                              handleAddBoard(kr?.id + ml?.id, {
                                                keyResultId: kr.id,
                                                milestoneId: ml.id,
                                                planningPeriodId,
                                                planningUserId,
                                                userId,
                                              });
                                              setClickStatus(ml?.id + '', true); // Store click status in Zustand
                                            }
                                          },
                                        },
                                      ],
                                    }}
                                    onClick={() => {
                                      setMKAsATask(null);
                                      handleAddBoard(kr?.id + ml?.id, {
                                        keyResultId: kr.id,
                                        milestoneId: ml.id,
                                        planningPeriodId,
                                        planningUserId,
                                        userId,
                                      });
                                    }}
                                  >
                                    <span className="sm:hidden">Add Task</span>
                                    <span className="hidden sm:inline">
                                      Add plan Task
                                    </span>
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
    </div>
  );
};

export default PlanningObjectiveComponent;
