'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import EmploymentStatus from './_components/employmentStatus';

const EmployeeOffboarding = () => {
  return (
    <div className="h-auto w-full p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb title="Employees" subtitle="Offboarding" />
        <div className="w-full h-auto">
          <EmploymentStatus />
        </div>
      </div>
    </div>
  );
};

export default EmployeeOffboarding;
