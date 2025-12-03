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
import { useIsMobile } from '@/hooks/useIsMobile';

const RecruitmentPage: React.FC = () => {
  const { setAddNewDrawer } = useJobState();
  const { isTablet } = useIsMobile();

  const handleAddNewDrawer = () => {
    setAddNewDrawer(true);
  };

  return (
    <div
      id="talent-acquisition-jobs-page-div-container"
      data-cy="talent-acquisition-jobs-page-div-container"
      className="p-4 min-h-screen sm:p-6 bg-[#ffffff]"
    >
      <div
        id="talent-acquisition-jobs-page-div-header"
        data-cy="talent-acquisition-jobs-page-div-header"
        className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-1 ${isTablet ? 'flex-wrap gap-y-4' : ''}`}
      >
        <CustomBreadcrumb
          data-cy="talent-acquisition-jobs-page-breadcrumb"
          title="Jobs"
          subtitle="Here's all job list"
        />
        <div
          id="talent-acquisition-jobs-div-buttons"
          data-cy="talent-acquisition-jobs-div-buttons"
          className="flex items-center sm:justify-between gap-10 md:gap-8 sm:gap-4"
        >
          <WhatYouNeed data-cy="talent-acquisition-jobs-page-what-you-need" />
          <AccessGuard
            data-cy="talent-acquisition-jobs-page-access-guard"
            permissions={[Permissions.CreateJobDescription]}
          >
            <CustomButton
              title={<span className="hidden sm:inline sm:mr-2">Add New</span>}
              id="createJobButton"
              data-cy="talent-acquisition-jobs-button-add-new"
              icon={<FaPlus className="md:mr-0 ml-2" />}
              onClick={() => handleAddNewDrawer()}
              className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
            />
          </AccessGuard>
        </div>
      </div>
      <div
        id="talent-acquisition-jobs-page-div-job-card"
        data-cy="talent-acquisition-jobs-page-div-job-card"
      >
        <JobCard />
      </div>
      <CreateJobs data-cy="talent-acquisition-jobs-page-create-jobs" />
      <AddFormResult data-cy="talent-acquisition-jobs-page-add-form-result" />
      <ShareToSocialMedia data-cy="talent-acquisition-jobs-page-share-to-social-media" />
    </div>
  );
};

export default RecruitmentPage;
