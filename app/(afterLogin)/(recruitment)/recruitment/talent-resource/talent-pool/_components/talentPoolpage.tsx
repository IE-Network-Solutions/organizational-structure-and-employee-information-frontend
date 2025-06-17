'use client';
import React, { useState } from 'react';
import Filters from './filters';
import CandidateTable from './talentPoolTable';
import AddCandidate from './addDrawer';
import { FaPlus } from 'react-icons/fa';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';
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
    <div className="p-6 ">
      <div className="flex justify-between items-center">
        <CustomBreadcrumb
          title="Talent Pool"
          subtitle="This is the talent pool data of the candidates"
        />
        <div className="flex items-center my-4 gap-4 md:gap-8">
          <AccessGuard permissions={[Permissions.TransferCandidate]}>
            <Button
              type="primary"
              id="createUserButton"
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus />}
              onClick={handleAdd}
            >
              <span className="hidden sm:inline">
                Add Candidate to Talent Pool
              </span>
            </Button>
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
