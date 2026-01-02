import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import SearchEmployee from './_components/edit-accessFilter';
import EditAccessTable from './_components/edit-accessTable';

const OKREditAccess: React.FC = () => {
  return (
    <div
      className="p-5 rounded-2xl bg-white"
      id="okr-edit-access-container"
      data-cy="okr-edit-access-container"
    >
      <CustomBreadcrumb
        title="Objective Edit Access"
        subtitle=""
        data-cy="okr-edit-access-breadcrumb"
      />

      <SearchEmployee data-cy="okr-edit-access-search-component" />

      <EditAccessTable data-cy="okr-edit-access-table-component" />
    </div>
  );
};

export default OKREditAccess;
