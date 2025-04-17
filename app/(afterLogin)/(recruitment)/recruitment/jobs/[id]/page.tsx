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
import { IoIosArrowForward } from 'react-icons/io';

interface Params {
  id: string;
}

interface CandidateProps {
  params: Params;
}
const Candidates = ({ params: { id } }: CandidateProps) => {
  const { setCreateJobDrawer } = useCandidateState();
  const { data: jobById } = useGetJobsByID(id);

  const showDrawer = () => {
    setCreateJobDrawer(true);
  };
  const onClose = () => {
    setCreateJobDrawer(false);
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
    <div className="h-auto w-full p-4  bg-white">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Recruitment"
          subtitle={customBreadCrumbSubTitle}
        />
        <div className="flex items-center my-4 gap-4 md:gap-8">
          <WhatYouNeed />
          <CustomButton
            title="Add candidate"
            id="createUserButton"
            icon={<FaPlus className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <CreateCandidate jobId={id} onClose={onClose} />
        </div>
      </div>
      <div className="w-full h-auto">
        <SearchOptions jobId={id} />
        <CandidateTable jobId={id} />
      </div>
    </div>
  );
};

export default Candidates;
