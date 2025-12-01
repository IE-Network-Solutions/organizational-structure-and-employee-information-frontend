'use client';
import React from 'react';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import BenefitTypeTable from './_components/benefitTypeTable';
import BenefitypeSideBar from './_components/benefitTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { FaPlus } from 'react-icons/fa';

const BenefitTypePage = () => {
  const { setIsBenefitOpen } = useCompensationSettingStore();

  return (
    <div
      className="bg-white rounded-lg px-1 py-4 sm:px-6"
      id="compensation-settings-benefit-type-wrapper"
      data-cy="compensation-settings-benefit-type-wrapper"
    >
      <div
        className="flex justify-between mb-3 items-center"
        id="compensation-settings-benefit-type-header"
        data-cy="compensation-settings-benefit-type-header"
      >
        <h1
          className="text-lg font-bold"
          id="compensation-settings-benefit-type-title"
          data-cy="compensation-settings-benefit-type-title"
        >
          Benefit Types
        </h1>
        <AccessGuard
          permissions={[Permissions.CreateBenefitType]}
          data-cy="compensation-settings-benefit-type-create-access-guard"
        >
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={
              <FaPlus data-cy="compensation-settings-benefit-type-create-icon" />
            }
            className="h-10"
            onClick={() => {
              setIsBenefitOpen(true);
            }}
            data-cy="compensation-settings-benefit-type-create-button"
          >
            <span
              className="hidden lg:inline"
              id="compensation-settings-benefit-type-create-button-text"
              data-cy="compensation-settings-benefit-type-create-button-text"
            >
              Benefit
            </span>
          </Button>
        </AccessGuard>
      </div>
      <div
        id="compensation-settings-benefit-type-table-wrapper"
        data-cy="compensation-settings-benefit-type-table-wrapper"
      >
        <BenefitTypeTable data-cy="compensation-settings-benefit-type-table" />
      </div>
      <BenefitypeSideBar data-cy="compensation-settings-benefit-type-sidebar" />
    </div>
  );
};

export default BenefitTypePage;
