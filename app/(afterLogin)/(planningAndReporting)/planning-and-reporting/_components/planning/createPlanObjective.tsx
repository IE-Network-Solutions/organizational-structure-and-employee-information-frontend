import React from 'react';
import { Button, Collapse, Dropdown, Form, InputNumber } from 'antd';
import { PlanningVpnKeyIcon } from '../PlanningVpnKeyIcon';
import { PR_PRIMARY } from '../planningUiTokens';
import DefaultCardForm from '../planForms/defaultForm';
import { NAME } from '@/types/enumTypes';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';
import { DownOutlined } from '@ant-design/icons';
import PlanningKrAISuggestions from './PlanningKrAISuggestions';

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
  planTypeNameForAi?: string;
  hasParentPlanForAi?: boolean;
  getWeeklyPlanTasksForAi?: () => Array<{
    id: string;
    task: string;
    krId?: string;
    milestoneId?: string | null;
  }>;
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
  weights,
  planTypeNameForAi,
  hasParentPlanForAi,
  getWeeklyPlanTasksForAi,
}) => {
  const { statuses, setClickStatus } = useClickStatus();
  const { setWeight } = PlanningAndReportingStore();
  const isKrCompleted = (kr: KeyResult) => {
    const progressNum = Number(kr?.progress ?? 0);
    if (Number.isFinite(progressNum) && progressNum >= 100) return true;
    if (kr?.metricType?.name === NAME.MILESTONE) {
      const milestones = Array.isArray(kr?.milestones) ? kr.milestones : [];
      if (milestones.length > 0) {
        return milestones.every((m) => m?.status === 'Completed');
      }
    }
    return false;
  };

  const getTasksPlannedForObjective = (objItem: any) => {
    const keyResults: any[] = Array.isArray(objItem?.keyResults)
      ? objItem.keyResults
      : objItem?.keyResults || [];

    return (keyResults || []).reduce((sum, kr) => {
      const milestones: any[] = Array.isArray(kr?.milestones)
        ? kr.milestones
        : [];

      if (milestones.length > 0) {
        return (
          sum +
          milestones.reduce((msSum, ml) => {
            const key = `names-${kr?.id + ml?.id}`;
            const tasks = form.getFieldValue(key);
            return msSum + (Array.isArray(tasks) ? tasks.length : 0);
          }, 0)
        );
      }

      const key = `names-${kr?.id}`;
      const tasks = form.getFieldValue(key);
      return sum + (Array.isArray(tasks) ? tasks.length : 0);
    }, 0);
  };

  return (
    <div
      id="planning-objective-collapse"
      data-cy="planning-objective-collapse"
      className="w-full"
    >
      <Collapse
        expandIconPosition="end"
        bordered={false}
        className="[&_.ant-collapse-item]:!border-0 [&_.ant-collapse-item]:!bg-white [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!bg-white [&_.ant-collapse-header]:!px-4 [&_.ant-collapse-header]:!py-3 [&_.ant-collapse-header]:!gap-3 [&_.ant-collapse-header]:!pr-4 [&_.ant-collapse-header-text]:!min-w-0 [&_.ant-collapse-header-text]:!flex-1 [&_.ant-collapse-header-text]:overflow-hidden [&_.ant-collapse-expand-icon]:!flex-shrink-0 [&_.ant-collapse-content]:!bg-white [&_.ant-collapse-content-box]:!bg-white [&_.ant-collapse-content-box]:!pt-0 [&_.ant-collapse-content-box]:!pb-2"
        defaultActiveKey={0}
        expandIcon={() => (
          <span className="box-border inline-flex h-6 w-6 items-center justify-center rounded border border-[#D9D9D9] bg-[#FFFFFF] p-0">
            <span className="inline-flex h-6 w-6 flex-row items-center justify-center gap-2 px-1">
              <DownOutlined className="text-[14px] text-[#374151]" />
            </span>
          </span>
        )}
      >
        {objective?.items?.map((e, panelIndex) => (
          <Collapse.Panel
            id={`planning-objective-panel-${panelIndex}`}
            data-cy={`planning-objective-panel-${panelIndex}`}
            forceRender={true}
            header={
              <div className="flex w-full min-w-0 flex-col items-start p-0">
                <div
                  data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-83"
                  className="flex min-h-6 w-full min-w-0 items-center gap-2 p-0"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-[#D0D5DD] bg-white flex-shrink-0 grid place-items-center"
                    aria-hidden="true"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#2D5BFF]" />
                  </span>
                  <span
                    data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-84"
                    className="h-6 min-w-0 flex-1 truncate overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold leading-6 text-[#111827]"
                    title={e.title}
                  >
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

                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const plannedCount = getTasksPlannedForObjective(e);
                    if (plannedCount <= 0) return null;

                    return (
                      <div
                        className="h-[22px] text-sm font-normal leading-[22px]"
                        style={{ color: 'rgba(0, 0, 0, 0.7)' }}
                        data-cy="planning-tasks-planned-count"
                      >
                        {plannedCount} Tasks Planned
                      </div>
                    );
                  }}
                </Form.Item>
              </div>
            }
            key={panelIndex}
            className="mb-4 overflow-hidden rounded-[10px] bg-white [&_.ant-collapse-header]:border-b-0 [&_.ant-collapse-content]:border-t-0 [&_.ant-collapse-content]:bg-white"
            style={{
              border: '1px solid #D9D9D9',
              background: '#FFFFFF',
            }}
          >
            {e?.keyResults?.map((kr, resultIndex) => {
              const hasMilestone = (kr?.milestones?.length ?? 0) > 0;
              const krDone = isKrCompleted(kr);
              const hasTargetValue =
                kr?.metricType?.name === NAME.ACHIEVE ||
                kr?.metricType?.name === NAME.MILESTONE;
              const krFormListKey = `names-${kr?.id}`;
              const plannedKeyResultWeight = Number(
                weights?.[krFormListKey] ?? kr?.weight ?? 0,
              );

              return (
                <div
                  key={resultIndex}
                  className={`mb-0 flex w-full flex-col items-center gap-3 rounded-none border-0 bg-white px-0 py-0 ${resultIndex > 0 ? 'border-t border-[#F0F0F0] pt-3' : ''}`}
                  data-cy="planningandreporting-planning-and-reporting-components-planning-createplanobjective-tsx-div-116"
                >
                  <div
                    data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-109"
                    className="flex w-full flex-col gap-3 px-4"
                  >
                    {/* Row 1: Key Icon + Task Title + Actions */}
                    <div
                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-111"
                      className="flex min-h-7 w-full items-center justify-between gap-3"
                    >
                      <div
                        data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-112"
                        className="flex min-h-7 min-w-0 flex-1 items-center gap-2"
                      >
                        <PlanningVpnKeyIcon
                          size={18}
                          className="flex-shrink-0"
                          color={PR_PRIMARY}
                          data-cy="planning-create-plan-kr-vpn-key-icon"
                        />

                        <div className="flex-1 min-w-0">
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-117"
                            className="flex items-center gap-2 min-w-0"
                          >
                            <span
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-142"
                              className="block h-[22px] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold leading-[22px] text-[#111827]"
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
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-[6px]">
                        {((kr?.metricType?.name === NAME.MILESTONE &&
                          kr?.weight !== undefined) ||
                          (!hasMilestone &&
                            kr?.metricType?.name !== NAME.MILESTONE)) && (
                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-141"
                            className="hidden h-[22px] items-center gap-[6px] sm:flex"
                          >
                            <span
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-142"
                              className="flex h-[22px] items-center gap-1 text-sm font-normal leading-[22px] text-[#687588]"
                            >
                              <span
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-143"
                                className="inline-block h-1 w-1 rounded-full bg-[#4E4EF1]"
                              />
                              Weight
                            </span>
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-146"
                              className="flex h-[22px] min-w-[29px] items-center justify-center rounded border border-[#91CAFF] bg-[#E6F4FF] px-2 py-[1px] text-xs font-normal leading-5 text-[#1677FF]"
                            >
                              {Math.round(
                                Number(
                                  kr?.metricType?.name === NAME.MILESTONE
                                    ? kr.weight
                                    : plannedKeyResultWeight,
                                ) || 0,
                              )}
                            </div>
                          </div>
                        )}

                        {/* AI */}
                        {kr?.metricType?.name !== NAME.ACHIEVE && !krDone && (
                          <PlanningKrAISuggestions
                            keyResult={kr}
                            form={form}
                            handleAddBoard={handleAddBoard}
                            handleAddName={handleAddName}
                            planTypeName={planTypeNameForAi || ''}
                            hasParentPlan={hasParentPlanForAi ?? false}
                            getWeeklyPlanTasks={getWeeklyPlanTasksForAi}
                            userId={userId}
                            planningPeriodId={planningPeriodId}
                            planningUserId={planningUserId}
                          />
                        )}

                        {!hasMilestone &&
                          kr?.metricType?.name !== NAME.MILESTONE && (
                            <>
                              {/* Add Plan */}
                              {kr?.metricType?.name === NAME.ACHIEVE ? (
                                <div
                                  id={`plan-keyresult-dropdown-${kr?.id ?? ''}`}
                                  data-cy={`plan-keyresult-dropdown-${kr?.id ?? ''}`}
                                >
                                  <Dropdown.Button
                                    type="default"
                                    icon={
                                      <DownOutlined className="text-[#8F94A3]" />
                                    }
                                    style={{
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #D9D9D9',
                                      color: '#8F94A3',
                                    }}
                                    className="h-7 w-[107px] shrink-0 rounded-lg bg-white font-normal !text-[rgba(0,0,0,0.7)] hover:!bg-[#FFFFFF]"
                                    disabled={krDone}
                                    menu={{
                                      items: [
                                        {
                                          key: 'plan-keyresult-as-task',
                                          label: 'Plan Key Result as a Task',
                                          disabled:
                                            krDone ||
                                            form
                                              ?.getFieldValue(
                                                `names-${kr?.id}`,
                                              )
                                              ?.some(
                                                (i: any) => i?.achieveMK,
                                              ),
                                          onClick: () => {
                                            setMKAsATask({
                                              title: kr?.title,
                                              mid: kr?.id,
                                            });

                                            const existingTasks =
                                              form.getFieldValue(krFormListKey) ||
                                              [];
                                            const isFirstTask =
                                              Array.isArray(existingTasks) &&
                                              existingTasks.length === 0;

                                            if (isFirstTask) {
                                              setWeight(
                                                krFormListKey,
                                                plannedKeyResultWeight,
                                              );
                                            }

                                            handleAddBoard(kr?.id, {
                                              keyResultId: kr.id,
                                              milestoneId: null,
                                              planningPeriodId,
                                              planningUserId,
                                              userId,
                                              ...(isFirstTask
                                                ? {
                                                    weight:
                                                      plannedKeyResultWeight,
                                                  }
                                                : {}),
                                            });
                                          },
                                        },
                                      ],
                                    }}
                                    onClick={() => {
                                      setMKAsATask(null);
                                      const existingTasks =
                                        form.getFieldValue(krFormListKey) ||
                                        [];
                                      const isFirstTask =
                                        Array.isArray(existingTasks) &&
                                        existingTasks.length === 0;

                                      if (isFirstTask) {
                                        setWeight(
                                          krFormListKey,
                                          plannedKeyResultWeight,
                                        );
                                      }

                                      handleAddBoard(kr?.id, {
                                        keyResultId: kr.id,
                                        milestoneId: null,
                                        planningPeriodId,
                                        planningUserId,
                                        userId,
                                        ...(isFirstTask
                                          ? { weight: plannedKeyResultWeight }
                                          : {}),
                                      });
                                    }}
                                  >
                                    <span className="sm:hidden">
                                      Add Plan
                                    </span>
                                    <span className="hidden sm:inline">
                                      Add Plan
                                    </span>
                                  </Dropdown.Button>
                                </div>
                              ) : (
                                <Button
                                  id={`plan-as-task_${kr?.id ?? ''}`}
                                  data-cy={`plan-as-task_${kr?.id ?? ''}`}
                                  onClick={() => {
                                    const existingTasks =
                                      form.getFieldValue(krFormListKey) || [];
                                    const isFirstTask =
                                      Array.isArray(existingTasks) &&
                                      existingTasks.length === 0;

                                    if (isFirstTask) {
                                      setWeight(
                                        krFormListKey,
                                        plannedKeyResultWeight,
                                      );
                                    }

                                    handleAddBoard(kr?.id, {
                                      keyResultId: kr.id,
                                      milestoneId: null,
                                      planningPeriodId,
                                      planningUserId,
                                      userId,
                                      ...(isFirstTask
                                        ? { weight: plannedKeyResultWeight }
                                        : {}),
                                    });
                                  }}
                                  type="default"
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #D9D9D9',
                                    color: '#8F94A3',
                                  }}
                                  className="h-7 w-[107px] shrink-0 rounded-lg bg-white font-normal !text-[rgba(0,0,0,0.7)] hover:!bg-[#FFFFFF]"
                                  disabled={krDone}
                                >
                                  <span className="flex items-center justify-between gap-2">
                                    <span>Add Plan</span>
                                    <DownOutlined className="text-[#8F94A3]" />
                                  </span>
                                </Button>
                              )}
                            </>
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
                            className="mx-auto mt-0 w-full px-4"
                          >
                            <div
                              data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-294"
                              className="flex h-7 w-full items-center justify-between gap-3 border-0 bg-transparent px-0 py-0"
                            >
                              <div
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-295"
                                className="flex items-center min-w-0 flex-1 mr-2 gap-2"
                              >
                                <PlanningVpnKeyIcon
                                  size={14}
                                  className="flex-shrink-0"
                                  color={PR_PRIMARY}
                                />
                                <span
                                  className="text-sm text-gray-700 truncate min-w-0 flex-1"
                                  title={ml?.title}
                                  data-cy="planningandreporting-planning-and-reporting-components-planning-createplanobjective-tsx-span-424"
                                >
                                  {ml?.title}
                                </span>
                              </div>
                              <div
                                data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-306"
                                className="flex items-center gap-3"
                              >
                                <span
                                  id={`plan-as-task_${kr?.id ?? ''}${ml?.id ?? ''}`}
                                  data-cy={`plan-milestone-dropdown-${kr?.id ?? ''}-${ml?.id ?? ''}`}
                                >
                                  <Dropdown.Button
                                    type="default"
                                    icon={<DownOutlined className="text-[#8F94A3]" />}
                                    style={{
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #D9D9D9',
                                      color: '#8F94A3',
                                    }}
                                    className="h-7 w-[107px] rounded-lg bg-white font-normal !text-[rgba(0,0,0,0.7)] hover:bg-[#FFFFFF]"
                                    disabled={ml?.status === 'Completed' || krDone}
                                    menu={{
                                      items: [
                                        {
                                          key: 'plan-milestone-as-task',
                                          label: 'Plan Milestone as a Task',
                                          disabled:
                                            statuses[ml?.id] ||
                                            krDone ||
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
                                    <span
                                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-356"
                                      className="sm:hidden"
                                    >
                                      Add Plan
                                    </span>
                                    <span
                                      data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-span-357"
                                      className="hidden sm:inline"
                                    >
                                      Add Plan
                                    </span>
                                  </Dropdown.Button>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            data-cy="planning-and-reporting-components-planning-createplanobjective-tsx-createplanobjective-div-366"
                            className="mx-auto w-full px-4"
                          >
                            {/* Forms for Key Result and Milestone */}
                            {planningPeriodId && planningUserId && (
                              <>
                                <div className="flex gap-3">
                                  <div className="min-w-0 flex-1">
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
                                      compactLayout={true}
                                    />
                                  </div>
                                  <Form.Item noStyle shouldUpdate>
                                    {() => {
                                      const listName = `names-${kr?.id + ml?.id}`;
                                      const rows = form.getFieldValue(listName) || [];
                                      if (!Array.isArray(rows) || rows.length === 0) return null;
                                      return (
                                        <div className="flex w-[107px] shrink-0 flex-col gap-[10px] py-[5px]">
                                          {rows.map((_: any, idx: number) => (
                                            <Button
                                              key={`${listName}-add-plan-${idx}`}
                                              type="default"
                                              className="h-7 w-[107px] rounded-lg bg-white px-2 font-normal !text-[rgba(0,0,0,0.7)] hover:!text-[#6B7280] hover:!bg-white"
                                              style={{ border: '1px solid #D9D9D9' }}
                                              disabled={ml?.status === 'Completed' || krDone}
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
                                              <span className="flex w-full items-center justify-between gap-2">
                                                <span className="hidden sm:inline">Add Plan</span>
                                                <span className="sm:hidden text-base leading-none">+</span>
                                                <DownOutlined className="text-[#8F94A3]" />
                                              </span>
                                            </Button>
                                          ))}
                                        </div>
                                      );
                                    }}
                                  </Form.Item>
                                </div>
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
                      className="mx-auto mt-1.5 w-full px-4"
                    >
                      {planningPeriodId && planningUserId && (
                        <div className="flex gap-3">
                          <div className="min-w-0 flex-1">
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
                              compactLayout={true}
                            />
                          </div>
                          <Form.Item noStyle shouldUpdate>
                            {() => {
                              const listName = `names-${kr?.id}`;
                              const rows = form.getFieldValue(listName) || [];
                              if (!Array.isArray(rows) || rows.length === 0) return null;
                              return (
                                <div className="flex w-[107px] shrink-0 flex-col gap-[10px] py-[5px]">
                                  {rows.map((_: any, idx: number) => (
                                    <Button
                                      key={`${listName}-add-plan-${idx}`}
                                      type="default"
                                      className="h-7 w-[107px] rounded-lg bg-white px-2 font-normal !text-[rgba(0,0,0,0.7)] hover:!text-[#6B7280] hover:!bg-white"
                                      style={{ border: '1px solid #D9D9D9' }}
                                      disabled={krDone}
                                      onClick={() => {
                                        setMKAsATask(null);
                                        const existingTasks =
                                          form.getFieldValue(krFormListKey) || [];
                                        const isFirstTask =
                                          Array.isArray(existingTasks) &&
                                          existingTasks.length === 0;

                                        if (isFirstTask) {
                                          setWeight(krFormListKey, plannedKeyResultWeight);
                                        }

                                        handleAddBoard(kr?.id, {
                                          keyResultId: kr.id,
                                          milestoneId: null,
                                          planningPeriodId,
                                          planningUserId,
                                          userId,
                                          ...(isFirstTask
                                            ? { weight: plannedKeyResultWeight }
                                            : {}),
                                        });
                                      }}
                                    >
                                      <span className="flex w-full items-center justify-between gap-2">
                                        <span className="hidden sm:inline">Add Plan</span>
                                        <span className="sm:hidden text-base leading-none">+</span>
                                        <DownOutlined className="text-[#8F94A3]" />
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              );
                            }}
                          </Form.Item>
                        </div>
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
