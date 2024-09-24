'use client';
import React from 'react';
import { Button, Input } from 'antd';
import { IoAddSharp } from 'react-icons/io5';
import JobCard from './_components/jobCard';

const jobList = [
  {
    id: 1,
    title: '3D Designer',
    status: 'Active',
    location: 'Designer . IE HQ',
    candidates: 0,
    isActive: true,
    team: [],
    created: '3m ago',
  },

  {
    id: 1,
    title: 'Game Developer',
    status: 'Unactive',
    location: 'Designer . IE HQ',
    candidates: 0,
    isActive: true,
    team: [],
    created: '3m ago',
  },
  {
    id: 2,
    title: 'UI UX Designer',
    status: 'Active',
    location: 'SaaS . IE HQ',
    candidates: 10,
    isActive: true,
    team: [
      { id: 1, name: 'User 1', avatar: null },
      { id: 2, name: 'User 2', avatar: null },
      { id: 3, name: 'User 3', avatar: null },
    ],
    created: '3m ago',
  },
  {
    id: 3,
    title: 'Senior Android Developer',
    status: 'Closed',
    location: 'IT . IE HQ',
    candidates: 115,
    isActive: false,
    team: [],
    created: '3m ago',
  },
];
const RecruitmentPage: React.FC = () => {
  return (
    <div className="p-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recruitment</h1>
          <p className="text-gray-400">Here's all job list</p>
        </div>
        <div className="flex items-center space-x-4">
          <Input.Search
            placeholder="Search what you need"
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<IoAddSharp />}
            className="bg-purple-600"
          >
            + Add New
          </Button>
        </div>
      </div>
      <div>
        {jobList.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default RecruitmentPage;
