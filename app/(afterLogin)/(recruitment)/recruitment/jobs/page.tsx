'use client';
import React, { useState } from 'react';

import JobCard from './_components/jobCard/jobCard';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import CreateJobs from './_components/createJobs';
import CustomButton from '@/components/common/buttons/customButton';
import { CgFileDocument } from 'react-icons/cg';
import WhatYouNeed from './[id]/_components/candidateSearch/whatYouNeed';
import ShareToSocialMedia from './_components/modals/share';
import AddFormResult from './_components/modals/result';
import JobsFilterModal from './_components/modals/filter';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useIsMobile } from '@/hooks/useIsMobile';

const RecruitmentPage: React.FC = () => {
  const { setAddNewDrawer } = useJobState();
  const { isTablet } = useIsMobile();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const handleAddNewDrawer = () => {
    setAddNewDrawer(true);
  };

  return (
    <div
      id="talent-acquisition-jobs-page-div-container"
      data-cy="talent-acquisition-jobs-page-div-container"
      className="p-4 min-h-screen sm:p-6 bg-[#f9fafb]"
    >
      <div
        id="talent-acquisition-jobs-page-div-header"
        data-cy="talent-acquisition-jobs-page-div-header"
        className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 ${isTablet ? 'flex-wrap gap-y-4' : ''}`}
      >
        <CustomBreadcrumb
          data-cy="talent-acquisition-jobs-page-breadcrumb"
          title="Jobs"
          subtitle="Talent Acquisition / Jobs"
        />
        <AccessGuard
          data-cy="talent-acquisition-jobs-page-access-guard"
          permissions={[Permissions.CreateJobDescription]}
        >
          <CustomButton
            title={
              <span
                id="talent-acquisition-jobs-add-job-label"
                data-cy="talent-acquisition-jobs-add-job-label"
                className="hidden sm:inline"
              >
                Add Job
              </span>
            }
            id="talent-acquisition-jobs-button-add-job"
            data-cy="talent-acquisition-jobs-button-add-new"
            icon={
              <span className="relative inline-flex shrink-0 w-5 h-5 items-center justify-center sm:mr-2 ml-0" aria-hidden>
                <CgFileDocument className="w-5 h-5 shrink-0 text-white" />
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-transparent text-white pointer-events-none">
                  <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden stroke="none">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </span>
              </span>
            }
            onClick={() => handleAddNewDrawer()}
            className="!bg-[#6366F1] hover:!bg-[#4F46E5] w-10 sm:w-auto sm:px-5 !h-11 px-5 py-5 rounded-lg border-0"
            aria-label="Add Job"
          />
        </AccessGuard>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <WhatYouNeed placeholder="Search Jobs" data-cy="talent-acquisition-jobs-page-what-you-need" />
          </div>
          <JobsFilterModal
            asPopover
            open={filterModalOpen}
            onOpenChange={(visible) => setFilterModalOpen(visible)}
            onClose={() => setFilterModalOpen(false)}
          >
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shrink-0"
              data-cy="talent-acquisition-jobs-filter-button"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </JobsFilterModal>
        </div>
        <div
          id="talent-acquisition-jobs-page-div-job-card"
          data-cy="talent-acquisition-jobs-page-div-job-card"
        >
          <JobCard />
        </div>
      </div>
      <CreateJobs data-cy="talent-acquisition-jobs-page-create-jobs" />
      <AddFormResult data-cy="talent-acquisition-jobs-page-add-form-result" />
      <ShareToSocialMedia data-cy="talent-acquisition-jobs-page-share-to-social-media" />
    </div>
  );
};

export default RecruitmentPage;
