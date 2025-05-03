import React from 'react';
import { Divider } from 'antd';
import DefaultCardForm from '../planForms/defaultForm';
import BoardCardForm from '../planForms/boardFormView';
import { NAME } from '@/types/enumTypes';
import { BsKey } from 'react-icons/bs';
import { GoDotFill } from 'react-icons/go';
import CustomButton from '@/components/common/buttons/customButton';

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
}) => {
  return (
    <div>
      {objective?.items?.map((e, panelIndex) => (
        // <Collapse.Panel
        //   forceRender={true}
        //   header={
        //     <div>
        //       <strong>Objective:</strong> {e.title}
        //     </div>
        //   }
        //   key={panelIndex}
        // >
        <div
          key={panelIndex}
          className="rounded-lg border-gray-200 border my-2"
        >
          {e?.keyResults?.map((kr, resultIndex) => {
            const hasMilestone = (kr?.milestones?.length ?? 0) > 0;
            const hasTargetValue =
              kr?.metricType?.name === NAME.ACHIEVE ||
              kr?.metricType?.name === NAME.MILESTONE;

            return (
              <div className="flex flex-col justify-between" key={resultIndex}>
                {/* Key Result and Weight display */}
                <div className="flex justify-between m-3">
                  <div className="font-bold flex items-center justify-center space-x-2">
                    <span>
                      <BsKey size={18} className="text-[#3636F0]" />
                    </span>
                    <span> {kr?.title} </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className=" flex items-center justify-center">
                      {' '}
                      <GoDotFill className="text-[#4E4EF1] mx-1" />
                      <span className="text-xs font-light text-[#687588]">
                        Weight
                      </span>
                    </span>
                    <span className="bg-[#E7E7FF] p-1 rounded-lg text-[#3636F0] font-semibold text-xs">
                      {' '}
                      {kr?.weight}
                    </span>
                  </div>
                </div>
                <Divider className="mt-0 mb-2" />
                <div className="flex items-center justify-between mx-10 my-2 text-xs font-semibold">
                  <span>Weekly Plan</span>
                  <span>Points</span>
                </div>

                {/* Milestone handling */}
                {hasMilestone && (
                  <>
                    {kr?.milestones?.map((ml) => (
                      <div key={ml?.id}>
                        <div className="flex items-center justify-end space-x-2 mx-4">
                          <CustomButton
                            id={`plan-as-task_${kr?.id ?? ''}${ml?.id ?? ''}`}
                            title="Add Task"
                            onClick={() => {
                              setMKAsATask(null);
                              handleAddBoard(kr?.id + ml?.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 "
                            disabled={ml?.status === 'Completed'}
                            titleClassName="!text-xs !font-medium"
                          />
                          <CustomButton
                            title="Cancel"
                            id="cancelPlanTask"
                            onClick={() => {
                              setMKAsATask(null);
                              handleAddBoard(kr?.id + ml?.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 !text-xs border-gray-100 "
                            type="default"
                            titleClassName="!text-xs !font-medium text-gray-600 hover:text-gray-800"
                          />

                          {/* {kr?.metricType?.name === NAME.MILESTONE && (
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
                            )} */}

                          {/* <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                              {weights[`names-${kr?.id + ml?.id}`] || 0}%
                            </div> */}
                        </div>

                        {/* <Divider className="my-2" /> */}

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
        </div>
        //{/* </Collapse.Panel> */}
      ))}
    </div>
  );
};

export default PlanningObjectiveComponent;
