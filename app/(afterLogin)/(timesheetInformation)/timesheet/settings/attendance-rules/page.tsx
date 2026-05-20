'use client';
import React from 'react';
import TypeTable from './_components/typeTable';
import AddTypeSidebar from './_components/addTypeSidebar';
import CreateRuleSidebar from './_components/createRuleSidebar';

const Page = () => {
  return (
    <div
      id="time-attendance-settings-attendance-rules-container"
      data-cy="time-attendance-settings-attendance-rules-container"
    >
      <TypeTable data-cy="time-attendance-settings-attendance-rules-type-table" />
      <AddTypeSidebar data-cy="time-attendance-settings-attendance-rules-add-type-sidebar" />
      <CreateRuleSidebar data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar" />
    </div>
  );
};

export default Page;
