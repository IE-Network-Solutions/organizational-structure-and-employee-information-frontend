import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import SearchEmployee from './_components/edit-accessFilter';
import EditAccessTable from './_components/edit-accessTable';

const OKREditAccess: React.FC = () => {
  return (
    <div className="p-10">
      <CustomBreadcrumb title="Objective Edit Access" subtitle="" />
      <SearchEmployee />
      <EditAccessTable />
    </div>
  );
};

export default OKREditAccess;
