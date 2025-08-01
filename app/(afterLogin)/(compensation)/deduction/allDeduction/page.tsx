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
    <>
      <PageHeader title="All Deductions" size="small">
        <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            onClick={() => {}}
            disabled
          >
            <span className="hidden sm:inline">Employees</span>
          </Button>
        </AccessGuard>
      </PageHeader>
      <div className="overflow-x-auto">
        <AllDeductionTable />
      </div>
    </>
  );
};

export default AllAllowancePage;
