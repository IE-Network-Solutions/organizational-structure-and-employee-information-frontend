import { useGetScheduleByDate } from '@/store/server/features/dashboard/survey/queries';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { Button, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const Lists = () => {
  const router = useRouter();

  const { selectedDate } = useDelegationState();
  const { data: scheduleData, refetch } = useGetScheduleByDate(
    selectedDate.toISOString(),
  );

  useEffect(() => {
    refetch();
  }, [selectedDate]);

  const transformData = (input: any) => {
    if (!input || typeof input !== 'object') return [];
    const formatTime = (isoString: string) => {
      // If the string is just a date, append time to make it a valid ISO datetime
      const normalized = isoString.includes('T')
        ? isoString
        : `${isoString}T00:00:00`;
      const date = new Date(normalized);

      console.log('normalized', normalized);
      return date.toISOString().substring(11, 16);
    };

    return [
      ...(input?.meetings ?? []).map((item: any) => ({
        time: formatTime(item?.startAt),
        type: 'Meeting',
        title: item?.title,
        id: item?.id,
      })),
      ...(input?.surveys ?? []).map((item: any) => ({
        time: formatTime(item?.startAt),
        type: 'Survey',
        title: item?.title,
        id: item?.id,
      })),
      ...(input?.actionPlans ?? []).map((item: any) => ({
        time: formatTime(item?.startAt),
        type: 'Action Plan',
        title: item?.title,
        id: item?.id,
      })),
    ];
  };
  const onDetail = (id: string, type: string) => {
    if (type == 'meeting') {
      router.push(`/feedback/meeting/${id}`);
    } else if (type == 'survey') {
      router.push(`/feedback/meeting/${id}`);
    } else if (type == 'actionplan') {
      router.push(`/feedback/action-plan`);
    }
  };
  const transformedData: any = scheduleData ? transformData(scheduleData) : [];
  console.log('transformedData', transformedData);
  return (
    <div className="py-3 max-h-52 overflow-y-auto scrollbar-none">
      {transformedData?.length > 0
        ? transformedData?.map((item: any, index: number) => (
            <div key={index} className="flex items-center py-1">
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold w-6">
                  {item?.type == 'meeting' ? item.time : '     '}
                </div>
                <div
                  className={`bg-gradient-to-b ${
                    item?.type?.toLowerCase().replace(/\s+/g, '') == 'meeting'
                      ? 'from-green-600 to-transparent'
                      : item?.type?.toLowerCase().replace(/\s+/g, '') ==
                          'survey'
                        ? 'from-yellow-400 to-transparent'
                        : item?.type?.toLowerCase().replace(/\s+/g, '') ==
                            'delegatedAction'
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
                onClick={() =>
                  onDetail(
                    item?.id,
                    item?.type?.toLowerCase().replace(/\s+/g, ''),
                  )
                }
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
