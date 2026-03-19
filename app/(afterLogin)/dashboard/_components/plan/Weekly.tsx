import { useUpdateStatus } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useDefaultPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useDashboardPlanStore } from '@/store/uistate/features/dashboard/plan';
import { Checkbox } from 'antd';
import React from 'react';

const Weekly = ({
  allPlannedTaskForReport,
}: {
  allPlannedTaskForReport: any[];
}) => {
  const { mutate: updateStatus } = useUpdateStatus();
  const { planType } = useDashboardPlanStore();

  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();
  const activePlanPeriod = defaultPlanningPeriods?.items?.find(
    (item: any) => item?.name === planType,
  );
  function groupByKeyResultIdToArray(data: any) {
    const map = new Map();

    data.forEach((item: any) => {
      const key = item.keyResultId;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });

    return Array.from(map.entries()).map(([keyResultId, task]) => ({
      keyResultId,
      task,
    }));
  }

  const planTaskArray =
    allPlannedTaskForReport &&
    groupByKeyResultIdToArray(allPlannedTaskForReport);

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
      data-cy="dashboard-plan-weekly-container"
    >
      {planTaskArray?.length > 0 ? (
        planTaskArray?.map((item: any) => (
          <div
            key={item?.keyResultId}
            className="flex flex-col"
            data-cy="dashboard-plan-weekly-key-result-group"
          >
            {/* <div
              className="text-base font-bold flex gap-3 pb-3 items-center "
              data-cy="dashboard-plan-weekly-key-result-header"
            >
              <BsKey
                className="text-primary"
                data-cy="dashboard-plan-weekly-key-result-icon"
              />
              <span data-cy="dashboard-plan-weekly-key-result-title">
                {item?.task?.[0]?.keyResult?.title}
              </span>
            </div> */}
            <div
              className="ml-0"
              data-cy="dashboard-plan-weekly-tasks-container"
            >
              {item?.task?.map((task: any) => (
                <div
                  className="mb-3"
                  key={task?.id}
                  data-cy={`dashboard-plan-weekly-task-item-${task?.id}`}
                >
                  <Checkbox
                    className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-[#52C41A] [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-[#52C41A]"
                    checked={task?.status == 'pre_achieved'}
                    onChange={() =>
                      onChange(task?.id, task?.status, activePlanPeriod?.id)
                    }
                    disabled={task?.status == 'completed'}
                    data-cy={`dashboard-plan-weekly-task-checkbox-${task?.id}`}
                  >
                    <div
                      className={`text-sm font-medium truncate max-w-full ${
                        task?.status == 'pre_achieved'
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                      data-cy={`dashboard-plan-weekly-task-text-${task?.id}`}
                      title={task?.task}
                    >
                      <span
                        className="block truncate"
                        data-cy={`dashboard-plan-weekly-task-text-content-${task?.id}`}
                      >
                        {task?.task}
                      </span>
                    </div>
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div
          className="text-lg font-light flex min-h-[190px] justify-center items-center "
          data-cy="dashboard-plan-weekly-empty"
        >
          <span data-cy="dashboard-plan-weekly-empty-text">
            Add your plans to view them here
          </span>
        </div>
      )}
    </div>
  );
};

export default Weekly;
