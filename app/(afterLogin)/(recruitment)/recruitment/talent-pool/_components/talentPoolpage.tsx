'use client';
import React, { useState } from 'react';
import Filters from './filters';
import CandidateTable from './talentPoolTable';
import Pagination from './pagination';
import { Button } from 'antd';
import AddCandidate from './addDrawer';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

const TalentPoolPage = () => {
  const [isAddCandidateVisible, setIsAddCandidateVisible] = useState(false);

  const handleAdd = () => {
    setIsAddCandidateVisible(true);
  };

  const handleClose = () => {
    setIsAddCandidateVisible(false);
  };
  const { setOpen } = useEmployeeManagementStore();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Talent Pool</h2>
          <div className="text-xl font-bold mb-4">
            This is the talent pool data of the candidates
          </div>
        </div>
        <Button className="h-12" type="primary" onClick={handleAdd}>
          Add Candidate
        </Button>
      </div>

      <Filters />
      <CandidateTable />
      <Pagination />
      <AddCandidate open={isAddCandidateVisible} onClose={handleClose} />
    </div>
  );
};

export default TalentPoolPage;
