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
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';
// import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

const TalentPoolPage = () => {
  const { isAddCandidateVisible, setIsAddCandidateVisible } = useInternStore();

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
      className="px-2 sm:px-4 py-3"
    >
      <Filters />
      <CandidateTable />
      <AddCandidate open={isAddCandidateVisible} onClose={handleClose} />
    </div>
  );
};

export default TalentPoolPage;
