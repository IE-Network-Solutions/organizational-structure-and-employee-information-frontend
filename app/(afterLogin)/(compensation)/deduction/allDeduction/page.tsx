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
    <div
      className="bg-white rounded-lg px-1 py-4 sm:p-6"
      id="compensation-deduction-all-wrapper"
      data-cy="compensation-deduction-all-wrapper"
    >
      <div
        className="flex justify-between items-center"
        id="compensation-deduction-all-header"
        data-cy="compensation-deduction-all-header"
      >
        <PageHeader
          title="All Deductions"
          size="small"
          horizontalPadding="px-0"
          data-cy="compensation-deduction-all-page-header"
        />
        <AccessGuard
          permissions={[Permissions.CreateAllowanceEntitlement]}
          data-cy="compensation-deduction-all-create-access-guard"
          id="compensation-deduction-all-create-access-guard"
        >
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={
              <FaPlus data-cy="compensation-deduction-all-create-button-icon" />
            }
            onClick={() => {}}
            className="h-10 w-10 sm:w-auto"
            disabled
            data-cy="compensation-deduction-all-create-button"
          >
            <span
              className="hidden sm:inline"
              id="compensation-deduction-all-create-button-text"
              data-cy="compensation-deduction-all-create-button-text"
            >
              Employees
            </span>
          </Button>
        </AccessGuard>
      </div>

      <div
        id="compensation-deduction-all-table-wrapper"
        data-cy="compensation-deduction-all-table-wrapper"
      >
        <AllDeductionTable data-cy="compensation-deduction-all-table" />
      </div>
    </div>
  );
};

export default AllAllowancePage;
