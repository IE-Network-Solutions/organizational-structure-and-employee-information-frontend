import React from 'react';
import { Collapse, Button, Divider, Tooltip } from 'antd';
import { BiPlus } from 'react-icons/bi';
import { FaPlus } from 'react-icons/fa';
import DefaultCardForm from '../planForms/defaultForm';
import BoardCardForm from '../planForms/boardFormView';
import { NAME } from '@/types/enumTypes';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';

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
  handleAddBoard: (id: string) => void;
  handleAddName: (arg1: Record<string, string>, arg2: string) => void;
  handleRemoveBoard: (arg1: number, arg2: string) => void;
  weights: Record<string, number>;
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
    <Collapse defaultActiveKey={0}>
      {objective?.items?.map((e, panelIndex) => (
        <Collapse.Panel
          forceRender={true}
          header={
            <div>
              <strong>Objective:</strong> {e.title}
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
              <div className="flex flex-col justify-between" key={resultIndex}>
                {/* Key Result and Weight display */}
                <div className="flex justify-between">
                  <span className="font-bold">Key Result: {kr?.title} </span>
                  <span className="font-bold">Weight</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                      {resultIndex + 1}
                    </span>
                    <span className="text-[12px] font-semibold">
                      {kr?.title}
                    </span>
                  </div>

                  {/* Plan Task and Weight Handling */}
                  {!hasMilestone && (
                    <div className="flex gap-3 items-center">
                      <Button
                        id={`plan-as-task_${kr?.id ?? ''}`}
                        onClick={() => { setMKAsATask(null); handleAddBoard(kr?.id); }}
                        type="link"
                        icon={<BiPlus />}
                        className="text-[10px]"
                        disabled={
                          Number(kr?.progress) == 100 ||
                          form?.getFieldValue(`names-${kr?.id}`)?.[resultIndex]
                            ?.achieveMK
                        }
                      >
                        Add Plan Task
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
                      <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                        {weights[`names-${kr?.id}`] || 0}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Milestone handling */}
                {hasMilestone && (
                  <>
                    {kr?.milestones?.map((ml) => (
                      <div key={ml?.id}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{ml?.title}</span>
                          <div className="flex gap-2 items-center">
                            <Button
                              id={`plan-as-task_${kr?.id ?? ''}${ml?.id ?? ''}`}
                              onClick={() => {
                                setMKAsATask(null);
                                handleAddBoard(kr?.id + ml?.id);
                              }}
                              type="link"
                              icon={<BiPlus size={14} />}
                              className="text-[10px]"
                              disabled={ml?.status === 'Completed'}
                            >
                              Add Plan Task
                            </Button>

                            {/* Plan Milestone as Task */}
                            {kr?.metricType?.name === NAME.MILESTONE && (
                              <Tooltip title="Plan Milestone as a Task">
                                <Button
                                  id="plan-milestone-as-task"
                                  disabled={
                                    statuses[ml?.id] ||
                                    ml?.status === 'Completed' ||
                                    form?.getFieldValue(
                                      `names-${kr?.id + ml?.id}`,
                                    )?.[0]?.achieveMK
                                  }
                                  size="small"
                                  className="text-[10px] text-primary"
                                  icon={<FaPlus />}
                                  onClick={() => {
                                    if (!statuses[ml?.id]) {
                                      setMKAsATask({
                                        title: ml?.title,
                                        mid: ml?.id,
                                      });
                                      handleAddBoard(kr?.id + ml?.id);
                                      setClickStatus(ml?.id + '', true); // Store click status in Zustand
                                    }
                                  }}
                                />
                              </Tooltip>
                            )}

                            <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                              {weights[`names-${kr?.id + ml?.id}`] || 0}%
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
                      milestoneId={kr?.id}
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
