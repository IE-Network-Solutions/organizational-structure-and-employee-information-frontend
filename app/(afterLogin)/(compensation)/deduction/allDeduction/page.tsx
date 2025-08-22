'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllDeductionTable from './_components/allDeductionTable';
import { FaPlus } from 'react-icons/fa';

const AllAllowancePage = () => {
  return (
    <div className="bg-white rounded-lg px-1 py-4 sm:p-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="All Deductions"
          size="small"
          horizontalPadding="px-0"
        />
        <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            onClick={() => {}}
            className="h-10 w-10 sm:w-auto"
            disabled
          >
            <span className="hidden sm:inline">Employees</span>
          </Button>
        </AccessGuard>
      </div>

      <div>
        <AllDeductionTable />
      </div>
    </div>
  );
};

export default AllAllowancePage;
