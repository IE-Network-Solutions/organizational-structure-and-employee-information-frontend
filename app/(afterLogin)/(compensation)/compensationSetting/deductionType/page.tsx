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
    <div className="bg-white rounded-lg px-1 py-4 sm:px-6">
      <div className="flex justify-between mb-3 items-center">
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
            <span className="hidden lg:inline">Deduction</span>
          </Button>
        </AccessGuard>
      </div>
      <div>
        <DeductionTypeTable />
      </div>
      <DeductiontypeSideBar />
    </div>
  );
};

export default DeductionTypePage;
