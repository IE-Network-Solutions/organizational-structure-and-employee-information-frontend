import React from 'react';
import { Checkbox } from 'antd';
import { BsKey } from 'react-icons/bs';
import { useUpdateStatus } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useDefaultPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useDashboardPlanStore } from '@/store/uistate/features/dashboard/plan';

const Daily = ({
  allPlannedTaskForReport,
}: {
  allPlannedTaskForReport: any[];
}) => {
  const { planType } = useDashboardPlanStore();

  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();
  const activePlanPeriod = defaultPlanningPeriods?.items?.find(
    (item: any) => item?.name === planType,
  );

  const { mutate: updateStatus } = useUpdateStatus();
  function groupByKeyResultAndParentTask(data: any) {
    const keyResultMap = new Map();

    data.forEach((item: any) => {
      // Get key result info
      const keyResultId = item.keyResult?.id || item.keyResultId;
      if (!keyResultId) return;

      // Get parent task info (weekly plan task)
      const parentTaskId = item.parentTask?.id || item.parentTaskId;

      if (!keyResultMap.has(keyResultId)) {
        keyResultMap.set(keyResultId, {
          keyResult: item.keyResult,
          parentTasks: new Map(),
        });
      }

      const keyResultGroup = keyResultMap.get(keyResultId);

      if (parentTaskId) {
        if (!keyResultGroup.parentTasks.has(parentTaskId)) {
          keyResultGroup.parentTasks.set(parentTaskId, {
            parentTask: item.parentTask,
            dailyTasks: [],
          });
        }
        keyResultGroup.parentTasks.get(parentTaskId).dailyTasks.push(item);
      } else {
        // If no parent task, add directly to key result
        if (!keyResultGroup.parentTasks.has('direct')) {
          keyResultGroup.parentTasks.set('direct', {
            parentTask: { id: 'direct', task: 'Direct Tasks' },
            dailyTasks: [],
          });
        }
        keyResultGroup.parentTasks.get('direct').dailyTasks.push(item);
      }
    });

    return Array.from(keyResultMap.entries()).map(([keyResultId, group]) => ({
      keyResultId,
      keyResult: group.keyResult,
      parentTasks: Array.from(group.parentTasks.entries()).map((entry) => {
        const [parentTaskId, parentGroup] = entry as [string, any];
        return {
          parentTaskId,
          parentTask: parentGroup.parentTask,
          dailyTasks: parentGroup.dailyTasks,
        };
      }),
    }));
  }

  const planTaskArray =
    allPlannedTaskForReport &&
    groupByKeyResultAndParentTask(allPlannedTaskForReport);

  const onChange = (
    id: string,
    status: string | null,
    planningPeriodId?: string,
  ) => {
    updateStatus({
      id: id,
      status: status == 'pre-achieved' ? 'pending' : 'pre-achieved',
      planningPeriodId: planningPeriodId,
    });
  };
  return (
    <div className="h-[350px] overflow-y-auto scrollbar-track-primary scrollbar-none">
      {planTaskArray?.length > 0 ? (
        planTaskArray?.map((keyResultGroup: any) => (
          <div key={keyResultGroup?.keyResultId} className="flex flex-col pb-3">
            {/* Key Result Header */}
            <div className="text-base font-bold flex gap-3 pb-3 items-center ">
              <BsKey className="text-primary" />
              {keyResultGroup?.keyResult?.title}
            </div>

            {/* Parent Tasks (Weekly Plan Tasks) */}
            {keyResultGroup?.parentTasks?.map((parentTaskGroup: any) => (
              <div key={parentTaskGroup?.parentTaskId} className="ml-4 mb-3">
                {/* Weekly Plan Task Header */}
                <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {parentTaskGroup?.parentTask?.task}
                </div>

                {/* Daily Tasks under this Weekly Plan Task */}
                <div className="ml-4">
                  {parentTaskGroup?.dailyTasks?.map((dailyTask: any) => (
                    <div className="pb-2" key={dailyTask?.id}>
                      <Checkbox
                        checked={dailyTask?.status == 'pre-achieved'}
                        onChange={() =>
                          onChange(
                            dailyTask?.id,
                            dailyTask?.status,
                            activePlanPeriod?.id,
                          )
                        }
                        disabled={dailyTask?.status == 'completed'}
                      >
                        <div
                          className={`text-sm font-medium text-slate-500 ${
                            dailyTask?.status == 'pre-achieved'
                              ? 'line-through text-slate-400'
                              : ''
                          }`}
                        >
                          {dailyTask?.task}
                        </div>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="text-lg font-light flex h-full justify-center items-center ">
          Add your plans to view them here
        </div>
      )}
    </div>
  );
};

export default Daily;
