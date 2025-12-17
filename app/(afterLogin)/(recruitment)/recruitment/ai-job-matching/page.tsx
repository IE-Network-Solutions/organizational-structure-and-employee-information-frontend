'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input, Spin, Empty, Card } from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  useGetJobMatchSummaries,
  useGetJobMetadata,
} from '@/store/server/features/recruitment/ai-job-matching/queries';
import type { JobMatchSummary } from '@/store/server/features/recruitment/ai-job-matching/interface';

dayjs.extend(relativeTime);

interface JobCardProps {
  job: JobMatchSummary;
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const { data: metadata } = useGetJobMetadata(job.jobId, Boolean(job.jobId));
  const metadataLocation = metadata?.location;
  const metadataPostedAt = metadata?.jobPostedAt || metadata?.postedAt;

  const locationLabel =
    metadataLocation || job.location || 'Location not specified';
  const postedAt =
    metadataPostedAt || job.jobPostedAt || job.postedAt || null;
  const formattedPostedDate = postedAt
    ? dayjs(postedAt).format('DD MMM YYYY')
    : 'Posted date not available';

  return (
    <Card
      data-cy={`ai-job-card-${job.jobId}`}
      onClick={onClick}
      className="rounded-[28px] border border-blue-100 bg-white shadow-sm transition-all duration-200 hover:shadow-lg cursor-pointer p-6"
    >
      <div className="space-y-4">
        {/* Job Title */}
        <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>

        {/* Job Info (from Azure Function data) */}
        <div className="flex items-center gap-8 text-sm text-gray-500 flex-nowrap">
          <span className="flex items-center gap-2">
            <EnvironmentOutlined className="text-gray-400 text-base" />
            <span className="text-sm font-medium text-gray-700">
              {locationLabel}
            </span>
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <ClockCircleOutlined className="text-gray-400 text-base" />
            <span className="text-sm text-gray-400">{formattedPostedDate}</span>
          </span>
        </div>

        {/* AI Matches */}
        <div className="pt-4 border-t border-blue-50">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-sm font-medium text-gray-500">
              AI Matches
            </span>
            <span
              data-cy={`ai-job-card-${job.jobId}-candidate-count`}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-[#e7e3ff] bg-[#f1f0ff] px-4 py-1 text-sm font-semibold text-[#3d3dff]"
            >
              {job.totalCandidates}{' '}
              {job.totalCandidates === 1 ? 'Candidate' : 'Candidates'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AIJobMatchingPage: React.FC = () => {
  const router = useRouter();
  const { data: jobs, isLoading, isError } = useGetJobMatchSummaries();

  const handleJobClick = (jobId: string) => {
    router.push(`/recruitment/ai-job-matching/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            AI Job Matching
          </h1>
          <p className="text-sm text-gray-500">
            Match candidates to jobs using AI-powered analysis
          </p>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50" data-cy="ai-job-matching-page">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            AI Job Matching
          </h1>
          <p className="text-sm text-gray-500">
            Match candidates to jobs using AI-powered analysis
          </p>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <Empty description="Failed to load jobs" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-cy="ai-job-matching-page">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">AI Job Matching</h1>
        <p className="text-sm text-gray-500">
          Match candidates to jobs using AI-powered analysis
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <Input
          id="ai-job-matching-search"
          data-cy="ai-job-matching-search"
          placeholder="Search"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="max-w-md rounded-lg border border-gray-200 bg-white shadow-sm"
          size="large"
        />
      </div>

      {/* Jobs Grid */}
      <div className="px-6 pb-6">
        {!jobs || jobs.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <Empty description="No jobs available" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    </div>
  );
};

export default AIJobMatchingPage;
