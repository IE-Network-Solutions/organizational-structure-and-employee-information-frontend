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
import CustomBreadcrumb from '@/components/common/breadCramp';

const RecruitmentPage: React.FC = () => {
  const { setAddNewDrawer } = useJobState();

  const handleAddNewDrawer = () => {
    setAddNewDrawer(true);
  };

  return (
    <div className="p-8 min-h-screen sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-1">
        <CustomBreadcrumb title="Jobs" subtitle="Here's all job list" />
        <div className="flex items-center sm:justify-between my-4 gap-4 md:gap-8">
          <WhatYouNeed />
          <AccessGuard permissions={[Permissions.CreateJobDescription]}>
            <CustomButton
              title={<span className="hidden sm:inline">Add New</span>}
              id="createJobButton"
              icon={<FaPlus className="mr-0 sm:mr-2" />}
              onClick={() => handleAddNewDrawer()}
              className="bg-blue-600 hover:bg-blue-700 w-10 sm:w-auto px-0 sm:px-4 flex items-center justify-center "
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
