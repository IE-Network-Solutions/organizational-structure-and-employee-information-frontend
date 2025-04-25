'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import WhatYouNeed from '../jobs/[id]/_components/candidateSearch/whatYouNeed';
import CustomButton from '@/components/common/buttons/customButton';
import { FaPlus } from 'react-icons/fa';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CreateCandidate from '../jobs/[id]/_components/createCandidate';
import SearchOptions from '../jobs/[id]/_components/candidateSearch/candidateSearchOptions';
import AllCandidateTable from './_components/allCandidateTable';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const AllCandidates: React.FC = () => {
  const {
    selectedCandidate,
    setSelectedCandidate,
    setMoveToTalentPoolModal,
    setCreateJobDrawer,
  } = useCandidateState();

  const showDrawer = () => {
    setCreateJobDrawer(true);
  };

  const handleMoveToTalentsPool = () => {
    setMoveToTalentPoolModal(true);
    setSelectedCandidate(selectedCandidate);
  };
  const onClose = () => {
    setCreateJobDrawer(false);
  };
  return (
    <div className="h-auto w-full p-4 bg-white sm:p-6">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb title="Candidates" subtitle="All who applied" />
        <div className="flex items-center my-4 gap-4 md:gap-8">
          <div className="hidden sm:block">
            <WhatYouNeed />
          </div>

          {selectedCandidate?.length > 0 && (
            <CustomButton
              title="Move to Talent Pool"
              id="createUserButton"
              onClick={handleMoveToTalentsPool}
              className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
            />
          )}
          <AccessGuard permissions={[Permissions.CreateCandidate]}>
            <CustomButton
              title={<span className="hidden sm:inline">Add candidate</span>}
              id="createUserButton"
              icon={<FaPlus className="mr-0 sm:mr-2" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700"
            />
            <CreateCandidate onClose={onClose} />
          </AccessGuard>
        </div>
      </div>
      <div className="w-full h-auto">
        <SearchOptions />
        <AllCandidateTable />
      </div>
    </div>
  );
};

export default AllCandidates;
