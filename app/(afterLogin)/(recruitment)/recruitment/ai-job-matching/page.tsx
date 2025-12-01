'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';
import { Spin, Empty } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useGetJobMatchSummaries } from '@/store/server/features/recruitment/ai-job-matching/queries';
import { JobMatchSummary } from '@/store/server/features/recruitment/ai-job-matching/interface';

dayjs.extend(relativeTime);

interface JobCardProps {
  job: JobMatchSummary;
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {job.jobTitle}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{job.department}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-gray-400" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <MdOutlineAccessTime className="text-gray-400" />{' '}
              {dayjs(job.lastAnalyzed).fromNow()}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />{' '}
              {job.totalCandidates} applicants
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <span className="text-xs font-medium text-gray-500">AI Matched</span>
        <div className="text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg">
          {job.aiMatchedCount}{' '}
          {job.aiMatchedCount === 1 ? 'Candidate' : 'Candidates'}
        </div>
      </div>
    </div>
  );
};

const AIJobMatchingPage: React.FC = () => {
  const router = useRouter();
  const { data: jobs, isLoading, isError } = useGetJobMatchSummaries();

  console.log('[AI Job Matching Page] State:', {
    isLoading,
    isError,
    dataLength: jobs?.length,
    data: jobs,
  });

  const handleJobClick = (jobId: string) => {
    router.push(`/recruitment/ai-job-matching/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-[#f5f5f5]">
        <div className="mb-6">
          <CustomBreadcrumb
            title="AI Job Matching"
            subtitle="Match candidates to jobs using AI-powered analysis"
          />
        </div>
        <div className="flex items-center justify-center min-h-96">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-[#f5f5f5]">
        <div className="mb-6">
          <CustomBreadcrumb
            title="AI Job Matching"
            subtitle="Match candidates to jobs using AI-powered analysis"
          />
        </div>
        <div className="flex items-center justify-center min-h-96">
          <Empty description="Failed to load jobs from Azure Functions" />
        </div>
      </div>
    );
  }

  console.log('[AI Job Matching] Loaded jobs:', jobs?.length, jobs);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#f5f5f5]">
      <div className="mb-6">
        <CustomBreadcrumb
          title="AI Job Matching"
          subtitle="Match candidates to jobs using AI-powered analysis"
        />
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="flex items-center justify-center min-h-96">
          <Empty description="No jobs available" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              onClick={() => handleJobClick(job.jobId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIJobMatchingPage;
