'use client';
import React from 'react';
import BreakTypeSidebar from './_component/brakTypeSidebar';
import BreakTypeTable from './_component/breakTypeTable/inex';

const Page = () => {
  return (
    <div
      id="time-attendance-settings-break-type-container"
      data-cy="time-attendance-settings-break-type-container"
    >
      <div
        className="w-full"
        id="time-attendance-settings-break-type-table-container"
        data-cy="time-attendance-settings-break-type-table-container"
      >
        <BreakTypeTable data-cy="time-attendance-settings-break-type-table" />
      </div>
      <BreakTypeSidebar data-cy="time-attendance-settings-break-type-sidebar" />
    </div>
  );
};

export default Page;
