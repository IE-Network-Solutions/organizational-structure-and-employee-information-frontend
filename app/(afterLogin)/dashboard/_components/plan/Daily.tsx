import React from 'react';
import { Checkbox } from 'antd';
import { MdOutlineRadioButtonChecked } from 'react-icons/md';
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
  function groupByKeyResultIdToArray(data: any) {
    const map = new Map();

    data.forEach((item: any) => {
      const key = item.parentTaskId;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });

    return Array.from(map.entries()).map(([parentTaskId, parentTask]) => ({
      parentTaskId,
      parentTask,
    }));
  }

  const planTaskArray =
    allPlannedTaskForReport &&
    groupByKeyResultIdToArray(allPlannedTaskForReport);

  const onChange = (
    id: string,
    status: string | null,
    planningPeriodId: string,
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
        planTaskArray?.map((item: any) => (
          <div key={item?.parentTaskId} className="flex flex-col gap-2  p-2">
            <div className="text-base font-bold flex gap-3 items-center ">
              <MdOutlineRadioButtonChecked className="text-primary" />
              {item?.parentTask?.[0]?.parentTask?.task}
            </div>
            <div className="">
              {item?.parentTask?.map((task: any) => (
                <div className="" key={task?.id}>
                  <Checkbox
                    checked={task?.status == 'pre-achieved'}
                    onChange={() =>
                      onChange(task?.id, task?.status, activePlanPeriod?.id)
                    }
                    disabled={task?.status == 'completed'}
                  >
                    <div
                      className={`text-base font-medium text-gray-500 ${
                        task?.status == 'pre-achieved'
                          ? 'line-through text-gray-400'
                          : ''
                      }`}
                    >
                      {task?.task}
                    </div>
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm font-light flex h-full justify-center items-center ">
          Add your plans to view them here
        </div>
      )}
    </div>
  );
};

export default Daily;
