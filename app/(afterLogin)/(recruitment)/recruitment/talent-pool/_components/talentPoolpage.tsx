'use client';
import React, { useState } from 'react';
import Filters from './filters';
import CandidateTable from './talentPoolTable';
import AddCandidate from './addDrawer';
import CustomButton from '@/components/common/buttons/customButton';
import { FaPlus } from 'react-icons/fa';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
// import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

const TalentPoolPage = () => {
  const [isAddCandidateVisible, setIsAddCandidateVisible] = useState(false);

  const handleAdd = () => {
    setIsAddCandidateVisible(true);
  };

  const handleClose = () => {
    setIsAddCandidateVisible(false);
  };
  //const { setOpen } = useEmployeeManagementStore();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <CustomBreadcrumb
          title="Talent Pool"
          subtitle="This is the talent pool data of the candidates"
        />
        <div className="flex items-center my-4 gap-4 md:gap-8">
          <AccessGuard permissions={[Permissions.TransferCandidate]}>
            <CustomButton
              title="Add Candidate to Talent Pool"
              id="createUserButton"
              icon={<FaPlus className="mr-2" />}
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700"
            />
          </AccessGuard>
        </div>
      </div>

      <Filters />
      <CandidateTable />
      <AddCandidate open={isAddCandidateVisible} onClose={handleClose} />
    </div>
  );
};

export default TalentPoolPage;
