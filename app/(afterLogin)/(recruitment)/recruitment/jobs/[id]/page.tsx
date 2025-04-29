'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import CreateCandidate from './_components/createCandidate';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CandidateTable from './_components/candidateTable';
import WhatYouNeed from './_components/candidateSearch/whatYouNeed';
import SearchOptions from './_components/candidateSearch/candidateSearchOptions';
import { useGetJobsByID } from '@/store/server/features/recruitment/job/queries';
import { IoIosArrowForward, IoIosShareAlt } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Params {
  id: string;
}

interface CandidateProps {
  params: Params;
}
const Candidates = ({ params: { id } }: CandidateProps) => {
  const {
    selectedCandidate,
    setCreateJobDrawer,
    setMoveToTalentPoolModal,
    setSelectedCandidate,
  } = useCandidateState();
  const { data: jobById } = useGetJobsByID(id);
  const { isMobile, isTablet } = useIsMobile();

  const showDrawer = () => {
    setCreateJobDrawer(true);
  };
  const onClose = () => {
    setCreateJobDrawer(false);
  };

  const handleMoveToTalentsPool = () => {
    setMoveToTalentPoolModal(true);
    setSelectedCandidate(selectedCandidate);
  };

  const customBreadCrumbSubTitle = (
    <div className="flex items-center justify-start space-x-4">
      <div className="flex items-center justify-center text-sm font-normal text-gray-400">
        List Job
      </div>
      <IoIosArrowForward />
      <div className="font-semibold"> {jobById?.jobTitle}</div>
    </div>
  );

  return (
    <div className="h-auto w-full p-4 bg-[#f5f5f5] sm:p-6">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Recruitment"
          subtitle={customBreadCrumbSubTitle}
        />
        <div className="flex items-center my-4 gap-4 md:gap-8">
          <div className="hidden sm:block">
            <WhatYouNeed />
          </div>

          {selectedCandidate?.length > 0 && (
            <div className="mr-4">
              <CustomButton
                title={
                  !(isMobile || isTablet) && (
                    <span className="hidden sm:inline">
                      Move to Talent Pool
                    </span>
                  )
                }
                id="createUserButton"
                icon={<IoIosShareAlt className="md:mr-0 ml-2" size={20} />}
                onClick={handleMoveToTalentsPool}
                className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
              />
            </div>
          )}
          <CustomButton
            title={
              !(isMobile || isTablet) && (
                <span className="hidden sm:inline">Add candidate</span>
              )
            }
            id="createUserButton"
            icon={<FaPlus className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <CreateCandidate jobId={id} onClose={onClose} />
        </div>
      </div>
      <div className="w-full h-auto bg-white p-2 px-4 rounded-lg">
        <SearchOptions jobId={id} />
        <CandidateTable jobId={id} />
      </div>
    </div>
  );
};

export default Candidates;
