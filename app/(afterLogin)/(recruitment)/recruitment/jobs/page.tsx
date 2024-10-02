'use client';
import React from 'react';
import { Button, Input } from 'antd';
import { IoAddSharp } from 'react-icons/io5';
import JobCard from './_components/jobCard/jobCard';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import CreateJobs from './_components/createJobs';

const RecruitmentPage: React.FC = () => {
  const { setAddNewDrawer } = useJobState();

  const handleAddNewDrawer = () => {
    setAddNewDrawer(true);
  };

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
            onClick={() => handleAddNewDrawer()}
            className="bg-purple-600"
          >
            Add New
          </Button>
        </div>
      </div>
      <div>
        <JobCard />
      </div>
      <CreateJobs />
    </div>
  );
};

export default RecruitmentPage;
