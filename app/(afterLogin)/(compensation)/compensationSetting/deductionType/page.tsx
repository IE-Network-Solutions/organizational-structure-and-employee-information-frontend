'use client';
import React from 'react';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import DeductionTypeTable from './_components/DeductionTypeTable';
// import BenefitypeSideBar from './_components/DeductiontypeSideBar';
import DeductiontypeSideBar from './_components/DeductiontypeSideBar';
import { FaPlus } from 'react-icons/fa';

const DeductionTypePage = () => {
  const { setIsDeductionOpen, setSelectedDeductionRecord } =
    useCompensationSettingStore();

  return (
    <div
      className="bg-white rounded-lg px-1 py-4 sm:px-6"
      id="compensation-settings-deduction-type-wrapper"
      data-cy="compensation-settings-deduction-type-wrapper"
    >
      <div
        className="flex justify-between mb-3 items-center"
        id="compensation-settings-deduction-type-header"
        data-cy="compensation-settings-deduction-type-header"
      >
        <h1
          className="text-lg font-bold"
          id="compensation-settings-deduction-type-title"
          data-cy="compensation-settings-deduction-type-title"
        >
          Deduction Types
        </h1>
        <AccessGuard
          permissions={[Permissions.CreateBenefitType]}
          data-cy="compensation-settings-deduction-type-create-access-guard"
        >
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={
              <FaPlus data-cy="compensation-settings-deduction-type-create-icon" />
            }
            className="h-10"
            onClick={() => {
              setSelectedDeductionRecord(null);
              setIsDeductionOpen(true);
            }}
            data-cy="compensation-settings-deduction-type-create-button"
          >
            <span
              className="hidden lg:inline"
              id="compensation-settings-deduction-type-create-button-text"
              data-cy="compensation-settings-deduction-type-create-button-text"
            >
              Deduction
            </span>
          </Button>
        </AccessGuard>
      </div>
      <div
        id="compensation-settings-deduction-type-table-wrapper"
        data-cy="compensation-settings-deduction-type-table-wrapper"
      >
        <DeductionTypeTable />
      </div>
      <DeductiontypeSideBar data-cy="compensation-settings-deduction-type-sidebar" />
    </div>
  );
};

export default DeductionTypePage;
