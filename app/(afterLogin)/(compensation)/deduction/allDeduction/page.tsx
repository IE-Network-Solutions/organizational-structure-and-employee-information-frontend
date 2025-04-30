'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllDeductionTable from './_components/allDeductionTable';

const AllAllowancePage = () => {
  return (
    <>
      <PageHeader title="All Deduction Entitlement" size="small">
        <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={() => {}}
            disabled
          >
            Employees
          </Button>
        </AccessGuard>
      </PageHeader>
      <AllDeductionTable />
    </>
  );
};

export default AllAllowancePage;
