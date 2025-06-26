import { useGetSchedule } from '@/store/server/features/dashboard/survey/queries';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { Button, Tooltip } from 'antd';
import React, { useEffect } from 'react';

const Lists = () => {
  const { selectedDate } = useDelegationState();
  const { data: scheduleData, refetch } = useGetSchedule(
    selectedDate.format('YYYY-MM-DD'),
  );

  useEffect(() => {
    refetch();
  }, [selectedDate]);

  const transformData = (input: any) => {
    if (!input || typeof input !== 'object') return [];

    const formatTime = (isoString: any) => {
      const date = new Date(isoString);
      return date.toISOString().substring(11, 16); // returns HH:mm
    };

    return [
      ...(input?.meetings ?? []).map((item: any) => ({
        time: formatTime(item?.startAt),
        type: 'meeting',
        title: item?.title,
      })),
      ...(input?.surveys ?? []).map((item: any) => ({
        time: formatTime(item?.startAt),
        type: 'survey',
        title: item?.title,
      })),
      ...(input?.actionPlans ?? []).map((item: any) => ({
        time: formatTime(item?.startAt),
        type: 'delegatedAction',
        title: item?.title,
      })),
    ];
  };

  const transformedData: any = scheduleData ? transformData(scheduleData) : [];

  return (
    <div className="py-3 max-h-52 overflow-y-auto scrollbar-none">
      {transformedData?.length > 0
        ? transformedData?.map((item: any, index: number) => (
            <div key={index} className="flex items-center py-1">
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold">{item.time}</div>
                <div
                  className={`bg-gradient-to-b ${
                    item?.type === 'meeting'
                      ? 'from-green-600 to-transparent'
                      : item?.type === 'survey'
                        ? 'from-yellow-400 to-transparent'
                        : item?.type === 'delegatedAction'
                          ? 'from-red-600 to-transparent'
                          : 'from-blue to-transparent'
                  } h-10 w-[3px] rounded inline-block mx-4`}
                />
                <div className="flex flex-col gap-1 p-2">
                  <Tooltip title={item?.type}>
                    <div className="text-xs">
                      {item?.type?.length >= 70
                        ? item?.type?.slice(0, 70) + '...'
                        : item?.type}
                    </div>
                  </Tooltip>
                  <Tooltip title={item?.title}>
                    <div className="text-sm">
                      {item?.title?.length >= 70
                        ? item?.title?.slice(0, 70) + '...'
                        : item?.title}
                    </div>
                  </Tooltip>
                </div>
              </div>
              <Button
                className="text-[10px] ml-auto"
                type="primary"
                size="small"
              >
                Detail
              </Button>
            </div>
          ))
        : ''}
    </div>
  );
};

export default Lists;
