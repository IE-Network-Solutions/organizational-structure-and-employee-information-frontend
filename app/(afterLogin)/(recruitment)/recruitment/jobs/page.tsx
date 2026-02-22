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
  const { isTablet, isMobile } = useIsMobile();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const handleAddNewDrawer = () => {
    setAddNewDrawer(true);
  };

  return (
    <div
      id="talent-acquisition-jobs-page-div-container"
      data-cy="talent-acquisition-jobs-page-div-container"
      className={`min-h-screen bg-[#f9fafb] ${isMobile ? 'p-4' : 'p-4 sm:p-6'}`}
    >
      <div
        id="talent-acquisition-jobs-page-div-header"
        data-cy="talent-acquisition-jobs-page-div-header"
        className={`flex flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 ${isTablet ? 'flex-wrap gap-y-4' : ''}`}
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
              <span
                className="relative inline-flex shrink-0 w-5 h-5 items-center justify-center sm:mr-2 ml-0"
                aria-hidden
                data-cy="talent-acquisition-jobs-button-add-icon"
              >
                <CgFileDocument className="w-5 h-5 shrink-0 text-white" />
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-transparent text-white pointer-events-none"
                  data-cy="talent-acquisition-jobs-button-add-badge"
                >
                  <svg
                    className="w-2.5 h-2.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                    stroke="none"
                    data-cy="talent-acquisition-jobs-button-add-badge-svg"
                  >
                    <path
                      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                      data-cy="talent-acquisition-jobs-button-add-badge-path"
                    />
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
      <div
        className="flex flex-col gap-4"
        data-cy="talent-acquisition-jobs-page-content"
      >
        <div
          className={`flex flex-col gap-3 ${isMobile ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}
          data-cy="talent-acquisition-jobs-page-toolbar"
        >
          <div
            className={`flex flex-1 items-center gap-3 ${isMobile ? 'w-full' : 'max-w-md'}`}
            data-cy="talent-acquisition-jobs-page-search-row"
          >
            <div
              className="flex-1 min-w-0"
              data-cy="talent-acquisition-jobs-page-search-wrap"
            >
              <WhatYouNeed
                placeholder="Search Jobs"
                data-cy="talent-acquisition-jobs-page-what-you-need"
              />
            </div>
            <JobsFilterModal
              asPopover
              open={filterModalOpen}
              onOpenChange={(visible) => setFilterModalOpen(visible)}
              onClose={() => setFilterModalOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shrink-0 transition-colors ${
                  filterModalOpen
                    ? '!bg-[#6366F1] !text-white !border-[#6366F1] hover:!bg-[#4F46E5]'
                    : ''
                }`}
                data-cy="talent-acquisition-jobs-filter-button"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  data-cy="talent-acquisition-jobs-filter-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    data-cy="talent-acquisition-jobs-filter-icon-path"
                  />
                </svg>
                <span data-cy="talent-acquisition-jobs-filter-button-label">
                  Filter
                </span>
              </button>
            </JobsFilterModal>
          </div>
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
