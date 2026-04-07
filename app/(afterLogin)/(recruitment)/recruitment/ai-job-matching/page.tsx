'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Empty, Input, Skeleton } from 'antd';
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
  const postedAt = metadataPostedAt || job.jobPostedAt || job.postedAt || null;
  const formattedPostedDate = postedAt
    ? dayjs(postedAt).format('DD MMM YYYY')
    : 'Posted date not available';

  return (
    <Card
      id={`ai-job-card-${job.jobId}`}
      data-cy={`ai-job-card-${job.jobId}`}
      onClick={onClick}
      className="rounded-[28px] border border-blue-100 bg-white shadow-sm transition-all duration-200 hover:shadow-lg cursor-pointer p-6"
    >
      <div
        data-cy="-recruitment-recruitment-ai-job-matching-page-tsx-page-div-45"
        className="space-y-4"
      >
        {/* Job Title */}
        <h3
          id={`ai-job-card-${job.jobId}-title`}
          data-cy={`ai-job-card-${job.jobId}-title`}
          className="text-lg font-semibold text-gray-900"
        >
          {job.jobTitle}
        </h3>

        {/* Job Info (from Azure Function data) */}
        <div
          id={`ai-job-card-${job.jobId}-info`}
          data-cy={`ai-job-card-${job.jobId}-info`}
          className="flex items-center gap-8 text-sm text-gray-500 flex-nowrap"
        >
          <span
            id={`ai-job-card-${job.jobId}-location`}
            data-cy={`ai-job-card-${job.jobId}-location`}
            className="flex items-center gap-2"
          >
            <EnvironmentOutlined
              id={`ai-job-card-${job.jobId}-location-icon`}
              data-cy={`ai-job-card-${job.jobId}-location-icon`}
              className="text-gray-400 text-base"
            />
            <span
              id={`ai-job-card-${job.jobId}-location-text`}
              data-cy={`ai-job-card-${job.jobId}-location-text`}
              className="text-sm font-medium text-gray-700"
            >
              {locationLabel}
            </span>
          </span>
          <span
            id={`ai-job-card-${job.jobId}-posted-date`}
            data-cy={`ai-job-card-${job.jobId}-posted-date`}
            className="flex items-center gap-1 text-sm text-gray-500"
          >
            <ClockCircleOutlined
              id={`ai-job-card-${job.jobId}-posted-date-icon`}
              data-cy={`ai-job-card-${job.jobId}-posted-date-icon`}
              className="text-gray-400 text-base"
            />
            <span
              id={`ai-job-card-${job.jobId}-posted-date-text`}
              data-cy={`ai-job-card-${job.jobId}-posted-date-text`}
              className="text-sm text-gray-400"
            >
              {formattedPostedDate}
            </span>
          </span>
        </div>

        {/* AI Matches */}
        <div
          id={`ai-job-card-${job.jobId}-matches`}
          data-cy={`ai-job-card-${job.jobId}-matches`}
          className="pt-4 border-t border-blue-50"
        >
          <div
            data-cy="-recruitment-recruitment-ai-job-matching-page-tsx-page-div-105"
            className="flex flex-wrap items-center justify-between gap-3 text-sm"
          >
            <span
              id={`ai-job-card-${job.jobId}-matches-label`}
              data-cy={`ai-job-card-${job.jobId}-matches-label`}
              className="text-sm font-medium text-gray-500"
            >
              AI Matches
            </span>
            <span
              id={`ai-job-card-${job.jobId}-candidate-count`}
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
      <div
        id="ai-job-matching-page-loading"
        data-cy="ai-job-matching-page-loading"
        className="min-h-screen bg-gray-50"
      >
        <div
          id="ai-job-matching-header-loading"
          data-cy="ai-job-matching-header-loading"
          className="bg-white px-6 py-4 border-b border-gray-200"
        >
          <h1
            id="ai-job-matching-title-loading"
            data-cy="ai-job-matching-title-loading"
            className="text-xl font-semibold text-gray-900"
          >
            AI Job Matching
          </h1>
          <p
            id="ai-job-matching-subtitle-loading"
            data-cy="ai-job-matching-subtitle-loading"
            className="text-sm text-gray-500"
          >
            Match candidates to jobs using AI-powered analysis
          </p>
        </div>
        <div
          id="ai-job-matching-spinner-container"
          data-cy="ai-job-matching-spinner-container"
          className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              id={`ai-job-card-skeleton-${index}`}
              data-cy={`ai-job-card-skeleton-${index}`}
              className="rounded-[28px] border border-blue-100 bg-white shadow-sm p-6"
              headStyle={{ borderBottom: 'none', padding: 0 }}
              bodyStyle={{ padding: 0 }}
            >
              <div className="space-y-4">
                <Skeleton.Input active className="!h-7 !w-56 !max-w-full" />
                <div className="flex items-center gap-8">
                  <Skeleton.Input active className="!h-4 !w-40 !max-w-full" />
                  <Skeleton.Input active className="!h-4 !w-36 !max-w-full" />
                </div>
                <div className="pt-4 border-t border-blue-50">
                  <div className="flex items-center justify-between">
                    <Skeleton.Input active className="!h-4 !w-36 !max-w-full" />
                    <Skeleton.Button active size="small" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        id="ai-job-matching-page-error"
        className="min-h-screen bg-gray-50"
        data-cy="ai-job-matching-page-error"
      >
        <div
          id="ai-job-matching-header-error"
          data-cy="ai-job-matching-header-error"
          className="bg-white px-6 py-4 border-b border-gray-200"
        >
          <h1
            id="ai-job-matching-title-error"
            data-cy="ai-job-matching-title-error"
            className="text-xl font-semibold text-gray-900"
          >
            AI Job Matching
          </h1>
          <p
            id="ai-job-matching-subtitle-error"
            data-cy="ai-job-matching-subtitle-error"
            className="text-sm text-gray-500"
          >
            Match candidates to jobs using AI-powered analysis
          </p>
        </div>
        <div
          id="ai-job-matching-error-container"
          data-cy="ai-job-matching-error-container"
          className="flex items-center justify-center min-h-96"
        >
          <div
            id="ai-job-matching-error-empty"
            data-cy="ai-job-matching-error-empty"
          >
            <Empty description="Failed to load jobs" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="ai-job-matching-page"
      className="min-h-screen bg-gray-50"
      data-cy="ai-job-matching-page"
    >
      {/* Header */}
      <div
        id="ai-job-matching-header"
        data-cy="ai-job-matching-header"
        className="bg-white px-6 py-4 border-b border-gray-200"
      >
        <h1
          id="ai-job-matching-title"
          data-cy="ai-job-matching-title"
          className="text-xl font-semibold text-gray-900"
        >
          AI Job Matching
        </h1>
        <p
          id="ai-job-matching-subtitle"
          data-cy="ai-job-matching-subtitle"
          className="text-sm text-gray-500"
        >
          Match candidates to jobs using AI-powered analysis
        </p>
      </div>

      {/* Search Bar */}
      <div
        id="ai-job-matching-search-container"
        data-cy="ai-job-matching-search-container"
        className="px-6 py-4"
      >
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
      <div
        id="ai-job-matching-grid-container"
        data-cy="ai-job-matching-grid-container"
        className="px-6 pb-6"
      >
        {!jobs || jobs.length === 0 ? (
          <div
            id="ai-job-matching-empty"
            data-cy="ai-job-matching-empty"
            className="flex items-center justify-center min-h-96"
          >
            <div
              id="ai-job-matching-empty-state"
              data-cy="ai-job-matching-empty-state"
            >
              <Empty description="No jobs available" />
            </div>
          </div>
        ) : (
          <div
            id="ai-job-matching-grid"
            data-cy="ai-job-matching-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
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
