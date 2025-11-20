'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React, { useEffect } from 'react';
import WhatYouNeed from '../jobs/[id]/_components/candidateSearch/whatYouNeed';
import CustomButton from '@/components/common/buttons/customButton';
import { FaPlus } from 'react-icons/fa';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CreateCandidate from '../jobs/[id]/_components/createCandidate';
import SearchOptions from '../jobs/[id]/_components/candidateSearch/candidateSearchOptions';
import AllCandidateTable from './_components/allCandidateTable';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { IoIosShareAlt } from 'react-icons/io';
import { usePathname } from 'next/navigation';

const AllCandidates: React.FC = () => {
  const {
    selectedCandidate,
    setSelectedCandidate,
    setMoveToTalentPoolModal,
    setCreateJobDrawer,
    setSelectedRowKeys,
  } = useCandidateState();

  const { isMobile, isTablet } = useIsMobile();
  const pathname = usePathname();

  const showDrawer = () => {
    setCreateJobDrawer(true);
  };

  const handleMoveToTalentsPool = () => {
    setMoveToTalentPoolModal(true);
    setSelectedCandidate(selectedCandidate);
  };
  // Reset selected candidates and row keys on route change
  useEffect(() => {
    setSelectedCandidate([]);
    setSelectedRowKeys([] as any);
  }, [pathname]);
  const onClose = () => {
    setCreateJobDrawer(false);
  };
  return (
    <div
      id="talent-acquisition-candidate-page-div-container"
      data-cy="talent-acquisition-candidate-page-div-container"
      className="h-auto w-full p-4 bg-[#f5f5f5] sm:p-6"
    >
      <div
        id="talent-acquisition-candidate-page-div-header"
        data-cy="talent-acquisition-candidate-page-div-header"
        className="flex flex-wrap justify-between items-center"
      >
        <CustomBreadcrumb
          data-cy="talent-acquisition-candidate-page-breadcrumb"
          title="Candidates"
          subtitle="All who applied"
        />
        <div
          id="talent-acquisition-candidate-page-div-buttons"
          data-cy="talent-acquisition-candidate-page-div-buttons"
          className="flex items-center justify-between my-4 "
        >
          <div
            id="talent-acquisition-candidate-page-div-what-you-need"
            data-cy="talent-acquisition-candidate-page-div-what-you-need"
            className="hidden sm:block mr-4"
          >
            <WhatYouNeed data-cy="talent-acquisition-candidate-page-what-you-need" />
          </div>

          {selectedCandidate?.length > 0 && (
            <div
              id="talent-acquisition-candidate-page-div-move-button"
              data-cy="talent-acquisition-candidate-page-div-move-button"
              className="mr-4"
            >
              <CustomButton
                title={
                  !(isMobile || isTablet) && (
                    <span className="hidden sm:inline">
                      Move to Talent Pool
                    </span>
                  )
                }
                id="createUserButton"
                data-cy="talent-acquisition-candidate-button-move-talent-pool"
                icon={<IoIosShareAlt className="md:mr-0 ml-2" size={20} />}
                onClick={handleMoveToTalentsPool}
                className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
              />
            </div>
          )}
          <AccessGuard permissions={[Permissions.CreateCandidate]}>
            <CustomButton
              title={
                !(isMobile || isTablet) && (
                  <span className="hidden sm:inline">Add candidate</span>
                )
              }
              id="createUserButton"
              data-cy="talent-acquisition-candidate-button-add"
              icon={<FaPlus className="md:mr-0 ml-2" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
            />
            <CreateCandidate
              data-cy="talent-acquisition-candidate-page-create-candidate"
              onClose={onClose}
            />
          </AccessGuard>
        </div>
      </div>
      <div
        id="talent-acquisition-candidate-page-div-table"
        data-cy="talent-acquisition-candidate-page-div-table"
        className="w-full h-auto bg-white p-2 px-4 rounded-lg"
      >
        <SearchOptions data-cy="talent-acquisition-candidate-page-search-options" />
        <AllCandidateTable data-cy="talent-acquisition-candidate-page-table" />
      </div>
    </div>
  );
};

export default AllCandidates;
