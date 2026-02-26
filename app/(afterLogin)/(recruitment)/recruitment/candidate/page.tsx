'use client';
import React, { useEffect, useState } from 'react';
import WhatYouNeed from '../jobs/[id]/_components/candidateSearch/whatYouNeed';
import CustomButton from '@/components/common/buttons/customButton';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CreateCandidate from '../jobs/[id]/_components/createCandidate';
import SearchOptions from '../jobs/[id]/_components/candidateSearch/candidateSearchOptions';
import AllCandidateTable from './_components/allCandidateTable';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { IoIosShareAlt } from 'react-icons/io';
import { usePathname } from 'next/navigation';
import { Button } from 'antd';

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

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div
      id="talent-acquisition-candidate-page-div-container"
      data-cy="talent-acquisition-candidate-page-div-container"
      className="h-auto w-full p-4 sm:p-6"
    >
      <div
        id="talent-acquisition-candidate-page-div-header"
        data-cy="talent-acquisition-candidate-page-div-header"
        className="flex flex-wrap justify-between items-center"
      >
        <div
          className="grow shrink basis-0 flex flex-col justify-start items-start gap-1 py-4"
          id="talent-acquisition-candidate-page-breadcrumb"
          data-cy="talent-acquisition-candidate-page-breadcrumb"
        >
          <h1
            className="text-gray-900 text-3xl font-bold leading-tight m-0"
            data-cy="talent-acquisition-candidate-page-title"
          >
            Candidates
          </h1>
          <p
            className="text-gray-500 text-sm font-normal leading-snug m-0"
            data-cy="talent-acquisition-candidate-page-breadcrumb-trail"
          >
            Talent Acquisition / Candidates
          </p>
        </div>
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
                    <span
                      data-cy="-recruitment-recruitment-candidate-page-tsx-page-span-83"
                      className="hidden sm:inline"
                    >
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
                  <span
                    data-cy="-recruitment-recruitment-candidate-page-tsx-page-span-100"
                    className="hidden sm:inline"
                  >
                    Add candidate
                  </span>
                )
              }
              id="createUserButton"
              data-cy="talent-acquisition-candidate-button-add"
              icon={<PersonAddOutlinedIcon className="md:mr-0 ml-2" fontSize="medium" />}
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
        className="mt-6 w-full h-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div
          className="px-4 py-4 border-b border-gray-100 bg-white"
          id="talent-acquisition-candidate-page-table-toolbar"
          data-cy="talent-acquisition-candidate-page-table-toolbar"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              className="flex-1 min-w-0 max-w-md"
              id="talent-acquisition-candidate-page-search-wrap"
              data-cy="talent-acquisition-candidate-page-search-wrap"
            >
              <WhatYouNeed
                placeholder="Search candidate"
                pill
                className="w-full"
              />
            </div>
            <Button
              type="default"
              icon={<FilterListOutlinedIcon fontSize="small" />}
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 shrink-0"
              id="talent-acquisition-candidate-page-filter-button"
              data-cy="talent-acquisition-candidate-page-filter-button"
            >
              Filter
            </Button>
          </div>
          {showFilters && (
            <div
              className="mt-4 pt-4 border-t border-gray-100"
              id="talent-acquisition-candidate-page-filter-row"
              data-cy="talent-acquisition-candidate-page-filter-row"
            >
              <SearchOptions
                embedded
                data-cy="talent-acquisition-candidate-page-search-options"
              />
            </div>
          )}
        </div>
        <div
          className="px-4 pb-4"
          id="talent-acquisition-candidate-page-table-container"
          data-cy="talent-acquisition-candidate-page-table-container"
        >
          <AllCandidateTable data-cy="talent-acquisition-candidate-page-table" />
        </div>
      </div>
    </div>
  );
};

export default AllCandidates;
