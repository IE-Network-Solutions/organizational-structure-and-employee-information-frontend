'use client';
import React from 'react';

import JobCard from './_components/jobCard/jobCard';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import CreateJobs from './_components/createJobs';
import CustomButton from '@/components/common/buttons/customButton';
import { FaPlus } from 'react-icons/fa';
import WhatYouNeed from './[id]/_components/candidateSearch/whatYouNeed';
import ShareToSocialMedia from './_components/modals/share';
import AddFormResult from './_components/modals/result';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const RecruitmentPage: React.FC = () => {
  const { setAddNewDrawer } = useJobState();

  const handleAddNewDrawer = () => {
    setAddNewDrawer(true);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-gray-400">Here&apos;s all job list</p>
        </div>
        <div className="flex items-center my-4 gap-4 md:gap-8">
          <WhatYouNeed />
          <AccessGuard permissions={[Permissions.CreateJobDescription]}>
            <CustomButton
              title="Add New"
              id="createUserButton"
              icon={<FaPlus className="mr-2" />}
              onClick={() => handleAddNewDrawer()}
              className="bg-blue-600 hover:bg-blue-700"
            />
          </AccessGuard>
        </div>
      </div>
      <div>
        <JobCard />
      </div>
      <CreateJobs />

      <AddFormResult />
      <ShareToSocialMedia />
    </div>
  );
};

export default RecruitmentPage;
