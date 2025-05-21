import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { Button, List, Tooltip } from 'antd';
import React from 'react';

const Lists = () => {
  const { selectedDate } = useDelegationState();
  const surveyList = [
    {
      date: '2025-05-04',
      data: [
        {
          time: '14:00',
          type: 'survey',
          title: 'bi weekly',
        },
        {
          time: '16:00',
          type: 'delegatedAction',
          title: 'Project Review',
        },
      ],
    },
    {
      date: '2025-05-15',
      data: [
        {
          time: '11:00',
          type: 'survey',
          title: 'Weekly Check-in',
        },
        {
          time: '12:00',
          type: 'meeting',
          title: 'Team Sync',
        },

        {
          time: '15:00',
          type: 'delegatedAction',
          title: 'Client Feedback Session',
        },
      ],
    },
    {
      date: '2025-05-21',
      data: [
        {
          time: '10:00',
          type: 'meeting',
          title: 'Sprint Planning',
        },
        {
          time: '13:00',
          type: 'survey',
          title: 'Monthly Review',
        },
        {
          time: '16:00',
          type: 'delegatedAction',
          title: 'Team Retrospective',
        },
      ],
    },
    {
      date: '2025-04-30',
      data: [
        {
          time: '09:00',
          type: 'meeting',
          title: 'Project Update',
        },
      ],
    },
  ];

  const survey = surveyList.find(
    (item) => item.date === selectedDate.format('YYYY-MM-DD'),
  );

  return (
    <div className=" py-3">
      {survey?.data?.map((item: any, index: number) => (
        <div key={index} className="flex items-center py-1">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold">{item.time}</div>
            <div
              className={`bg-gradient-to-b ${item?.type == 'meeting' ? 'from-green-600 to-transparent' : item?.type == 'survey' ? 'from-yellow-400 to-transparent' : item?.type == 'delegatedAction' ? 'from-red-600 to-transparent' : 'from-blue to-transparent'}  h-10 w-[3px] rounded inline-block mx-4`}
            />
            <div className="flex flex-col gap-1  p-2 ">
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

          <Button className="text-[10px] ml-auto" type="primary" size="small">
            Fill
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Lists;
