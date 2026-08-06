import React from 'react';
import { Collapse, Button, Dropdown } from 'antd';
import { BsKey } from 'react-icons/bs';
import DefaultCardForm from '../planForms/defaultForm';
import { NAME } from '@/types/enumTypes';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import {
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  resolveKrMetricTypeLabel,
  countKeyResultPlanTasks,
  isMilestoneAchievedForPlanning,
} from '@/utils/okrKeyResultProgressDisplay';
import {
  isKeyResultBlockedForPlanning,
  isMilestoneBlockedForPlanning,
} from './buildPlanningTargets';

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
  key_type?: string;
  metricTypeName?: string;
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
  userKeyResultItems?: any[];
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
  userKeyResultItems = [],
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
              <div
                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-83"
                className="p-2 flex items-center gap-2"
              >
                <strong data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-strong-87">
                  OBJECTIVE:
                </strong>{' '}
                <span data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-84">
                  {e.title}
                </span>
                {e.deletedAt !== null && e.deletedAt !== undefined && (
                  <span
                    data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-86"
                    className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded"
                  >
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
              const apiKr = userKeyResultItems.find(
                (item) =>
                  item &&
                  item.deletedAt == null &&
                  String(item.id) === String(kr.id),
              );
              const metricTypeLabel = resolveKrMetricTypeLabel(kr, apiKr);
              const linkedTaskCount = countKeyResultPlanTasks(kr);

              return (
                <div
                  key={resultIndex}
                  className="border-2 border-gray-200 rounded-lg p-2 mb-4"
                  data-cy="planningandreporting-planning-and-reporting-components-planning-createplanobjective-tsx-div-116"
                >
                  <div
                    data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-109"
                    className="flex flex-col gap-2 mt-2 mb-3"
                  >
                    {/* Row 1: Key Icon + Title (+ Weight for Milestone) */}
                    <div
                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-111"
                      className="flex items-center justify-between gap-3 min-w-0"
                    >
                      <div
                        data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-112"
                        className="flex items-center gap-3 ml-4 min-w-0 flex-1"
                      >
                        <BsKey
                          size={24}
                          className="text-[#574CFF] flex-shrink-0"
                        />
                        <div
                          data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-117"
                          className="flex items-center gap-2 flex-1 min-w-0"
                        >
                          <span
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-142"
                            className="text-sm font-bold text-[#161A2C] truncate flex-1 min-w-0"
                            title={kr?.title}
                          >
                            {kr?.title}
                          </span>
                          {kr?.deletedAt !== null &&
                            kr?.deletedAt !== undefined && (
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-126"
                                className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded"
                              >
                                Deleted KR
                              </span>
                            )}
                          {e?.deletedAt !== null &&
                            e?.deletedAt !== undefined && (
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-132"
                                className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded"
                              >
                                Deleted OKR
                              </span>
                            )}
                        </div>
                      </div>

                      {kr?.metricType?.name === NAME.MILESTONE &&
                        kr?.weight !== undefined && (
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-141"
                            className="flex items-center gap-2 mr-2"
                          >
                            <span
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-142"
                              className="text-xs flex items-center gap-1.5 text-gray-400"
                            >
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-143"
                                className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"
                              ></span>
                              Weight
                            </span>
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-146"
                              className="rounded-lg bg-[#E8E7FF] text-[#574CFF] font-bold px-3 py-1 text-xs flex items-center justify-center min-w-[45px]"
                            >
                              {kr.weight}%
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Row 2: Metric type, tasks, progress (left) + weight/actions (right) */}
                    <div
                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-154"
                      className="flex items-center justify-between flex-wrap gap-4 ml-4"
                    >
                      <div
                        data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-155"
                        className="flex items-center flex-wrap gap-4 sm:gap-6"
                      >
                        {metricTypeLabel ? (
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-metric-type"
                            className="flex items-center gap-2"
                          >
                            <span
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-metric-type"
                              className="rounded-lg bg-[#E8E7FF] px-3 py-1 text-xs font-semibold text-[#574CFF]"
                            >
                              {metricTypeLabel}
                            </span>
                          </div>
                        ) : null}

                        {linkedTaskCount > 0 ? (
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-task-count"
                            className="flex items-center gap-2"
                          >
                            <span
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-task-count-label"
                              className="text-xs flex items-center gap-1.5 text-gray-400"
                            >
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-task-count-bullet"
                                className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"
                              />
                              Tasks
                            </span>
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-task-count-value"
                              className="rounded-lg bg-[#E8E7FF] px-3 py-1 text-xs font-bold text-[#574CFF]"
                            >
                              {linkedTaskCount}
                            </div>
                          </div>
                        ) : null}

                        {/* Achieved / target (all metric types) */}
                        {metricTypeLabel ? (
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-161"
                            className="flex items-center gap-2"
                          >
                            <span
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-162"
                              className="text-xs flex items-center gap-1.5 text-gray-400"
                            >
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-163"
                                className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"
                              ></span>
                              Achieved
                            </span>
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-166"
                              className="rounded-lg bg-[#E8E7FF] px-3 py-1 text-xs flex items-center justify-center min-w-[45px]"
                            >
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-168"
                                className="text-[#574CFF] font-bold tabular-nums"
                              >
                                {getKeyResultProgressRatioText(kr)}
                              </span>
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-progress-pct"
                                className="ml-2 text-[10px] font-medium text-gray-500"
                              >
                                ({getKeyResultProgressPercent(kr)}%)
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div
                        data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-193"
                        className="flex items-center gap-6 mr-2"
                      >
                        {kr?.weight !== undefined &&
                          kr?.metricType?.name !== NAME.MILESTONE && (
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-196"
                              className="flex items-center gap-2"
                            >
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-197"
                                className="text-xs flex items-center gap-1.5 text-gray-500"
                              >
                                <span
                                  data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-198"
                                  className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"
                                ></span>
                                Weight
                              </span>
                              <div
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-201"
                                className="rounded-lg bg-[#E8E7FF] text-[#574CFF] font-bold px-3 py-1 text-xs flex items-center justify-center min-w-[45px]"
                              >
                                {kr.weight}%
                              </div>
                            </div>
                          )}

                        {!hasMilestone &&
                          !isKeyResultBlockedForPlanning(
                            kr,
                            userKeyResultItems,
                          ) && (
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-208"
                              className="flex items-center gap-3"
                            >
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
                                    <span
                                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-255"
                                      className="sm:hidden"
                                    >
                                      Add Task
                                    </span>
                                    <span
                                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-256"
                                      className="hidden sm:inline"
                                    >
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
                                  <span
                                    data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-277"
                                    className="sm:hidden"
                                  >
                                    Add Task
                                  </span>
                                  <span
                                    data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-278"
                                    className="hidden sm:inline"
                                  >
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
                        <div
                          data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-292"
                          key={ml?.id}
                        >
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-293"
                            className="ml-4 mt-2"
                          >
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-294"
                              className="flex items-center justify-between mb-2 flex-wrap gap-3"
                            >
                              <div
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-295"
                                className="flex items-center min-w-0 flex-1 mr-2"
                              >
                                <span
                                  data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-296"
                                  className="font-bold flex-shrink-0"
                                >
                                  Milestone:
                                </span>
                                <span
                                  className="text-xs ml-2 truncate min-w-0 flex-1"
                                  title={ml?.title}
                                  data-cy="planningandreporting-planning-and-reporting-components-planning-createplanobjective-tsx-span-424"
                                >
                                  {ml?.title}
                                </span>
                              </div>
                              {!isMilestoneBlockedForPlanning(
                                kr,
                                ml,
                                userKeyResultItems,
                              ) ? (
                                <div
                                  data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-306"
                                  className="flex items-center gap-3"
                                >
                                  <span
                                    id={`plan-as-task_${kr?.id ?? ''}${ml?.id ?? ''}`}
                                    data-cy={`plan-milestone-dropdown-${kr?.id ?? ''}-${ml?.id ?? ''}`}
                                  >
                                    <Dropdown.Button
                                      type="primary"
                                      icon={<DownOutlined />}
                                      disabled={isMilestoneAchievedForPlanning(
                                        ml,
                                      )}
                                      menu={{
                                        items: [
                                          {
                                            key: 'plan-milestone-as-task',
                                            label: 'Plan Milestone as a Task',
                                            disabled:
                                              statuses[ml?.id] ||
                                              isMilestoneAchievedForPlanning(
                                                ml,
                                              ) ||
                                              form?.getFieldValue(
                                                `names-${kr?.id + ml?.id}`,
                                              )?.[0]?.achieveMK,
                                            onClick: () => {
                                              if (!statuses[ml?.id]) {
                                                setMKAsATask({
                                                  title: ml?.title,
                                                  mid: ml?.id,
                                                });
                                                handleAddBoard(
                                                  kr?.id + ml?.id,
                                                  {
                                                    keyResultId: kr.id,
                                                    milestoneId: ml.id,
                                                    planningPeriodId,
                                                    planningUserId,
                                                    userId,
                                                  },
                                                );
                                                setClickStatus(
                                                  ml?.id + '',
                                                  true,
                                                ); // Store click status in Zustand
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
                                      <span
                                        data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-356"
                                        className="sm:hidden"
                                      >
                                        Add Task
                                      </span>
                                      <span
                                        data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-357"
                                        className="hidden sm:inline"
                                      >
                                        Add plan Task
                                      </span>
                                    </Dropdown.Button>
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-366"
                            className="ml-4"
                          >
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
                    <div
                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-393"
                      className="ml-4 mt-2"
                    >
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
