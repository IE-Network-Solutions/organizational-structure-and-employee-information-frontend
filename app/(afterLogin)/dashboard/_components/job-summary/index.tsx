import React from 'react';
import { Card } from 'antd';
import { useGetJobSummary } from '@/store/server/features/dashboard/job-summary/queries';

const JobSummary = () => {
  const { data: jobSummary, isLoading } = useGetJobSummary('Open');

  return (
    <Card loading={isLoading} className="w-full mx-auto h-96">
      <div className="flex justify-start items-center mb-2">
        <div className=" font-bold text-lg">Latest Jobs Posted</div>
      </div>
      {jobSummary?.length ? (
        <div className="flex flex-col gap-2  overflow-y-auto h-80 scrollbar-none">
          {jobSummary.map((items: any, index: number) => (
            <div
              key={items?.id || index} // prefer a unique ID if available
              className="rounded-xl shadow-lg flex  justify-between items-center gap-3 p-2  "
            >
              <div className="flex flex-col">
                <div className="font-bold text-base">{items?.jobTitle}</div>
                <div className="font-medium text-sm">{items?.quantity}</div>
              </div>
              <div className="flex flex-col">
                <div className="p-2 bg-light_purple text-primary rounded-lg w-fit">
                  open
                </div>
                <div className="font-medium text-sm">time ago</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full w-full font-normal text-lg min-h-60">
          No jobs have been posted yet
        </div>
      )}
    </Card>
  );
};

export default JobSummary;
