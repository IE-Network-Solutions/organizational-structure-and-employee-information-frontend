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
    <div
      id="talent-acquisition-talent-pool-page-div-container"
      data-cy="talent-acquisition-talent-pool-page-div-container"
      className="h-auto w-full bg-white"
    >
      <div
        id="talent-acquisition-talent-pool-page-div-header"
        data-cy="talent-acquisition-talent-pool-page-div-header"
        className="flex justify-between items-center"
      >
        <CustomBreadcrumb
          data-cy="talent-acquisition-talent-pool-page-breadcrumb"
          title="Talent Pool"
          subtitle="This is the talent pool data of the candidates"
        />
        <div
          id="talent-acquisition-talent-pool-page-div-actions"
          data-cy="talent-acquisition-talent-pool-page-div-actions"
          className="flex items-center my-4 gap-4 md:gap-8"
        >
          <AccessGuard permissions={[Permissions.TransferCandidate]}>
            <Button
              type="primary"
              id="createUserButton"
              data-cy="talent-acquisition-talent-pool-page-button-add"
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
