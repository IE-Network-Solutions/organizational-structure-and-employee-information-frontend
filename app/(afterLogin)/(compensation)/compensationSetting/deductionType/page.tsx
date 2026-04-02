'use client';
import React from 'react';
import { Button, Divider } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import DeductionTypeCardGrid from './_components/deductionTypeCardGrid';
import DeductiontypeSideBar from './_components/DeductiontypeSideBar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { FaPlus } from 'react-icons/fa';
import PageHeader from '@/components/common/pageHeader/pageHeader';

const DeductionTypePage = () => {
  const { setIsDeductionOpen, setSelectedDeductionRecord } =
    useCompensationSettingStore();

  return (
    <div
      className="bg-white rounded-lg px-1 py-4 sm:px-6 sm:mr-4"
      id="compensation-settings-deduction-type-wrapper"
      data-cy="compensation-settings-deduction-type-wrapper"
    >
      {/* Mobile header */}
      <div
        className="block sm:hidden pb-3 px-3"
        id="compensation-settings-deduction-type-mobile-header-wrapper"
        data-cy="compensation-settings-deduction-type-mobile-header-wrapper"
      >
        <div
          className="flex items-center justify-between gap-3"
          data-cy="compensation-settings-deduction-type-mobile-header-row"
        >
          <PageHeader
            title="Deduction Types"
            horizontalPadding="0px"
            data-cy="compensation-settings-deduction-type-mobile-page-header"
          />
          <AccessGuard
            permissions={[Permissions.CreateBenefitType]}
            data-cy="compensation-settings-deduction-type-create-access-guard-mobile"
          >
            <Button
              type="primary"
              className="h-10 w-10 sm:w-auto rounded-md"
              icon={
                <FaPlus data-cy="compensation-settings-deduction-type-create-icon" />
              }
              onClick={() => {
                setSelectedDeductionRecord(null);
                setIsDeductionOpen(true);
              }}
              data-cy="compensation-settings-deduction-type-create-button"
            />
          </AccessGuard>
        </div>
      </div>

      <Divider className="!my-0 !border-gray-200" />
      <div
        className="hidden sm:flex flex-wrap justify-between items-center gap-4 pt-4 pb-6"
        id="compensation-settings-deduction-type-header"
        data-cy="compensation-settings-deduction-type-header"
      >
        <h1
          className="text-2xl font-bold text-gray-900 leading-8"
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
            className="h-10 text-sm font-medium rounded-md"
            onClick={() => {
              setSelectedDeductionRecord(null);
              setIsDeductionOpen(true);
            }}
            data-cy="compensation-settings-deduction-type-create-button"
          >
            <span
              className="hidden sm:inline"
              id="compensation-settings-deduction-type-create-button-text"
              data-cy="compensation-settings-deduction-type-create-button-text"
            >
              Add Deduction Type
            </span>
          </Button>
        </AccessGuard>
      </div>
      <Divider className="!my-0 !border-gray-200" />
      <div
        className="px-3 sm:px-0"
        id="compensation-settings-deduction-type-card-grid-wrapper"
        data-cy="compensation-settings-deduction-type-card-grid-wrapper"
      >
        <DeductionTypeCardGrid data-cy="compensation-settings-deduction-type-card-grid" />
      </div>
      <DeductiontypeSideBar data-cy="compensation-settings-deduction-type-sidebar" />
    </div>
  );
};

export default DeductionTypePage;
