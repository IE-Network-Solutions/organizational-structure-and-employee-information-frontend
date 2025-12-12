'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input, Spin, Empty, Card } from 'antd';
import { SearchOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useGetJobMatchSummaries } from '@/store/server/features/recruitment/ai-job-matching/queries';
import type { JobMatchSummary } from '@/store/server/features/recruitment/ai-job-matching/interface';

dayjs.extend(relativeTime);

interface JobCardProps {
  job: JobMatchSummary;
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const locationLabel = job.location || 'Location not specified';
  const analyzedLabel = job.lastAnalyzed
    ? dayjs(job.lastAnalyzed).fromNow()
    : 'Last analyzed: N/A';

  return (
    <Card
      data-cy={`ai-job-card-${job.jobId}`}
      onClick={onClick}
      className="rounded-2xl border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer bg-white"
    >
      <div className="space-y-3">
        {/* Job Title */}
        <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>
        
        {/* Job Info (from Azure Function data) */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <EnvironmentOutlined className="text-gray-400" /> {locationLabel}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ClockCircleOutlined className="text-gray-400" /> {analyzedLabel}
          </span>
        </div>

        {/* AI Matches */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">AI Matches</span>
            <span
              data-cy={`ai-job-card-${job.jobId}-candidate-count`}
              className="text-sm font-semibold text-blue-600"
            >
              {job.totalCandidates} {job.totalCandidates === 1 ? 'Candidate' : 'Candidates'}
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
          <h1 className="text-xl font-semibold text-gray-900">AI Job Matching</h1>
          <p className="text-sm text-gray-500">Match candidates to jobs using AI-powered analysis</p>
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
          <h1 className="text-xl font-semibold text-gray-900">AI Job Matching</h1>
          <p className="text-sm text-gray-500">Match candidates to jobs using AI-powered analysis</p>
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
        <p className="text-sm text-gray-500">Match candidates to jobs using AI-powered analysis</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="max-w-md rounded-lg"
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
