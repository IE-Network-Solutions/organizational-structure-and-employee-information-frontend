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
    <div className="p-5 rounded-2xl bg-white ">
      <div className="flex justify-between mb-4">
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
            <span className="hidden lg:inline"> New Benefit Type</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="flex overflow-x-auto scrollbar-none w-full ">
        <BenefitTypeTable />
      </div>
      <BenefitypeSideBar />
    </div>
  );
};

export default BenefitTypePage;
