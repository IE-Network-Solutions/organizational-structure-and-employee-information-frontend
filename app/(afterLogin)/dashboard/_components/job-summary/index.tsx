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
      <div
        className="flex justify-start items-center mb-2"
        data-cy="job-summary-header"
      >
        <div
          className=" font-bold text-base lg:text-lg"
          data-cy="job-summary-title"
        >
          Latest Jobs Posted
        </div>
      </div>
      {Array.isArray(jobSummary) && jobSummary.length > 0 ? (
        <div
          className="flex flex-col gap-3 shadow-lg overflow-y-auto max-h-80 scrollbar-none"
          data-cy="job-summary-list"
        >
          {jobSummary?.map((items: any, index: number) => (
            <div
              // bodyStyle={{ padding: '0px', margin: '0px' }}
              key={items?.id || index}
              className="rounded-xl shadow-lg flex  justify-between items-center gap-3 p-2  "
              data-cy={`job-summary-item-${index}`}
            >
              <div
                className="flex flex-col gap-2"
                data-cy={`job-summary-item-info-${index}`}
              >
                <div
                  className="font-bold text-base"
                  data-cy={`job-summary-item-title-${index}`}
                >
                  {items?.jobTitle}
                </div>
                <div
                  className="font-medium text-sm text-[#687588]"
                  data-cy={`job-summary-item-candidates-${index}`}
                >
                  {items?.candidates} Candidates Applied
                </div>
              </div>
              <div
                className="flex flex-col gap-2 min-w-20"
                data-cy={`job-summary-item-status-${index}`}
              >
                <div
                  className="p-2 bg-light_purple text-primary rounded-lg w-fit"
                  data-cy={`job-summary-item-status-badge-${index}`}
                >
                  open
                </div>
                <div
                  className="font-medium text-sm"
                  data-cy={`job-summary-item-date-${index}`}
                >
                  {dayjs(items?.createdAt).fromNow()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="h-full w-full font-normal text-lg min-h-60 flex items-center justify-center"
          data-cy="job-summary-empty"
        >
          <div data-cy="job-summary-empty-message">
            No jobs have been posted yet
          </div>
        </div>
      )}
    </Card>
  );
};

export default JobSummary;
