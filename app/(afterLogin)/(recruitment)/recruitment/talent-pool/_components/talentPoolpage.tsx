'use client';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';
import React from 'react';
import Filters from './filters';
import CandidateTable from './candidateTable';
import Pagination from './pagination';

const TalentPoolPage = () => {
  const { candidates, pagination } = useTalentPoolStore();

  const currentCandidates = candidates.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize,
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Talent Pool</h2>
      <Filters />

      <CandidateTable candidates={currentCandidates} />

      <Pagination />
    </div>
  );
};

export default TalentPoolPage;
