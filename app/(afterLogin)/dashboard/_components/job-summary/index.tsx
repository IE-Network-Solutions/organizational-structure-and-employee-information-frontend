import React from 'react';
import { Card } from 'antd';
import { useGetJobSummary } from '@/store/server/features/dashboard/job-summary/queries';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
const JobSummary = () => {
  const { data: jobSummary, isLoading } = useGetJobSummary('Open');
  dayjs.extend(relativeTime);
  return (
    <Card loading={isLoading} className="w-full mx-auto max-h-96 shadow-lg">
      <div className="flex justify-start items-center mb-2">
        <div className=" font-bold text-base lg:text-lg">
          Latest Jobs Posted
        </div>
      </div>
      {Array.isArray(jobSummary) && jobSummary.length > 0 ? (
        <div className="flex flex-col gap-3 shadow-lg overflow-y-auto max-h-80 scrollbar-none">
          {jobSummary?.map((items: any, index: number) => (
            <div
              // bodyStyle={{ padding: '0px', margin: '0px' }}
              key={items?.id || index}
              className="rounded-xl shadow-lg flex  justify-between items-center gap-3 p-2  "
            >
              <div className="flex flex-col gap-2">
                <div className="font-bold text-base">{items?.jobTitle}</div>
                <div className="font-medium text-sm text-[#687588]">
                  {items?.candidates} Candidates Applied
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-20">
                <div className="p-2 bg-light_purple text-primary rounded-lg w-fit">
                  open
                </div>
                <div className="font-medium text-sm">
                  {dayjs(items?.createdAt).fromNow()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full w-full font-normal text-lg min-h-60 flex items-center justify-center">
          No jobs have been posted yet
        </div>
      )}
    </Card>
  );
};

export default JobSummary;
