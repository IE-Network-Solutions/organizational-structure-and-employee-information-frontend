'use client';

import React from 'react';
import EmployeePerformanceTable from './_components/EmployeePerformanc';

export default function EmployeesOKRPage() {
  return (
    <div className="p-4">
      <EmployeePerformanceTable data-cy="okr-all-employee-okr-table" />
    </div>
  );
}