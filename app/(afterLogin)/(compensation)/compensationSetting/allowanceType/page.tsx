'use client';
import React from 'react';
import { Button, Divider } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllowanceTypeTable from './_components/allowanceTypeTable';
import AllowanceTypeSideBar from './_components/allowanceTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { FaPlus } from 'react-icons/fa';
import PageHeader from '@/components/common/pageHeader/pageHeader';

const AllowanceTypePage = () => {
  const { setIsAllowanceOpen, setSelectedAllowanceRecord } =
    useCompensationSettingStore();

  return (
    <div
      className="bg-white rounded-lg px-1 py-4 sm:px-6 sm:mr-4"
      id="compensation-settings-allowance-type-wrapper"
      data-cy="compensation-settings-allowance-type-wrapper"
    >
      <div
        className="block sm:hidden pb-3 px-3"
        id="compensation-settings-allowance-type-mobile-header-wrapper"
        data-cy="compensation-settings-allowance-type-mobile-header-wrapper"
      >
        <div
          className="flex items-center justify-between gap-3"
          data-cy="compensation-settings-allowance-type-mobile-header-row"
        >
          <PageHeader
            title="Allowance Types"
            horizontalPadding="0px"
            data-cy="compensation-settings-allowance-type-mobile-page-header"
          />
          <AccessGuard
            permissions={[Permissions.CreateAllowanceType]}
            data-cy="compensation-settings-allowance-type-create-access-guard-mobile"
          >
            <Button
              type="primary"
              className="h-10 w-10 sm:w-auto rounded-md"
              icon={
                <FaPlus data-cy="compensation-settings-allowance-type-create-icon" />
              }
              onClick={() => {
                setSelectedAllowanceRecord(null);
                setIsAllowanceOpen(true);
              }}
              data-cy="compensation-settings-allowance-type-create-button"
            />
          </AccessGuard>
        </div>
      </div>

      <Divider className="!my-0 !border-gray-200" />
      <div
        className="hidden sm:flex flex-wrap justify-between items-center gap-4 pt-4 pb-6"
        id="compensation-settings-allowance-type-header"
        data-cy="compensation-settings-allowance-type-header"
      >
        <h1
          className="text-2xl font-bold text-gray-900 leading-8"
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
            icon={
              <FaPlus data-cy="compensation-settings-allowance-type-create-icon" />
            }
            className="h-10 text-sm font-medium rounded-md"
            onClick={() => {
              setSelectedAllowanceRecord(null);
              setIsAllowanceOpen(true);
            }}
            data-cy="compensation-settings-allowance-type-create-button-desktop"
          >
            <span
              className="hidden sm:inline"
              id="compensation-settings-allowance-type-create-button-text"
              data-cy="compensation-settings-allowance-type-create-button-text"
            >
              Add Allowance Type
            </span>
          </Button>
        </AccessGuard>
      </div>
      <Divider className="!my-0 !border-gray-200" />

      <AllowanceTypeSideBar data-cy="compensation-settings-allowance-type-sidebar" />
      <div
        className="px-3 sm:px-0"
        id="compensation-settings-allowance-type-table-wrapper"
        data-cy="compensation-settings-allowance-type-table-wrapper"
      >
        <AllowanceTypeTable data-cy="compensation-settings-allowance-type-table" />
      </div>
    </div>
  );
};

export default AllowanceTypePage;
