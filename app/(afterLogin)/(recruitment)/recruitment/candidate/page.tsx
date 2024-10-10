'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import CreateCandidate from './createCandidate';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';

const Candidates: React.FC = () => {
  const { setCreateJobDrawer } = useCandidateState();
  const showDrawer = () => {
    setCreateJobDrawer(true);
  };
  const onClose = () => {
    setCreateJobDrawer(false);
  };

  return (
    <div className="h-auto w-full p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Candidates"
          subtitle="This is the data of all candidates who applied"
        />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <CustomButton
            title="Add candidates"
            id="createUserButton"
            icon={<FaPlus className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <CreateCandidate onClose={onClose} />
        </div>
      </div>
      <div className="w-full h-auto">
        {/* <EmployeeSearch /> */}
        {/* <UserTable /> */}
      </div>
    </div>
  );
};

export default Candidates;
