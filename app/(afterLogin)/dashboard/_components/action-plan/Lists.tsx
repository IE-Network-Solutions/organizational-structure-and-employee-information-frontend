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
        title: item?.name,
        id: item?.formId,
      })),
      ...(input?.actionPlans ?? []).map((item: any) => ({
        time: formatTime(item?.startAt),
        type: 'Action Plan',
        title: item?.issue,
        id: item?.id,
      })),
    ];
  };
  const onDetail = (id: string, type: string) => {
    if (type == 'meeting') {
      router.push(`/feedback/meeting/${id}`);
    } else if (type == 'survey') {
      router.push(`/feedback/categories/${id}`);
    } else if (type == 'action plan') {
      router.push(`/feedback/action-plan`);
    }
  };
  const transformedData: any = scheduleData ? transformData(scheduleData) : [];
  return (
    <div className="py-3 max-h-52 overflow-y-auto scrollbar-none">
      {transformedData?.length > 0
        ? transformedData?.map((item: any, index: number) => (
            <div key={index} className="flex items-center py-1">
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold w-3">
                  {item?.type == 'Meeting' ? item.time : '     '}
                </div>
                <div
                  className={`bg-gradient-to-b ${
                    item?.type?.toLowerCase() == 'meeting'
                      ? 'from-green-600 to-transparent'
                      : item?.type?.toLowerCase() == 'survey'
                        ? 'from-yellow-400 to-transparent'
                        : item?.type?.toLowerCase() == 'action plan'
                          ? 'from-red-600 to-transparent'
                          : 'from-blue to-transparent'
                  } h-10 w-[3px] rounded inline-block mx-4`}
                />
                <div className="flex flex-col gap-1 p-2">
                  <Tooltip title={item?.type}>
                    <div className="text-xs font-medium">
                      {item?.type?.length >= 20
                        ? item?.type?.slice(0, 20) + '...'
                        : item?.type}
                    </div>
                  </Tooltip>
                  <Tooltip title={item?.title}>
                    <div className="text-base font-bold">
                      {item?.title?.length >= 10
                        ? item?.title?.slice(0, 10) + '...'
                        : item?.title}
                    </div>
                  </Tooltip>
                </div>
              </div>
              <Button
                className="text-[10px] ml-auto"
                type="primary"
                size="small"
                onClick={() => onDetail(item?.id, item?.type?.toLowerCase())}
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
