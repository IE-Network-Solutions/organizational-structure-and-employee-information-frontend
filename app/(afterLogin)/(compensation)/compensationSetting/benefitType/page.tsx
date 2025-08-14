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
    <div className="bg-white rounded-lg px-1 py-4 sm:px-6">
      <div className="flex justify-between mb-3 items-center">
        <h1 className="text-lg font-bold">Benefit Types</h1>
        <AccessGuard permissions={[Permissions.CreateBenefitType]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            className="h-10"
            onClick={() => {
              setIsBenefitOpen(true);
            }}
          >
            <span className="hidden lg:inline">Benefit</span>
          </Button>
        </AccessGuard>
      </div>
      <div>
        <BenefitTypeTable />
      </div>
      <BenefitypeSideBar />
    </div>
  );
};

export default BenefitTypePage;
