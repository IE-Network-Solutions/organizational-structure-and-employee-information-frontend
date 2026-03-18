import React from 'react';
import { Checkbox } from 'antd';
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
      status: status == 'pre_achieved' ? 'pre_pending' : 'pre_achieved',
      planningPeriodId: planningPeriodId,
    });
  };
  return (
    <div
      className=" overflow-y-auto scrollbar-track-primary scrollbar-none"
      data-cy="dashboard-plan-daily-container"
    >
      {planTaskArray?.length > 0 ? (
        planTaskArray?.map((keyResultGroup: any) => (
          <div
            key={keyResultGroup?.keyResultId}
            className="flex flex-col mb-3"
            data-cy="dashboard-plan-daily-key-result-group"
          >
            {/* Key Result Header */}
            {/* <div
              className="text-base font-bold flex gap-3 pb-3 items-center "
              data-cy="dashboard-plan-daily-key-result-header"
            >
              <BsKey
                className="text-primary"
                data-cy="dashboard-plan-daily-key-result-icon"
              />
              <span data-cy="dashboard-plan-daily-key-result-title">
                {keyResultGroup?.keyResult?.title}
              </span>
            </div> */}

            {/* Parent Tasks (Weekly Plan Tasks) */}
            {keyResultGroup?.parentTasks?.map((parentTaskGroup: any) => (
              <div
                key={parentTaskGroup?.parentTaskId}
                data-cy={`dashboard-plan-daily-parent-task-group-${parentTaskGroup?.parentTaskId}`}
              >
                {/* Weekly Plan Task Header */}
                {/* <div
                  className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  data-cy={`dashboard-plan-daily-parent-task-header-${parentTaskGroup?.parentTaskId}`}
                >
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    data-cy={`dashboard-plan-daily-parent-task-bullet-${parentTaskGroup?.parentTaskId}`}
                  ></div>
                  <span
                    data-cy={`dashboard-plan-daily-parent-task-title-${parentTaskGroup?.parentTaskId}`}
                  >
                    {parentTaskGroup?.parentTask?.task}
                  </span>
                </div> */}

                {/* Daily Tasks under this Weekly Plan Task */}
                <div
                  className="ml-3"
                  data-cy={`dashboard-plan-daily-tasks-container-${parentTaskGroup?.parentTaskId}`}
                >
                  {parentTaskGroup?.dailyTasks?.map((dailyTask: any) => (
                    <div
                      key={dailyTask?.id}
                      data-cy={`dashboard-plan-daily-task-item-${dailyTask?.id}`}
                    >
                      <Checkbox
                        className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-[#52C41A] [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-[#52C41A]"
                        checked={dailyTask?.status == 'pre_achieved'}
                        onChange={() =>
                          onChange(
                            dailyTask?.id,
                            dailyTask?.status,
                            activePlanPeriod?.id,
                          )
                        }
                        disabled={dailyTask?.status == 'completed'}
                        data-cy={`dashboard-plan-daily-task-checkbox-${dailyTask?.id}`}
                      >
                        <div
                          className={`text-sm font-medium truncate max-w-full ${
                            dailyTask?.status == 'pre_achieved'
                              ? 'line-through text-gray-400'
                              : 'text-gray-900'
                          }`}
                          data-cy={`dashboard-plan-daily-task-text-${dailyTask?.id}`}
                          title={dailyTask?.task}
                        >
                          <span
                            className="block truncate"
                            data-cy={`dashboard-plan-daily-task-text-content-${dailyTask?.id}`}
                          >
                            {dailyTask?.task}
                          </span>
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
        <div
          className="text-lg font-light flex h-full justify-center items-center "
          data-cy="dashboard-plan-daily-empty"
        >
          <span data-cy="dashboard-plan-daily-empty-text">
            Add your plans to view them here
          </span>
        </div>
      )}
    </div>
  );
};

export default Daily;
