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
  const { setIsDeductionOpen } = useCompensationSettingStore();

  return (
    <div className="p-5 rounded-2xl bg-white ">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-bold">Deduction Types</h1>
        <AccessGuard permissions={[Permissions.CreateBenefitType]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            className="h-10"
            onClick={() => {
              setIsDeductionOpen(true);
            }}
          >
            <span className="hidden lg:inline"> New Deduction Type</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="flex overflow-x-auto scrollbar-none w-full ">
        <DeductionTypeTable />
      </div>
      <DeductiontypeSideBar />
    </div>
  );
};

export default DeductionTypePage;
