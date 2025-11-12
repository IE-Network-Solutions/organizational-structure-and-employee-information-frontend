'use client';

import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';

interface JobCardProps {
  title: string;
  department: string;
  location: string;
  postedAgo: string;
  applicants: number;
  aiMatchedCount: number;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  department,
  location,
  postedAgo,
  applicants,
  aiMatchedCount,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{department}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-gray-400" /> {location}
            </span>
            <span className="flex items-center gap-1">
              <MdOutlineAccessTime className="text-gray-400" /> {postedAgo}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />{' '}
              {applicants} applicants
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <span className="text-xs font-medium text-gray-500">AI Matched</span>
        <button className="text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">
          {aiMatchedCount} {aiMatchedCount === 1 ? 'Candidate' : 'Candidates'}
        </button>
      </div>
    </div>
  );
};

const AIJobMatchingPage: React.FC = () => {
  const jobs: JobCardProps[] = [
    {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Remote',
      postedAgo: '2 days ago',
      applicants: 45,
      aiMatchedCount: 3,
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      postedAgo: '5 days ago',
      applicants: 32,
      aiMatchedCount: 1,
    },
    {
      title: 'UX Designer',
      department: 'Design',
      location: 'New York, NY',
      postedAgo: '1 week ago',
      applicants: 28,
      aiMatchedCount: 1,
    },
    {
      title: 'Data Scientist',
      department: 'Analytics',
      location: 'Remote',
      postedAgo: '3 days ago',
      applicants: 38,
      aiMatchedCount: 1,
    },
  ];

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#f5f5f5]">
      <div className="mb-6">
        <CustomBreadcrumb
          title="AI Job Matching"
          subtitle="Match candidates to jobs using AI-powered analysis"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {jobs.slice(0, 3).map((job) => (
          <JobCard key={job.title} {...job} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {jobs.slice(3).map((job) => (
          <JobCard key={job.title} {...job} />
        ))}
      </div>
    </div>
  );
};

export default AIJobMatchingPage;
