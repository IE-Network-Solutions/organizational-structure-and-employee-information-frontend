'use client';
import React from 'react';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllowanceTypeTable from './_components/allowanceTypeTable';
import AllowanceTypeSideBar from './_components/allowanceTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { FaPlus } from 'react-icons/fa';

const AllowanceTypePage = () => {
  const { setIsAllowanceOpen } = useCompensationSettingStore();

  return (
    <div
      className="bg-white rounded-lg px-1 py-4 sm:px-6 "
      id="compensation-settings-allowance-type-wrapper"
      data-cy="compensation-settings-allowance-type-wrapper"
    >
      <div
        className="flex justify-between mb-3 items-center"
        id="compensation-settings-allowance-type-header"
        data-cy="compensation-settings-allowance-type-header"
      >
        <h1
          className="text-lg font-bold"
          id="compensation-settings-allowance-type-title"
          data-cy="compensation-settings-allowance-type-title"
        >
          Allowance Types
        </h1>
        <AccessGuard
          permissions={[Permissions.CreateAllowanceType]}
          data-cy="compensation-settings-allowance-type-create-access-guard"
        >
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus data-cy="compensation-settings-allowance-type-create-icon" />}
            className="h-10"
            onClick={() => {
              setIsAllowanceOpen(true);
            }}
            data-cy="compensation-settings-allowance-type-create-button"
          >
            <span
              className="hidden lg:inline"
              id="compensation-settings-allowance-type-create-button-text"
              data-cy="compensation-settings-allowance-type-create-button-text"
            >
              Allowance
            </span>
          </Button>
        </AccessGuard>
      </div>

      <AllowanceTypeSideBar data-cy="compensation-settings-allowance-type-sidebar" />
      <div
        id="compensation-settings-allowance-type-table-wrapper"
        data-cy="compensation-settings-allowance-type-table-wrapper"
      >
        <AllowanceTypeTable data-cy="compensation-settings-allowance-type-table" />
      </div>
    </div>
  );
};

export default AllowanceTypePage;
