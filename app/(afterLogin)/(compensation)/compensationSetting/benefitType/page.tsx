'use client';
import React from 'react';
import { Button, Divider } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import BenefitTypeCardGrid from './_components/benefitTypeCardGrid';
import BenefitypeSideBar from './_components/benefitTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { FaPlus } from 'react-icons/fa';

const BenefitTypePage = () => {
  const { setIsBenefitOpen } = useCompensationSettingStore();

  return (
    <div
      className="bg-white rounded-lg px-4 py-6 sm:px-6"
      id="compensation-settings-benefit-type-wrapper"
      data-cy="compensation-settings-benefit-type-wrapper"
    >
      <Divider className="!my-0 !border-gray-200" />
      <div
        className="flex flex-wrap justify-between items-center gap-4 pt-4 pb-6"
        id="compensation-settings-benefit-type-header"
        data-cy="compensation-settings-benefit-type-header"
      >
        <h1
          className="text-2xl font-bold text-gray-900 leading-8"
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
            className="h-10 text-sm font-medium rounded-md"
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
              Add Benefit Type
            </span>
          </Button>
        </AccessGuard>
      </div>
      <Divider className="!my-0 !border-gray-200" />
      <div
        id="compensation-settings-benefit-type-card-grid-wrapper"
        data-cy="compensation-settings-benefit-type-card-grid-wrapper"
      >
        <BenefitTypeCardGrid data-cy="compensation-settings-benefit-type-card-grid" />
      </div>
      <BenefitypeSideBar data-cy="compensation-settings-benefit-type-sidebar" />
    </div>
  );
};

export default BenefitTypePage;
